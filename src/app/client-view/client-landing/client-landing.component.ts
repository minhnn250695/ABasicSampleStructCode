import { Component, OnDestroy, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

// services
import { ApiDataResult } from '../../common/api/api-data-result';
import { ApiResult } from '../../common/api/api-result';
import { BaseComponentComponent } from '../../common/components/base-component/base-component.component';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ConfigService } from '../../common/services/config-service';
import { ThirdPartyService } from '../../third-party/third-party.service';
import { ClientViewService } from '../client-view.service';
// models
import { Contact, HouseHoldResponse, RetirementProjectionModel, ScenarioCashFlow, ScenarioPersonalProtection, ScenarioDetailsModel, ScenarioDebt, ScenarioAsset } from '../models';
import { CashFlowCurrent } from '../models/current-scenario/cash-flow-current.model';
import { CurrentScenarioModel } from '../models/current-scenario/current-scenario.model';
import { GoalsModel } from '../models/goals.model';
import { AdviceBuilderService, FamilyMembers } from '../advice-builder/advice-builder.service';
import { HandleErrorMessageService } from '../../common/services/handle-error.service';
import { ISubscription } from 'rxjs/Subscription';
@Component({
  selector: 'app-client-landing',
  templateUrl: './client-landing.component.html',
  styleUrls: ['./client-landing.component.css'],
})

