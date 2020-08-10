import { Component, OnInit, ViewChild } from '@angular/core';
import { AdviceBuilderService } from './advice-builder.service';
import { ScenarioDetailsModel } from '../models/current-scenario/scenario-details.model';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs';
import { HouseHoldResponse } from '../models';
import { HandleErrorMessageService } from '../../common/services/handle-error.service';
import { ClientViewService } from '../client-view.service';

@Component({
  selector: 'app-advice-builder',
  templateUrl: './advice-builder.component.html',
  styleUrls: ['./advice-builder.component.css'],
})
export class AdviceBuilderComponent implements OnInit {
  @ViewChild('alertModal') alertModal: any;

  scenario: ScenarioDetailsModel = new ScenarioDetailsModel();
  selectedStrategyId: string;
  selectedStrategyName: string;
  newStrategyName: string = "New strategy";
  newStrategyId: string;
  currentStrategyId: string = localStorage.getItem('currentStrategy');
  private tempStrategyDeleteIndex: number;
  private iSub: ISubscription;
  private iSubReloadData: ISubscription;
  private duration: number = 0;
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private clientViewService: ClientViewService,
    private router: Router,
    private handleErrorMessageService: HandleErrorMessageService,
  ) {
  }

  ngOnInit() {
    let strategyStoragedNoReload = localStorage.getItem('strategy_storaged_no_reload');
    if (strategyStoragedNoReload == 'true' && this.adviceBuilderService.selectedScenario.scenarioId) {
      localStorage.setItem('strategy_storaged_no_reload', 'false');
      this.selectedStrategyId = this.adviceBuilderService.strategyList[this.adviceBuilderService.selectedStrategyIndex] && this.adviceBuilderService.strategyList[this.adviceBuilderService.selectedStrategyIndex].scenarioId;
      this.selectedStrategyName = localStorage.getItem('selectedStrategyName');
      if (this.selectedStrategyId) {
        localStorage.setItem('selectedStrategyID', this.selectedStrategyId);
      }
    } else {
      this.resetAllDataSerivceStorage();
      this.getAllScenarios();
      this.checkCurrentHouseIDStoraged();
    }

  }

  ngOnDestroy() {
    if (this.iSub) {
      this.iSub.unsubscribe();
    }
  }

  private getAllScenarios() {
    this.adviceBuilderService.showLoading();

    const houseHoldID = localStorage.getItem("houseHoldID");
    this.adviceBuilderService.getScenarioList_v2(houseHoldID).subscribe(response => {
      this.adviceBuilderService.hideLoading();
      if (response.success === true && this.adviceBuilderService.strategyList.length > 0) {
        let scenarioId = localStorage.getItem('selectedStrategyID');
        let index = this.adviceBuilderService.strategyList.findIndex(strategy => strategy.scenarioId == scenarioId);
        if (index && index >= 0)
          this.selectScenario(index);
        else
          this.selectScenario(0)
      }
      else {
        this.handleErrorMessageService.handleErrorResponse(response);
      }
    }, error => {
      console.log('error', error);
      this.adviceBuilderService.hideLoading();
      this.handleErrorMessageService.handleErrorResponse(error);
    });
  }

  private selectScenario(index: number) {
    if (this.adviceBuilderService.strategyList.length > 0) {
      let selectedStrategyID = this.adviceBuilderService.strategyList[index].scenarioId;
      let selectedStrategyName = this.adviceBuilderService.strategyList[index].scenarioName;
      this.adviceBuilderService.selectedStrategyIndex = index;
      if (selectedStrategyID !== this.selectedStrategyId) {
        let houseHoldID = localStorage.getItem('houseHoldID');
        localStorage.setItem('selectedStrategyID', selectedStrategyID);
        localStorage.setItem('selectedStrategyName', selectedStrategyName);
        this.selectedStrategyName = this.adviceBuilderService.strategyList[index].scenarioName;
        this.selectedStrategyId = selectedStrategyID;
        this.newStrategyId = selectedStrategyID;

        this.getAllDataForStrategy();
      }
    }
  }

  private getAllDataForStrategy() {
    let observable: Observable<any>[] = [];
    let houseHoldID = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldID || !selectedStrategyID) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      this.adviceBuilderService.showLoading();
      observable.push(this.adviceBuilderService.getScenarioDetails(houseHoldID, selectedStrategyID));

      observable.push(this.adviceBuilderService.getAvailableAssetList(houseHoldID, selectedStrategyID, true));

      observable.push(this.adviceBuilderService.getDebtList(houseHoldID, selectedStrategyID));

      observable.push(this.adviceBuilderService.getAvailableInsuranceList(houseHoldID, selectedStrategyID, true));

      observable.push(this.adviceBuilderService.getActionList(houseHoldID, selectedStrategyID));

      observable.push(this.adviceBuilderService.getClientIncomesByScenarioId(houseHoldID, selectedStrategyID));

      observable.push(this.adviceBuilderService.getAvailableAssetList(houseHoldID, selectedStrategyID, false));

      observable.push(this.adviceBuilderService.getAvailableInsuranceList(houseHoldID, selectedStrategyID, false));

      // get asset projection 
      observable.push(this.adviceBuilderService.getAssetProjectionByScenarioId(houseHoldID, selectedStrategyID));
      // get debt projection 
      observable.push(this.adviceBuilderService.getDebtProjectionByScenarioId(houseHoldID, selectedStrategyID));
      // get insurance projection 
      observable.push(this.adviceBuilderService.getPersonalInsuranceProjectionByScenarioId(houseHoldID, selectedStrategyID));


      let index = -1;
      this.iSub = Observable.zip.apply(null, observable).subscribe(response => {
        if (this.iSub) {
          this.iSub.unsubscribe();
        }

        this.adviceBuilderService.hideLoading();
        if (response && response.length > 0) {

          // 1. handle strategy details response
          index++;
          if (response[index] && response[index].success) {
            this.scenario = this.adviceBuilderService.selectedScenario = response[index].data;

            let fullEvents = JSON.parse(JSON.stringify(this.scenario.goals));
            // filter asset in range with strategy duration
            this.adviceBuilderService.selectedScenario.goals = this.filterGoalInRange(fullEvents, this.scenario && this.scenario.strategyDuration);

            this.duration = this.scenario.strategyDuration;
            this.adviceBuilderService.cashFlowDetails = this.scenario && this.scenario.cashFlow && this.scenario.cashFlow.details;
            this.adviceBuilderService.familyMembers = response[index] && response[index].data && response[index].data.familyMembers;
            localStorage.setItem("selectedStrategyID", this.scenario.scenarioId);
          }
          else {
            this.handleErrorMessageService.handleErrorResponse(response[index])
          }

          // 2. handle active asset response
          index++;
          if (response[index] && response[index].success) {
            this.adviceBuilderService.notClosedAssetList = response[index].data;
          }
          else {
            this.handleErrorMessageService.handleErrorResponse(response[index])
          }

          // 3. handle active debt response
          index++;
          if (response[index] && response[index].success) {
            this.adviceBuilderService.debtList = response[index].data;
          }
          else {
            this.handleErrorMessageService.handleErrorResponse(response[index])
          }

          // 4. handle active insurance response  
          index++;
          if (response[index] && response[index].success) {
            this.adviceBuilderService.activeInsuranceList = response[index].data;
          }
          else {
            this.handleErrorMessageService.handleErrorResponse(response[index])
          }

          // 5. handle actions list response
          index++;
          if (response[index] && response[index].success) {
            this.adviceBuilderService.actions = response[index].data;
          }
          else {
            this.handleErrorMessageService.handleErrorResponse(response[index])
          }

          // 6. handle client income list
          index++;
          if (response[index] && response[index].success) {
            this.adviceBuilderService.clientIncomeSource = response[index].data;
          }
          else {
            this.handleErrorMessageService.handleErrorResponse(response[index])
          }

          // 7. handle asset closed list
          index++;
          if (response[index] && response[index].success) {
            this.adviceBuilderService.closedAssetList = response[index].data;
          }
          else {
            this.handleErrorMessageService.handleErrorResponse(response[index])
          }

          // 8. hand insurance closed list
          index++;
          if (response[index] && response[index].success) {
            this.adviceBuilderService.closedInsuranceList = response[index].data;
          }
          else {
            this.handleErrorMessageService.handleErrorResponse(response[index])
          }

          // 9. handle asset projections
          index++;
          if (response[index] && response[index].success) {
            this.adviceBuilderService.assetProjections = response[index].data;
          }
          else {
            this.handleErrorMessageService.handleErrorResponse(response[index])
          }

          // 10. handle debt projections
          index++;
          if (response[index] && response[index].success) {
            this.adviceBuilderService.debtProjections = response[index].data;
          }
          else {
            this.handleErrorMessageService.handleErrorResponse(response[index])
          }

          // 11. handle personal insurance projections
          index++;
          if (response[index] && response[index].success) {
            this.adviceBuilderService.insuranceProjection = response[index].data;
          }
          else {
            this.handleErrorMessageService.handleErrorResponse(response[index])
          }
        }
      });
    }
  }

  private filterGoalInRange(availableEvents, strategyDuration) {
    let currentYear = new Date().getFullYear();
    let endYearDuration = currentYear + strategyDuration;
    return availableEvents = availableEvents.filter(event => event.startYear >= currentYear && event.startYear <= endYearDuration);
  }

  private changeCreateNewStrategy(strategy) {
    if (strategy) {
      this.newStrategyName = strategy.scenarioName;
      this.newStrategyId = strategy.scenarioId;
    }
  }

  // private getInvestfitData() {
  //   const user = JSON.parse(localStorage.getItem('authenticatedUser')); // get investfit icon
  //   if (user.roleAccess && user.roleAccess[0]) {
  //     if (user.roleAccess[0].name === "PortalBusinessAdmin"
  //       || user.roleAccess[0].name === "PortalBusinessStaff") {
  //       this.thirdPartyService.getThirdPartyInfo('Investfit').subscribe(result => {
  //         this.isInvestfitThirdPartyEnabled = result.enabled;
  //       });
  //     }
  //   }
  // }

  private durationSaveChanges() {
    let houseHoldID = localStorage.getItem('houseHoldID');
    this.adviceBuilderService.showLoading();
    this.clientViewService.updateStrategyDuration(this.duration, houseHoldID).subscribe(res => {
      if (res && res.success) {
        this.clientViewService.reloadCurrentScenario(houseHoldID).subscribe(response => {
          this.resetAllDataSerivceStorage();
          this.getAllScenarios();
          this.checkCurrentHouseIDStoraged();
        });
      } else {
        this.handleErrorMessageService.handleErrorResponse(res);
      }
    });
  }

  private createStrategyFrom() {
    let strategyId = null;

    // call api create strategy
    this.adviceBuilderService.showLoading();
    let houseHoldId = localStorage.getItem('houseHoldID');
    if (this.newStrategyId != null && this.newStrategyId != undefined)
      strategyId = this.newStrategyId;
    else
      strategyId = this.selectedStrategyId;

    this.adviceBuilderService.createStrategyFrom(houseHoldId, strategyId).subscribe(res => {
      this.adviceBuilderService.hideLoading();
      if (res.success) {
        localStorage.setItem("selectedStrategyID", res.data.scenarioId);
        // reset current selected strategy
        this.adviceBuilderService.selectedScenario = new ScenarioDetailsModel();
        this.router.navigate(["/client-view/advice-builder/strategy-details"])
      } else {
        this.handleErrorMessageService.handleErrorResponse(res);
      }
    });
  }

  private deleteScenario(index: number) {
    const houseHoldID = localStorage.getItem("houseHoldID");
    const scenarioId = this.adviceBuilderService.strategyList[index] && this.adviceBuilderService.strategyList[index].scenarioId;
    this.adviceBuilderService.showLoading();
    this.adviceBuilderService.deleteScenario(houseHoldID, scenarioId).subscribe(response => {
      this.adviceBuilderService.hideLoading();
      this.getAllScenarios();
    });
  }

  private checkCurrentHouseIDStoraged() {
    let houseHoldIDService = this.adviceBuilderService.houseHold && this.adviceBuilderService.houseHold.id;
    let houseHoldIDStorage = localStorage.getItem("houseHoldID");
    if (houseHoldIDService != houseHoldIDStorage) {
      this.adviceBuilderService.houseHold = new HouseHoldResponse();
    }
  }

  private compareStrategy(strategy: ScenarioDetailsModel) {
    this.router.navigate(["/client-view/advice-builder/compare-strategies", { strategy1: this.selectedStrategyId, strategy2: strategy.scenarioId }]);
  }

  private filterCurrentStrategy() {
    let strategies = this.adviceBuilderService.strategyList.filter(item => item.scenarioId != this.selectedStrategyId);
    return strategies;
  }

  private resetAllDataSerivceStorage() {
    this.adviceBuilderService.selectedScenario = new ScenarioDetailsModel();
    this.adviceBuilderService.notClosedAssetList = [];
    this.adviceBuilderService.debtList = [];
    this.adviceBuilderService.activeInsuranceList = [];
    this.adviceBuilderService.clientIncomeSource = [];
    this.selectedStrategyId = undefined;
  }

  private confirmDeleteStrategy(index: number) {
    this.tempStrategyDeleteIndex = index;
    this.alertModal.show();
  }

  private getAlertMessage() {
    return "Are you sure you want to delete this strategy? This process cannot be undone.";
  }

  private compareStrategies(strategy: ScenarioDetailsModel) {
    let strategy1: string = "";
    let strategy2: string = "";
    if (strategy.scenarioId === this.currentStrategyId) {
      strategy1 = strategy.scenarioId;
      strategy2 = this.selectedStrategyId;
    }
    else {
      strategy1 = this.selectedStrategyId;
      strategy2 = strategy.scenarioId;
    }

    this.router.navigate(['/client-view/advice-builder/compare-strategies', { strategy1: strategy1, strategy2: strategy2 }]);
  }
}
