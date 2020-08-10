import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Router } from '@angular/router';
import { AssetActionModel, InvestmentStyle } from '../../../../../models';
import { OnBoardingService } from '../../../../../../on-boarding/on-boarding.service';
import { OptionModel } from '../../../../../../on-boarding/models';
import { OnBoardingCommonComponent } from '../../../../../../on-boarding/on-boarding-common.component';
import { Pairs, Pair } from '../../../../../../revenue-import/models';
import { ConfirmationDialogService } from '../../../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ParseError } from '@angular/compiler';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
import { ClientViewService } from '../../../../../client-view.service';

declare var $: any;

@Component({
  selector: 'asset-modal',
  templateUrl: './asset-modal.component.html',
  styleUrls: ['./asset-modal.component.css'],
})
export class AssetModalComponent extends OnBoardingCommonComponent implements OnInit {

  @Input() updateAsset: AssetActionModel = new AssetActionModel();
  @Input() actionID: string;
  @Input() ownerShipTypes: any;
  @Input() frequencyList: any;
  @Input() activeAssetList: any[] = [];
  @Input() activeDebtList: any[] = [];
  @Input() assetTypes: any[];
  private asset: AssetActionModel = new AssetActionModel();
  private contributionTypes: Array<OptionModel<number>> = [{ name: "Pre-Tax", code: 1 }, { name: "Post-Tax", code: 2 }];
  private investmentStyles: Array<OptionModel<number>>;
  private fundedFromList: Array<OptionModel<number>>;
  private searchTextPH: string = "";
  private selectedOwnershipType: string = "";
  private InvestmentEnum = InvestmentStyle;
  private makeContribution: boolean = false;
  private receiveContribution: boolean = false;
  private sourceName: string;
  private sources: Array<Pairs> = [];
  private netReturns: string = "";
  private contributionAmount: string = "";
  private assetBalance: string = "";
  private FundedFromType = FundedFromType;
  private isValidSource: boolean = true;
  private currentYear: number = new Date().getFullYear();
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private router: Router,
    private onBoardingService: OnBoardingService,
    private confirmationDialogService: ConfirmationDialogService,
    private clientService: ClientViewService
  ) { super(); }

  ngOnInit() {
    this.fundedFromList = this.getFundedFromTypeForAction();
    this.investmentStyles = this.getInvestmentTypes();
    $('#add-asset').on('hidden.bs.modal', () => {
      this.resetInputValue();
      $('#asset-details').click();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.activeAssetList && changes.activeAssetList.currentValue) {
      this.activeAssetList = this.activeAssetList.map(asset => {
        return { id: asset.id, value: asset.name };
      });
    }
    if (changes.activeDebtList && changes.activeDebtList.currentValue) {
      this.activeDebtList = this.activeDebtList.map(debt => {
        return { id: debt.id, value: debt.name };
      });
    }
    if (changes.updateAsset && changes.updateAsset.currentValue) {
      this.asset = JSON.parse(JSON.stringify(this.updateAsset));
      // update ownership type on view
      if (this.asset.ownershipType == 100000000) {
        this.selectedOwnershipType = this.asset.primaryClientId;
      } else if (this.asset.ownershipType) {
        this.selectedOwnershipType = this.asset.ownershipType.toString();
      }
      //update
      if (this.asset.contributionAmount || this.asset.contributionAmount == 0) {
        this.contributionAmount = this.returnCurrenyFormat(this.asset.contributionAmount.toString());
      }
      if (this.asset.accountBalance || this.asset.accountBalance == 0) {
        this.assetBalance = this.returnCurrenyFormat(this.asset.accountBalance.toString());
      }

      this.makeContribution = this.asset.makeContributions ? this.asset.makeContributions : false;
      this.receiveContribution = this.asset.receiveContributions ? this.asset.receiveContributions : false;
      // update Estimate net return value
      if (this.asset && this.asset.netReturns) {
        this.onEstimatedNetReturnFocusOut(this.asset.netReturns.toString());
      }

      // asign name value for asset or debt if it's available
      if (this.asset.sourceOfFunds == FundedFromType.AssetBalance && this.asset.sourceId) {
        if (this.activeAssetList && this.activeAssetList.length > 0) {
          // init client Source
          this.initAutoCompleteBySourceOfFund();
          let currentAsset = this.activeAssetList.filter(asset => asset.id == this.asset.sourceId);
          if (currentAsset && currentAsset.length > 0) {
            this.sourceName = currentAsset[0].value;
            this.isValidSource = true;
          }
          else {
            if (this.adviceBuilderService.isUpdateAction && this.asset.sourceId && this.asset.sourceId != '')
              this.isValidSource = false;
          }
        }
      }

      if ((this.asset.sourceOfFunds == FundedFromType.LoanBalance || this.asset.sourceOfFunds == FundedFromType.LoanOffsetAccount) && this.asset.sourceId) { // fund from debt
        if (this.activeDebtList && this.activeDebtList.length > 0) {
          // init client Source
          this.initAutoCompleteBySourceOfFund();
          let currentDebt = this.activeDebtList.filter(debt => debt.id == this.asset.sourceId);
          if (currentDebt && currentDebt.length > 0) {
            this.sourceName = currentDebt[0].value;
            this.isValidSource = true;
          }
          else {
            if (this.asset.sourceId && this.asset.sourceId != '')
              this.isValidSource = false;
          }
        }
      }
    }
  }

  ngOnDestroy() {
    // resolve the issue unclickable when press "ESC" key
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }

  private createNewAsset() {
    let houseHoldID = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldID || !selectedStrategyID) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      this.asset.actionTitle = this.asset.assetName;
      let endYear = this.clientService.currentScenario.retirementProjections.lifeExpectencyYear;
      if (this.adviceBuilderService.validateYearField(this.asset.startYear, this.currentYear, endYear)) {
        this.adviceBuilderService.showLoading();
        // close modal
        $('#add-asset').modal('hide');
        this.adviceBuilderService.createNewAsset(houseHoldID, selectedStrategyID, this.asset).subscribe(res => {
          this.adviceBuilderService.hideLoading();
          if (res.success) {
            //reload all data
            this.adviceBuilderService.reloadAllData();
          } else {
            this.handleErrorMessageService.handleErrorResponse(res);
          }
        });
      } else {
        this.adviceBuilderService.showInvalidEndYearMessage(this.currentYear, endYear);
      }
    }
  }

  private saveChangesAsset() {
    let houseHoldID = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldID || !selectedStrategyID) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      let minYear = this.updateAsset.startYear < this.currentYear ? this.updateAsset.startYear : this.currentYear;
      let maxYear = this.clientService.currentScenario.retirementProjections.lifeExpectencyYear;
      if (this.adviceBuilderService.validateYearField(this.asset.startYear, minYear, maxYear)) {
        this.adviceBuilderService.showLoading();
        this.asset.actionTitle = this.asset.assetName;
        // close modal
        $('#add-asset').modal('hide');
        this.adviceBuilderService.updateAssetAction(houseHoldID, selectedStrategyID, this.asset).subscribe(response => {
          this.adviceBuilderService.hideLoading();
          if (response.success) {
            // reload all data
            this.adviceBuilderService.reloadAllData();
          } else {
            this.handleErrorMessageService.handleErrorResponse(response);
          }
        });
      } else {
        this.adviceBuilderService.showInvalidEndYearMessage(minYear, maxYear);
      }
    }
  }

  private onAmountFocus(value) {
    if (value && value != "") {
      this.contributionAmount = value.replace(/[^0-9.`-]+/g, "");
    }
  }

  private onAmountFocusOut(value) {
    if (value && value != "") {
      this.contributionAmount = '$' + value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }
  }

  private onAmountKeyup(event) {
    let value = event.target && event.target.value;
    if (value && value != "") {
      this.asset.contributionAmount = value.replace(/[^0-9.`-]+/g, "");
    }
  }

  private onAssetBalanceFocus(value) {
    if (value && value != "") {
      this.assetBalance = value.replace(/[^0-9.`-]+/g, "");
    }
  }

  private onAssetBalanceFocusOut(value) {
    if (value && value != "") {
      this.assetBalance = this.returnCurrenyFormat(value);
    }
  }

  private onAssetBalanceKeyup(event) {
    let value = event.target && event.target.value;
    if (value && value != "") {
      this.asset.accountBalance = value.replace(/[^0-9.`-]+/g, "");
      if (value <= 0) {
        this.asset.sourceOfFunds = undefined;
        this.asset.sourceId = undefined;
        this.sourceName = undefined;
      }
    }
  }

  private returnCurrenyFormat(number: string) {
    return '$' + number.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  private sourceNameChange() {
    if (this.asset.sourceOfFunds == FundedFromType.AssetBalance) {
      let source = this.activeAssetList.filter(asset => asset.value == this.sourceName);
      this.asset.sourceId = (source && source.length > 0) ? source[0].id : undefined;
    } else if (this.asset.sourceOfFunds == FundedFromType.LoanBalance || this.asset.sourceOfFunds == FundedFromType.LoanOffsetAccount) {
      let source = this.activeDebtList.filter(debt => debt.value == this.sourceName);
      this.asset.sourceId = (source && source.length > 0) ? source[0].id : undefined;
    }
  }

  private onFundedFromChange() {
    //if source of Funds = Cashflow, then it becomes a Post-Tax Contribution     
    this.asset.sourceId = undefined;
    this.sourceName = undefined;
    this.isValidSource = true;
    this.initAutoCompleteBySourceOfFund();
  }

  private initAutoCompleteBySourceOfFund() {
    if (this.asset.sourceOfFunds == FundedFromType.AssetBalance) {
      this.searchTextPH = "Client Asset";
      this.sources = this.activeAssetList;
      if (this.adviceBuilderService.isUpdateAction)
        this.sources = this.activeAssetList.filter(asset => asset.id != this.asset.assetId);
    }

    if (this.asset.sourceOfFunds == FundedFromType.LoanBalance || this.asset.sourceOfFunds == FundedFromType.LoanOffsetAccount) {
      this.searchTextPH = "Client Debt";
      this.sources = this.activeDebtList;
    }
  }

  private onOwnershipChange(event: any): void {
    let type = event.target.value;
    if (!type) { return; }

    if (type == 100000001 || type == 100000002 || type == 100000003 || type == 100000005) {
      this.asset.ownershipType = type;
      let primaryClientId = localStorage.getItem('selected_client_id_in_client_view');
      this.asset.primaryClientId = primaryClientId;
    } else {
      this.asset.ownershipType = 100000000;
      this.asset.primaryClientId = type;
    }
  }

  private onAssetTypeChange(event: any) {
    let assetType = event.target.value;
    if (assetType != 2) this.asset.receiveContributions = false;
  }

  private getInvestmentTypes(): Array<OptionModel<number>> {
    let options: Array<OptionModel<number>> = [
      { name: "Defensive", code: InvestmentStyle.Defensive },
      { name: "Conservative", code: InvestmentStyle.Conservative },
      { name: "Balanced", code: InvestmentStyle.Balanced },
      { name: "Growth", code: InvestmentStyle.Growth },
      { name: "Aggressive", code: InvestmentStyle.Aggressive },
      { name: "Custom", code: InvestmentStyle.Custom },
    ];
    return options;
  }

  private onEstimatedNetReturnKeyup(event) {
    let value = event.target && event.target.value;
    if (value && value != "") {
      this.asset.netReturns = parseFloat(value.replace(/[^0-9.`-]+/g, ""));
    }
  }

  private onEstimatedNetReturnFocusIn(value) {
    if (value && value != "") {
      this.netReturns = value.replace(/[^0-9.`-]+/g, "");
    }
  }

  private onEstimatedNetReturnFocusOut(value) {
    if (value && value != "") {
      this.netReturns = value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + "%";
    }
  }

  private viewDetectChange() {
    let viewChange = false;
    if (this.adviceBuilderService.isUpdateAction) { // is update goal
      // if action input different from update action => change
      if (this.asset.assetName != this.updateAsset.assetName ||
        this.asset.assetType != this.updateAsset.assetType ||
        this.isOwnershiptypeChange() ||
        this.asset.startYear != this.updateAsset.startYear ||
        this.makeContribution != this.updateAsset.makeContributions ||
        (this.asset.assetType == 2 && this.receiveContribution != this.updateAsset.receiveContributions) ||
        (this.makeContribution && (this.asset.contributionType != this.updateAsset.contributionType)) ||
        parseInt(this.returnDecimalValue(this.contributionAmount)) != this.updateAsset.contributionAmount ||
        this.asset.contributionFrequency != this.updateAsset.contributionFrequency ||
        this.asset.investmentStyle != this.updateAsset.investmentStyle ||
        parseInt(this.returnDecimalValue(this.netReturns)) != this.updateAsset.netReturns ||
        parseInt(this.returnDecimalValue(this.assetBalance)) != this.updateAsset.accountBalance ||
        this.asset.sourceOfFunds != this.updateAsset.sourceOfFunds ||
        // check source of fund change
        this.isSourceOfFundChange() ||
        // check advice comment
        this.checkUndefinedValue(this.asset.details) != this.checkUndefinedValue(this.updateAsset.details) ||
        this.checkUndefinedValue(this.asset.reason) != this.checkUndefinedValue(this.updateAsset.reason) ||
        this.checkUndefinedValue(this.asset.result) != this.checkUndefinedValue(this.updateAsset.result)
      ) {
        viewChange = true;
      }
    } else {
      viewChange = true;
    };
    // create new action or not change
    return viewChange;
  }

  private checkUndefinedValue(value) {
    return !value ? "" : value;
  }

  private isOwnershiptypeChange() {
    if (this.updateAsset.ownershipType == 100000000) {
      return this.selectedOwnershipType != this.updateAsset.primaryClientId;
    } else {
      return this.selectedOwnershipType != this.updateAsset.ownershipType.toString();
    }
  }

  private returnDecimalValue(number: string) {
    if (!number) return undefined;
    return number.replace(/[^0-9.`-]+/g, "");
  }

  private isCorrectSourceOfFund() {
    let isCorrectSource = false;
    if (this.asset.sourceOfFunds == FundedFromType.Cashflow) isCorrectSource = true;
    else if (this.asset.sourceOfFunds) {
      if (this.asset.sourceOfFunds == FundedFromType.AssetBalance && this.asset.sourceId) { // fund from asset
        isCorrectSource = true;
      }
      if ((this.asset.sourceOfFunds == FundedFromType.LoanBalance || this.asset.sourceOfFunds == FundedFromType.LoanOffsetAccount) && this.asset.sourceId) { // fund from debt
        isCorrectSource = true;
      }
    } else if (this.asset.accountBalance == 0) { isCorrectSource = true; }
    return isCorrectSource;
  }

  private isSourceOfFundChange() {
    let sourceChange = false;
    if (this.asset.sourceOfFunds) {
      // fund from cashflow
      if (this.asset.sourceOfFunds == FundedFromType.Cashflow && (this.asset.sourceOfFunds != this.updateAsset.sourceOfFunds))
        sourceChange = true;
      // fund from asset/ debt
      if (this.asset.sourceOfFunds && this.asset.sourceOfFunds != FundedFromType.Cashflow && (this.asset.sourceId != this.updateAsset.sourceId)) {
        sourceChange = true;
      }
    }
    return sourceChange;
  }

  private onSourceChange(item: Pairs) {
    this.sourceName = item.value;
    this.asset.sourceId = item.id;
  }

  private resetInputValue() {
    this.asset = new AssetActionModel();
    this.selectedOwnershipType = undefined;
    this.makeContribution = false;
    this.receiveContribution = false;
    this.adviceBuilderService.isUpdateAction = false; // mean create asset
    this.sourceName = undefined;
    this.netReturns = undefined;
    this.assetBalance = undefined;
    this.contributionAmount = undefined
  }

  private onMakeContributionChange(check: boolean) {
    //reset current value => let user input again
    this.asset.contributionType = undefined;
    this.contributionAmount = this.asset.contributionAmount = undefined;
    this.asset.contributionFrequency = undefined;
    this.asset.makeContributions = this.makeContribution = check;
  }

  private onReceiveContibutionChange(check: boolean) {
    this.asset.receiveContributions = this.receiveContribution = check;
  }

  private getSourceName(sourceId: string, fundFrom: number) {
    let sourceName = "";
    if (fundFrom == FundedFromType.AssetBalance) { // asset
      sourceName = this.activeAssetList.filter(asset => asset.id == sourceId)[0].value;
    } else if (fundFrom == FundedFromType.LoanBalance || fundFrom == FundedFromType.LoanOffsetAccount) {// debt
      sourceName = this.activeDebtList.filter(asset => asset.id == sourceId)[0].value;
    }
    return sourceName;
  }
}

export enum FundedFromType {
  Cashflow,
  LoanBalance,
  LoanOffsetAccount,
  AssetBalance
}