export class ClientLandingComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  events: GoalsModel[] = [];
  retirementProjection: RetirementProjectionModel = new RetirementProjectionModel();
  cashFlow: CashFlowCurrent = new CashFlowCurrent();
  assets: ScenarioAsset = new ScenarioAsset();
  debt: ScenarioDebt = new ScenarioDebt();
  personalProtection: ScenarioPersonalProtection = new ScenarioPersonalProtection();
  familyMembers: FamilyMembers[] = [];

  isInvestfitThirdPartyEnabled: boolean = false;
  private houseHoldSubject: BehaviorSubject<HouseHoldResponse> = new BehaviorSubject(null);
  private houseHoldId: string;
  private iSub: ISubscription;
  private duration: number = 0;
  constructor(
    private clientViewService: ClientViewService,
    private thirdPartyService: ThirdPartyService,
    private confirmationDialogService: ConfirmationDialogService,
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    changeDetectorRef: ChangeDetectorRef,
    configService: ConfigService) {
    super(configService);
  }

  ngOnInit() {
    super.onBaseInit();
    this.clientViewService.showLoading();
    this.clientViewService.houseHoldObservable.subscribe(houseHold => {
      if (!houseHold) { return; }
      const ids = houseHold && houseHold.members && houseHold.members.map(item => item.id);
      this.houseHoldId = houseHold.id;
      this.getInvestfitData();
      this.getCurrentScenario(this.houseHoldId);
      this.detectChange();
    }, error => {
      this.clientViewService.hideLoading();
      this.showError(error);
    });
  }

  ngOnDestroy() {
    this.onBaseDestroy();
  }

  getInvestfitData() {
    const user = JSON.parse(localStorage.getItem('authenticatedUser')); // get investfit icon
    if (user.roleAccess && user.roleAccess[0]) {
      if (user.roleAccess[0].name === "PortalBusinessAdmin"
        || user.roleAccess[0].name === "PortalBusinessStaff") {
        this.thirdPartyService.getThirdPartyInfo('Investfit').subscribe(result => {
          this.isInvestfitThirdPartyEnabled = result.enabled;
        });
      }
    }
  }

  getCurrentScenario(houseHoldId: string) {
    this.clientViewService.reloadCurrentScenario(houseHoldId)
      .subscribe((response: ApiDataResult<CurrentScenarioModel>) => {
        this.clientViewService.hideLoading();


        if (response && response.success) {
          this.debt = this.cloneObject(response.data.debt);

          let fullEvents = this.cloneObject(response.data.goals);
          // filter asset in range with strategy duration
          this.events = this.filterGoalInRange(fullEvents, response.data && response.data.strategyDuration);

          this.retirementProjection = this.cloneObject(response.data.retirementProjections);
          this.assets = this.cloneObject(response.data.assets);
          this.personalProtection = this.cloneObject(response.data.personalProtection)
          this.cashFlow = this.cloneObject(response.data.cashFlow);
          this.familyMembers = this.cloneObject(response.data.familyMembers);
          this.duration = response.data.strategyDuration;
          localStorage.setItem("selectedStrategyID", response.data.id);
          localStorage.setItem("currentStrategy", response.data.id);
          this.clientViewService.familyMembers = this.cloneObject(response.data.familyMembers)
          this.getSource();
          this.detectChange();
        }
        else
          this.showError(response);
      }, error => {
        this.confirmationDialogService.showModal({
          title: `Error #${error.status}`,
          message: error.message,
          btnOkText: "Close"
        });
      });
  }

  private reloadLandingPage(event) {
    if (event) {
      this.clientViewService.showLoading();
      this.clientViewService.currentScenario = undefined; //reset storaged current scenario to call API update new value  
      let houseHoldId = localStorage.getItem("houseHoldID");
      this.getCurrentScenario(houseHoldId);
      this.detectChange();
    };
  }

  private filterGoalInRange(availableEvents, strategyDuration) {
    let currentYear = new Date().getFullYear();
    let endYearDuration = currentYear + strategyDuration;
    return availableEvents = availableEvents.filter(event => event.startYear >= currentYear && event.startYear <= endYearDuration);
  }

  IncomeTargetSaveClick(incomeTarget: any) {
    if (incomeTarget || incomeTarget === 0) {
      this.clientViewService.showLoading();
      this.clientViewService.updateRetirementIncomeTarget(
        { retirementIncomeTarget: incomeTarget }, this.houseHoldId)
        .subscribe((response: ApiDataResult<RetirementProjectionModel>) => {
          this.clientViewService.hideLoading();
          if (response.success) {
            this.retirementProjection = this.cloneObject(response.data);
          }
          else {
            this.showError(
              {
                success: false,
                error: response.error
              });
          }
        }, error => {
          this.showError(
            {
              success: false,
              error: { errorCode: 500, errorMessage: "Internal Server Error" }
            });
        });
    } else {
      this.confirmationDialogService.showModal({
        title: "Format error",
        message: "Cannot read your input value. Please type again.",
        btnOkText: "Close"
      });
    }
  }

  private loadDataFromServer(ids: string[]) {
    if (!ids || ids && ids.length === 0 || this.clientViewService.isLoadingData) {
      return;
    }

    this.clientViewService.isLoadingData = true;

    let dataObservables: Array<Observable<any>> = [];
    dataObservables.push(this.clientViewService.clientAssetService.getClientAssetsFor(ids));
    dataObservables.push(this.clientViewService.clientDebtService.getClientDebtsFor(ids));
    dataObservables.push(this.clientViewService.clientInsuranceService.getPersonalInsuranceOutcomesFor(ids));

    /**
     * zip all results as one
     */
    this.iSub = Observable.zip.apply(null, dataObservables).subscribe((res: any[]) => {
      if (this.iSub) {
        this.iSub.unsubscribe();
      }
      this.clientViewService.hideLoading();
      this.clientViewService.isLoadingData = false;
      this.detectChange();
    }, err => {
      this.clientViewService.hideLoading();
      this.clientViewService.isLoadingData = false;
    });
  }


  private getSource() {
    let dataObservables: Array<Observable<any>> = [];
    let houseHoldId = localStorage.getItem("houseHoldID");
    let strategyId = localStorage.getItem("selectedStrategyID");
    let i = -1;
    dataObservables.push(this.adviceBuilderService.getAvailableAssetList(houseHoldId, strategyId, true));
    dataObservables.push(this.adviceBuilderService.getDebtList(houseHoldId, strategyId));
    /**
     * zip all results as one
     */
    this.iSub = Observable.zip.apply(null, dataObservables).subscribe((response: any[]) => {
      if (this.iSub) {
        this.iSub.unsubscribe();
      }
      if (response && response.length > 0) {
        if (i == -1) {
          i++;
          if (response[0] && response[0].success)
            this.adviceBuilderService.notClosedAssetList = response[0].data;
          else {
            this.handleErrorMessageService.handleErrorResponse(response[i]);
          }
        }
        if (i == 0) {
          i++;
          if (response[1] && response[1].success)
            this.adviceBuilderService.debtList = response[1].data;
          else {
            this.handleErrorMessageService.handleErrorResponse(response[i]);
          }
        }
      }
    });
  }

  private durationSaveChanges() {
    let houseHoldID = localStorage.getItem('houseHoldID');
    this.adviceBuilderService.showLoading();
    this.clientViewService.updateStrategyDuration(this.duration, houseHoldID).subscribe(res => {
      this.adviceBuilderService.hideLoading();
      if (res && res.success) {
        this.reloadLandingPage(true);
      } else {
        this.handleErrorMessageService.handleErrorResponse(res);
      }
    });
  }

  private showError(obj: ApiResult) {
    if (!obj) return;
    this.confirmationDialogService.showModal({
      title: `Error #${obj.error.errorCode}`,
      message: obj.error.errorMessage,
      btnOkText: "Close"
    });
  }
}
