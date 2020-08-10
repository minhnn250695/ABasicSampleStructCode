import { Component, OnInit, Input, SimpleChanges, SimpleChange } from '@angular/core';
import { OptionModel } from '../../../../on-boarding/models';
import { HouseHoldResponse, Contact, ScenarioDetailsModel, ActionModel, ActionType, AssetActionModel, InsurancePolicyActionModel, CloseAssetActionModel, TransferAssetToDebtActionModel, TransferAssetToAssetModel, DebtActionModel, CancelInsurancePolicyActionModel, ContributeAssetActionModel, ContributeDebtActionModel, DrawFundFromAssetModel, DrawFundFromDebtModel } from '../../../models';
import { OnBoardingCommonComponent } from '../../../../on-boarding/on-boarding-common.component';
import { AdviceBuilderService } from '../../advice-builder.service';
import { ClientViewService } from '../../../client-view.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IfObservable } from 'rxjs/observable/IfObservable';
import { Action } from 'rxjs/scheduler/Action';
import { HandleErrorMessageService } from '../../../../common/services/handle-error.service';
import { OnBoardingService } from '../../../../on-boarding/on-boarding.service';
import { ISubscription } from 'rxjs/Subscription';
declare var $: any;

@Component({
  selector: 'my-current-action',
  templateUrl: './current-action.component.html',
  styleUrls: ['./current-action.component.css'],
})
export class CurrentActionComponent extends OnBoardingCommonComponent implements OnInit {

  @Input() scenario: ScenarioDetailsModel = new ScenarioDetailsModel();
  @Input() activeAssetList: any[] = [];
  @Input() activeDebtList: any[] = [];
  @Input() closedAssetList: any[] = [];
  @Input() closedInsuranceList: any[] = [];
  @Input() activeInsuranceList: any[] = [];
  @Input() strategicActions: ActionModel[] = [];

  private ownerShipTypes: Array<OptionModel<any>> = [];
  private frequencyList: Array<OptionModel<any>> = [];
  private clientList: Array<OptionModel<any>> = [];
  private insuranceCompanies: Array<OptionModel<any>> = [];
  private superannuationAccounts: Array<OptionModel<any>> = [];
  private actionsFilterList: ActionModel[] = [];
  private selectActionFilterValue: number = 0;
  private actionsRows: any = [];
  private iSubscription: ISubscription;
  private currentCarouselSlide: number = 0;

  // selected action value for edit
  private assetDetails: AssetActionModel = new AssetActionModel();
  private closeAssetDetails: CloseAssetActionModel = new CloseAssetActionModel();
  private transferAssetToDebtDetails: TransferAssetToDebtActionModel = new TransferAssetToDebtActionModel();
  private transferAssetToAssetDetails: TransferAssetToAssetModel = new TransferAssetToAssetModel();
  private debtDetails: DebtActionModel = new DebtActionModel();
  private insuranceDetails: InsurancePolicyActionModel = new InsurancePolicyActionModel();
  private cancelInsuranceDetails: CancelInsurancePolicyActionModel = new CancelInsurancePolicyActionModel();
  private contributeFundToAsset: ContributeAssetActionModel = new ContributeAssetActionModel();
  private contributeFundToDebt: ContributeDebtActionModel = new ContributeDebtActionModel();
  private drawFundFromAsset: DrawFundFromAssetModel = new DrawFundFromAssetModel();
  private drawFundFromDebt: DrawFundFromDebtModel = new DrawFundFromDebtModel();

  // selected action value for ready only
  private assetReadyOnly: AssetActionModel = new AssetActionModel();
  private closeAssetReadyOnly: CloseAssetActionModel = new CloseAssetActionModel();
  private transferAssetReadyOnly: TransferAssetToDebtActionModel = new TransferAssetToDebtActionModel();
  private transferTwoAssetReadyOnly: TransferAssetToAssetModel = new TransferAssetToAssetModel();
  private debtReadyOnly: DebtActionModel = new DebtActionModel();
  private insuranceReadyOnly: InsurancePolicyActionModel = new InsurancePolicyActionModel();
  private cancelInsuranceReadyOnly: CancelInsurancePolicyActionModel = new CancelInsurancePolicyActionModel();
  private contributeAssetReadyOnly: ContributeAssetActionModel = new ContributeAssetActionModel();
  private contributeDebtReadyOnly: ContributeDebtActionModel = new ContributeDebtActionModel();
  private drawAssetReadyOnly: DrawFundFromAssetModel = new DrawFundFromAssetModel();
  private drawDebtReadyOnly: DrawFundFromDebtModel = new DrawFundFromDebtModel();

  private assetTypes: any[] = [];
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private clientViewService: ClientViewService,
    private router: Router,
    private onBoardingService: OnBoardingService,
  ) { super() }

  ngOnInit() {
    this.initData();
    // init frequency list
    this.frequencyList = this.getFrequencyType();

    $("#action-trash").on('hide.bs.modal', () => {
      // reset action read only available
      this.adviceBuilderService.actionReadOnly = true;
    });

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.strategicActions && changes.strategicActions.currentValue) {
      this.filterActions(0);
      this.selectActionFilterValue = 0
      // this.showCarouselControls(true);
    }
  }

  ngOnDestroy() {
    if (this.iSubscription) {
      this.iSubscription.unsubscribe();
    }
  }

  private getAllDataForStrategyDetailsByID(houseHoldId: string, strategyId: string) {
    //call api get all value for detail page.
    // It's include strategy, cashflow, asset, debt, goal, protection, etc
    this.adviceBuilderService.getScenarioDetails(houseHoldId, strategyId).subscribe(res => {
      this.clientViewService.hideLoading();
      this.handleUpdateScenarioAfterApiResponse(res);
    })
  }

  private handleUpdateScenarioAfterApiResponse(res: any) {
    if (res.success) {
      let updateScenario = this.adviceBuilderService.selectedScenario = res.data;
      localStorage.setItem("selectedStrategyID", updateScenario.scenarioId);
    } else {
      this.handleErrorMessageService.handleErrorResponse(res);
    }
  }

  private calculateActionInRows() {
    let index = 0;
    let actionRows = [];// content list of action rows
    let actionRow = []; // each row have only 4 actions
    this.actionsFilterList.forEach(action => {
      index++;
      if (index > 4) {
        actionRows.push(JSON.parse(JSON.stringify(actionRow)));
        actionRow = []; //reset current row
        index = 1; // reset index after push new first action;
      }
      actionRow.push(action);
    });

    if (actionRow.length > 0 && actionRow.length <= 4) {
      actionRows.push(actionRow);
    }
    this.actionsRows = actionRows;
  }

  private initData() {
    let tempOwnerShipType: Array<OptionModel<any>> = this.getOwnershipType();
    let houseHold: HouseHoldResponse = this.adviceBuilderService.houseHold;
    if (houseHold && houseHold.id) {
      this.clientList = this.filterClientList(houseHold.members);
      this.addPrimaryAndSpouceIntoOwnershipType(tempOwnerShipType, houseHold);
    }
    let seletedClientId = localStorage.getItem('selected_client_id_in_client_view');
    let houseHoldID = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    let observable: Observable<any>[] = [];
    observable.push(this.adviceBuilderService.getInsuraceCompany());
    observable.push(this.onBoardingService.getAssetTypeList());
    // asset type == 2 => Superannuation Account
    observable.push(this.adviceBuilderService.getSuperannuationAccount(houseHoldID, selectedStrategyID, 2));
    if (!houseHold || !houseHold.id) {
      observable.push(this.clientViewService.getClientHouseHolds(seletedClientId));
    }

    this.clientViewService.showLoading();
    this.iSubscription = Observable.zip.apply(null, observable).subscribe(response => {
      if (this.iSubscription) {
        this.iSubscription.unsubscribe();
      }
      this.clientViewService.hideLoading();
      //InsuranceCompany
      if (response[0] && response[0].success) {
        this.insuranceCompanies = response[0].data.data;
      } else {
        this.handleErrorMessageService.handleErrorResponse(response[0]);
      }
      //asset type list
      if (response[1].success) {
        this.assetTypes = response[1].data && response[1].data.data;
      }
      else {
        this.handleErrorMessageService.handleErrorResponse(response[1]);
      }

      // SuperannuationAccounts
      if (response[2].success) {
        this.superannuationAccounts = response[2].data;
      }
      else {
        this.handleErrorMessageService.handleErrorResponse(response[2]);
      }

      // house hold response
      if (!houseHold || !houseHold.id) {
        if (response[3] && response[3].id) {
          this.adviceBuilderService.houseHold = response[3];
          localStorage.setItem("houseHoldID", response[3].id);
          this.clientList = this.filterClientList(response[3].members);
          this.addPrimaryAndSpouceIntoOwnershipType(tempOwnerShipType, response[3]);
        } else {
          let errorResponse = response[3] as any;
          this.handleErrorMessageService.handleErrorResponse(errorResponse);
        }
      }

      this.showCarouselControls(true);
    });
  }

  private filterClientList(members: Contact[]) {
    if (!members) return [];
    let list: Array<OptionModel<string>> = [];
    members.forEach(member => {
      list.push({ name: member.firstName + " " + member.lastName, code: member.id })
    });
    return list;
  }

  private filterActions(event: any) {
    let value = event.target && event.target.value || 0;
    switch (parseInt(value)) {
      case 0: { this.actionsFilterList = this.filterActionsByType(0); break; } // all action
      case 1: { this.actionsFilterList = this.filterActionsByType(1); break; } // asset action
      case 2: { this.actionsFilterList = this.filterActionsByType(2); break; } // debt action
      case 3: { this.actionsFilterList = this.filterActionsByType(3); break; } // insurance action
      default: this.filterActionsByType(0);
    }
    this.calculateActionInRows();
    this.onChangeCarouselSlide(0);
  }

  private filterActionsByType(type: number) {
    let filterList = [];
    if (type == 0) { // all action
      filterList = JSON.parse(JSON.stringify(this.strategicActions));
    } else if (type == 1) { // asset action
      filterList = JSON.parse(JSON.stringify(this.strategicActions
        .filter(action => action.type == ActionType.AssetAction ||
          action.type == ActionType.CloseAssetAction ||
          action.type == ActionType.TransferAssetToAssetAction ||
          action.type == ActionType.TransferAssetToDebtAction ||
          action.type == ActionType.ContributFundAsset ||
          action.type == ActionType.DrawFundAsset)
      ));
    } else if (type == 2) {
      filterList = JSON.parse(JSON.stringify(this.strategicActions
        .filter(action => action.type == ActionType.DebtAction ||
          action.type == ActionType.ContributFundeDebt ||
          action.type == ActionType.DrawFundDebt)));
    } else if (type == 3) {
      filterList = JSON.parse(JSON.stringify(this.strategicActions
        .filter(action => action.type == ActionType.InsurancePolicyAction ||
          action.type == ActionType.CloseInsurancePolicyAction ||
          action.type == ActionType.ChangeExistentInsurancePolicyAction)
      ));
    }
    return filterList;
  }

  private viewAction(action) {
    setTimeout(() => {
      if (this.adviceBuilderService.actionReadOnly) {

        // get action details, type == 1 is read only mode
        this.getActionDetail(action, 1);
      }
    }, 200)
  }

  private returnActionIcon(type: number) {
    switch (type) {

      case ActionType.AssetAction: return "fa-gem";
      case ActionType.CloseAssetAction: return "fa-times";
      case ActionType.TransferAssetToAssetAction: return "fa-exchange";
      case ActionType.TransferAssetToDebtAction: return "fa-arrow-alt-right";
      case ActionType.ContributFundAsset: return "fa-arrow-right";
      case ActionType.DrawFundAsset: return "fa-arrow-left";

      case ActionType.DebtAction: return "fa-usd-circle";
      case ActionType.ContributFundeDebt: return "fa-arrow-right";
      case ActionType.DrawFundDebt: return "fa-arrow-left";

      case ActionType.InsurancePolicyAction: return "fa-umbrella";
      case ActionType.CloseInsurancePolicyAction: return "fa-times";
      case ActionType.ChangeExistentInsurancePolicyAction: return "fa-pencil";
      default: return "fa-gem";
    }
  }

  private returnActionTypeText(type: number) {
    switch (type) {

      case ActionType.AssetAction: return "New asset";
      case ActionType.CloseAssetAction: return "Close an existing asset";
      case ActionType.TransferAssetToAssetAction: return "Transfer funds between two assets";
      case ActionType.TransferAssetToDebtAction: return "Transfer funds from asset to debt";
      case ActionType.ContributFundAsset: return "Contribute funds to an asset";
      case ActionType.DrawFundAsset: return "Draw funds from an asset";

      case ActionType.DebtAction: return "New debt";
      case ActionType.ContributFundeDebt: return "Contribute funds to a debt";
      case ActionType.DrawFundDebt: return "Draw funds from a debt";

      case ActionType.InsurancePolicyAction: return "New insurance policy";
      case ActionType.CloseInsurancePolicyAction: return "Cancel an existing policy";
      case ActionType.ChangeExistentInsurancePolicyAction: return "Changes to an existing policy";
      default: return "fa-gem";
    }
  }

  private addPrimaryAndSpouceIntoOwnershipType(tempOwnerShipType: Array<OptionModel<any>>, houseHold: HouseHoldResponse) {
    let individual: Array<OptionModel<string>> = this.getPrimarySpouseFirstNameWithId(houseHold);
    individual.forEach(m => { tempOwnerShipType.unshift(m); });
    this.ownerShipTypes = tempOwnerShipType;
  }

  private storageSeletedAction(action: ActionModel) {
    // will not show read Only action modal
    this.adviceBuilderService.actionReadOnly = false;

    this.adviceBuilderService.storageSelectedAction(action);
  }

  private handleEditSeletedAction(action: ActionModel) {
    // will not show read Only action modal
    this.adviceBuilderService.actionReadOnly = false;

    // update selected action
    this.adviceBuilderService.isUpdateAction = true;

    // get action details, type == 2 is edit mode
    this.getActionDetail(action, 2);
  }

  private getActionDetail(action, mode) {
    let houseHoldID = localStorage.getItem("houseHoldID");
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    this.clientViewService.showLoading();
    this.adviceBuilderService.getActionDetailByActionID(houseHoldID, selectedStrategyID, action.actionId).subscribe(res => {
      this.clientViewService.hideLoading();
      // reset action read only available
      this.adviceBuilderService.actionReadOnly = true;

      if (res.success && res.data) {
        this.showModalAndActionValue(action, res.data, mode);
      } else {
        this.handleErrorMessageService.handleErrorResponse(res);
      }
    });
  }

  private toggleActionOnOff(action: ActionModel) {
    // will not show read Only action modal
    this.adviceBuilderService.actionReadOnly = false;
    let houseHoldID = localStorage.getItem("houseHoldID");
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    this.clientViewService.showLoading();
    this.adviceBuilderService.updateActionToggleOnOff(houseHoldID, selectedStrategyID, action.actionId).subscribe(res => {
      this.clientViewService.hideLoading();
      // reset action read only available
      this.adviceBuilderService.actionReadOnly = true;

      if (res.success) {
        this.adviceBuilderService.reloadAllData();
      } else {
        let tempActions = JSON.parse(JSON.stringify(this.actionsRows));
        this.actionsRows = [];
        this.actionsRows = tempActions;
        this.handleErrorMessageService.handleErrorResponse(res);
      }
    });
  }

  private showModalAndActionValue(action: ActionModel, value: any, mode: number) {
    switch (action.type) {
      case ActionType.InsurancePolicyAction: {
        //  open action editing modal
        this.adviceBuilderService.isChangeExistingPolicy = false;
        if (mode == 1) {// read only
          this.insuranceReadyOnly = value;
          $("#insurance-view").modal();
        } else { //edit mode
          this.insuranceDetails = value;
          $("#add-change-insurance").modal();
        }
        break;
      }
      case ActionType.CloseInsurancePolicyAction: {
        //  open action editing modal
        if (mode == 1) {// read only
          this.cancelInsuranceReadyOnly = value;
          $("#cancel-insurance-view").modal();
        } else { //edit mode
          this.cancelInsuranceDetails = value;
          $("#cancel-insurance").modal();
        }
        break;
      }
      case ActionType.ChangeExistentInsurancePolicyAction: {
        //  open action editing modal
        this.adviceBuilderService.isChangeExistingPolicy = true;
        if (mode == 1) {// read only
          this.insuranceReadyOnly = value;
          $("#insurance-view").modal();
        } else { //edit mode
          this.insuranceDetails = value;
          $("#add-change-insurance").modal();
        }
        break;
      }
      case ActionType.AssetAction: {
        //  open action editing modal
        if (mode == 1) {// read only
          this.assetReadyOnly = value;
          $("#asset-view").modal();
        } else { //edit mode
          this.assetDetails = value;
          $("#add-asset").modal();
        }
        break;
      }
      case ActionType.CloseAssetAction: {
        //  open action editing modal
        if (mode == 1) {// read only
          this.closeAssetReadyOnly = value;
          $("#close-asset-view").modal();
        } else { //edit mode
          this.closeAssetDetails = value;
          $("#close-asset").modal();
        }
        break;
      }
      case ActionType.TransferAssetToDebtAction: {
        //  open action editing modal
        if (mode == 1) {// read only
          this.transferAssetReadyOnly = value;
          $("#transfer-asset-debt-view").modal();
        } else { //edit mode
          this.transferAssetToDebtDetails = value;
          $("#transfer-asset-debt").modal();
        }
        break;
      }
      case ActionType.TransferAssetToAssetAction: {
        //  open action editing modal
        if (mode == 1) {// read only
          this.transferTwoAssetReadyOnly = value;
          $("#transfer-two-asset-view").modal();
        } else { //edit mode
          this.transferAssetToAssetDetails = value;
          $("#transfer-asset-to-asset").modal();
        }
        break;
      }
      case ActionType.DebtAction: {
        //  open action editing modal
        if (mode == 1) {// read only
          this.debtReadyOnly = value;
          $("#debt-view").modal();
        } else { //edit mode
          this.debtDetails = value;
          $("#add-debt").modal();
        }
        break;
      }
      case ActionType.ContributFundAsset: {
        //open action editing modal
        if (mode == 1) {// read only
          this.contributeAssetReadyOnly = value;
          $("#contribute-asset-view").modal();
        } else { //edit mode
          this.contributeFundToAsset = value;
          $('#contribute-funds-to-asset').modal();
        }
        break;
      }
      case ActionType.ContributFundeDebt: {
        //open action editing modal
        if (mode == 1) {// read only
          this.contributeDebtReadyOnly = value;
          $("#contribute-debt-view").modal();
        } else { //edit mode
          this.contributeFundToDebt = value;
          $('#contribute-funds-to-debt').modal();
        }
        break;
      }
      case ActionType.DrawFundAsset: {
        //open action editing modal
        if (mode == 1) {// read only
          this.drawAssetReadyOnly = value;
          $("#draw-asset-view").modal();
        } else { //edit mode
          this.drawFundFromAsset = value;
          $('#draw-funds-from-asset').modal();
        }
        break;
      }
      case ActionType.DrawFundDebt: {
        //open action editing modal
        if (mode == 1) {// read only
          this.drawDebtReadyOnly = value;
          $("#draw-debt-view").modal();
        } else { //edit mode
          this.drawFundFromDebt = value;
          $('#draw-funds-from-debt').modal();
        }
        break;
      }
      default: { }
    }
  }

  /** =================================================
   *                    CAROUSEL
   ==================================================== */

  private showCarouselControls(refreshControls: boolean = false) {
    if (refreshControls) {
      setTimeout(() => {
        $('.carousel-control-prev').hide();
        $('.carousel-control-next').show();
      }, 500);
    }
    else {
      var carouselLength = $('.carousel-item').length - 1;
      $('#actions-carousel').on('slide.bs.carousel', function (e) {
        var slidingItemsAsIndex = $('.carousel-item').length - 1;
        // If last item hide next arrow
        if ($(e.relatedTarget).index() == slidingItemsAsIndex)
          $('.carousel-control-next').hide();
        else
          $('.carousel-control-next').show();

        // If first item hide prev arrow
        if ($(e.relatedTarget).index() == 0)
          $('.carousel-control-prev').hide();
        else
          $('.carousel-control-prev').show();

      })
    }
  }

  private onClickAddNewActions() {
    // colappse goal menu
    $("#collapGoalMenu").removeClass("in");
  }

  private changeIndicatorsByClick(action: any) {
    this.showCarouselControls();
  }

  onChangeCarouselSlide(index: number) {
    this.currentCarouselSlide = index;
    if (index != 0)
      this.showCarouselControls();
    else {
      this.showCarouselControls(true);
    }
  }
}
