import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DebtActionModel, DebtCategoryType, DebtType, DebtTypeAction } from '../../../../../models';
import { OptionModel } from '../../../../../../on-boarding/models';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Router } from '@angular/router';
import { OnBoardingService } from '../../../../../../on-boarding/on-boarding.service';
import { OnBoardingCommonComponent } from '../../../../../../on-boarding/on-boarding-common.component';
import { Pairs, Pair } from '../../../../../../revenue-import/models';
import { ConfirmationDialogService } from '../../../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Observable } from 'rxjs';
import { DebtFundedFrom } from '../../../../../../common/models/debt-fund-from.enum';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
import { ISubscription } from 'rxjs/Subscription';
declare var $: any;

@Component({
  selector: 'debt-modal',
  templateUrl: './debt-modal.component.html',
  styleUrls: ['./debt-modal.component.css'],
})
export class DebtModalComponent extends OnBoardingCommonComponent implements OnInit {

  @Input() updateDebt: DebtActionModel = new DebtActionModel();
  @Input() ownerShipTypes: any;
  @Input() frequencyList: any;
  @Input() activeAssetList: any[];
  private debtCategoryList: OptionModel<number>[] = [];
  private interestRateTypes: OptionModel<number>[] = [];
  private selectedOwnershipType = "";
  private isShowingOffsetAccount: boolean = false;
  private fundedFromList: Array<OptionModel<number>>;
  private searchTextPH: string = "";
  private sourceName: string = "";
  private debtTypes: OptionModel<number>[] = [];
  private debt: DebtActionModel = new DebtActionModel();
  private currentBalance: string = "";
  private interestRate: string = "";
  private repayment: string = "";
  private offsetBalance: string = "";
  private willThereBeOffsetAccount: boolean;
  private DebtFundedFrom = DebtFundedFrom;
  private isValidSource = true;
  private iSub: ISubscription;
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private router: Router,
    private onBoardingService: OnBoardingService,
    private confirmationDialogService: ConfirmationDialogService
  ) { super(); }

  ngOnInit() {
    this.debtCategoryList = this.getDebtCategory();
    this.debtTypes = this.getDebtType();
    this.interestRateTypes = this.getInterestRateType();
    this.fundedFromList = this.getFundedFromTypeForDebtAction();
    $('#add-debt').on('hidden.bs.modal', () => {
      this.resetInputValue();
      $('#debt-details').click();
    });
  }

  ngOnDestroy() {
    // resolve the issue unclickable when press "ESC" key
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
    if (this.iSub) {
      this.iSub.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.activeAssetList && changes.activeAssetList.currentValue) {
      this.activeAssetList = this.activeAssetList.map(asset => {
        return { id: asset.id, value: asset.name };
      });
    }

    // show debt value need to update on view
    if (changes.updateDebt && changes.updateDebt.currentValue) {
      this.debt = JSON.parse(JSON.stringify(this.updateDebt));
      this.updateDebtToView();
    }
  }

  private updateDebtToView() {
    this.willThereBeOffsetAccount = this.debt.willThereBeOffsetAccount;
    // check showing offset account
    this.checkShowingOffsetAccount(this.debt.debtCategory);

    // update current balance
    if (this.debt.balance || this.debt.balance == 0) {
      this.currentBalance = this.returnCurrenyFormat(this.debt.balance.toString());
    }
    // update interest rate
    if (this.debt.annualInterestRate || this.debt.annualInterestRate == 0) {
      this.interestRate = this.debt.annualInterestRate.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + "%";
    }
    // update repayment
    if (this.debt.repayment || this.debt.repayment == 0) {
      this.repayment = this.returnCurrenyFormat(this.debt.repayment.toString());
    }
    // update offset balance
    if (this.debt.offset || this.debt.offset == 0) {
      this.offsetBalance = this.returnCurrenyFormat(this.debt.offset.toString());
    }

    // update ownership type on view
    if (this.debt.ownershipType == 100000000) {
      this.selectedOwnershipType = this.debt.primaryClientId;
    } else if (this.debt.ownershipType) {
      this.selectedOwnershipType = this.debt.ownershipType.toString();
    }

    if (this.debt.sourceOfFunds == DebtFundedFrom.Asset) {
      // asign name value for debt or debt if it's available
      if (this.activeAssetList && this.activeAssetList.length > 0) {
        // init client Source
        this.initAutoCompleteBySourceOfFund();
        let currentAsset = this.activeAssetList.filter(asset => asset.id == this.debt.sourceId);
        if (currentAsset && currentAsset.length > 0) {
          this.sourceName = currentAsset[0].value;
          this.isValidSource = true;
        }
        else {
          if (this.adviceBuilderService.isUpdateAction && this.debt.sourceId && this.debt.sourceId != '')
            this.isValidSource = false;
        }
      }
    }
  }

  private saveChangeDebt() {
    let houseHoldId = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldId || !selectedStrategyID) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      this.debt.actionTitle = this.debt.name;
      if (this.validateYearCreate(this.debt.startYear)) {
        // close modal
        this.adviceBuilderService.showLoading()
        $('#add-debt').modal('hide');

        let observable: Observable<any>[] = [];
        if (this.adviceBuilderService.isUpdateAction) {
          observable.push(this.adviceBuilderService.updateDebtAction(houseHoldId, selectedStrategyID, this.debt));
        } else {
          observable.push(this.adviceBuilderService.createDebtAction(houseHoldId, selectedStrategyID, this.debt));
        }
        this.iSub = Observable.zip.apply(null, observable).subscribe(res => {
          if (this.iSub) {
            this.iSub.unsubscribe();
          }
          this.adviceBuilderService.hideLoading();
          if (res[0].success) {
            // reload all data
            this.adviceBuilderService.reloadAllData();
          } else {
            this.handleErrorMessageService.handleErrorResponse(res[0]);
          }
        });
      } else {
        this.showInvalidYear();
      }
    }
  }

  private onOwnershipChange(event: any): void {
    let type = event.target.value;
    if (!type) { return; }

    if (type == 100000001 || type == 100000002 || type == 100000003 || type == 100000005) {
      this.debt.ownershipType = type;
      this.debt.primaryClientId = undefined;
    } else {
      this.debt.ownershipType = 100000000;
      this.debt.primaryClientId = type;
    }
  }

  private onDebtCategoryChange(event: any, bool: boolean) {
    let debtCategory = event && event.target.value;
    if (!debtCategory) { return; }
    this.checkShowingOffsetAccount(debtCategory);
  }

  private checkShowingOffsetAccount(debtCategory: number) {
    if (debtCategory == DebtCategoryType.RentalPropertyLoan || debtCategory == DebtCategoryType.HomeMortgage) {
      this.isShowingOffsetAccount = true;
    } else {
      this.isShowingOffsetAccount = false;
      this.willThereBeOffsetAccount = false;
      this.offsetBalance = undefined;
      this.debt.sourceOfFunds = undefined;
      this.debt.sourceId = undefined;
      this.sourceName = undefined;
    }
  }

  private thereBeNoOffsetAccountClick(haveOffset: boolean) {
    this.debt.sourceOfFunds = undefined;
    this.offsetBalance = this.debt.offset = undefined;
    this.willThereBeOffsetAccount = this.debt.willThereBeOffsetAccount = haveOffset;
  }

  private onFundedFromChange() {
    //reset selected source 
    this.debt.sourceId = undefined;
    this.sourceName = undefined;
    this.isValidSource = true;
    this.initAutoCompleteBySourceOfFund();
  }

  getDebtCategory(): Array<OptionModel<number>> {
    let options: Array<OptionModel<number>> = [
      { name: "Rental property loan", code: DebtCategoryType.RentalPropertyLoan },
      { name: "Investment loan ", code: DebtCategoryType.InvestmentLoan },
      { name: "Home mortgage ", code: DebtCategoryType.HomeMortgage },
      { name: "Car loan ", code: DebtCategoryType.CarLoan },
      { name: "Credit card ", code: DebtCategoryType.CreditCard },
      { name: "Personal loan", code: DebtCategoryType.PersonalLoan },
      { name: "Other", code: DebtCategoryType.Other },
    ];
    return options;
  }

  getDebtType(): Array<OptionModel<number>> {
    let options: Array<OptionModel<number>> = [
      { name: "Deductible", code: DebtTypeAction.Deductible },
      { name: "NonDeductible", code: DebtTypeAction.NonDeductible },
    ];
    return options;
  }

  private initAutoCompleteBySourceOfFund() {
    if (this.debt.sourceOfFunds == DebtFundedFrom.Asset) {
      this.searchTextPH = "Client Asset";
    }
  }

  private returnCurrenyFormat(number: string) {
    return '$' + number.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  private returnDecimalValue(number: string) {
    if (!number) return undefined;
    return number.replace(/[^0-9.`-]+/g, "");
  }

  private isCorrectSourceOfFund() {
    let isCorrectSource = false;
    if (this.debt.sourceOfFunds == DebtFundedFrom.Cashflow || (this.debt.sourceOfFunds == DebtFundedFrom.Asset && this.debt.sourceId)) {
      isCorrectSource = true;
    } else if (parseInt(this.returnDecimalValue(this.offsetBalance)) == 0 || // no need fund from when offset account = 0
      !this.debt.willThereBeOffsetAccount || // dont have offset account not need fund from
      !this.isShowingOffsetAccount) { // dont show offset acount mean we dont have offset balance => no need fund from
      isCorrectSource = true;
    }
    return isCorrectSource;
  }

  private isSourceOfFundChange() {
    let sourceChange = false;
    if (this.debt.sourceOfFunds) {
      // fund from cashflow
      if (this.debt.sourceOfFunds == DebtFundedFrom.Cashflow && (this.debt.sourceOfFunds != this.updateDebt.sourceOfFunds))
        sourceChange = true;
      // fund from asset
      if (this.debt.sourceOfFunds && this.debt.sourceOfFunds != DebtFundedFrom.Cashflow && (this.debt.sourceId != this.updateDebt.sourceId)) {
        sourceChange = true;
      }
    }
    return sourceChange;
  }

  private viewDetectChange() {
    let viewChange = false;
    if (this.adviceBuilderService.isUpdateAction) { // is update goal
      // if action input different from update action => change
      if (this.debt.name != this.updateDebt.name ||
        this.debt.debtType != this.updateDebt.debtType ||
        this.debt.debtCategory != this.updateDebt.debtCategory ||
        this.isOwnershiptypeChange() ||
        parseInt(this.returnDecimalValue(this.currentBalance)) != this.updateDebt.balance ||
        parseFloat(this.returnDecimalValue(this.interestRate)) != this.updateDebt.annualInterestRate ||
        parseInt(this.returnDecimalValue(this.repayment)) != this.updateDebt.repayment ||
        this.debt.repaymentFrequency != this.updateDebt.repaymentFrequency ||
        this.debt.startYear != this.updateDebt.startYear ||
        this.debt.willThereBeOffsetAccount != this.updateDebt.willThereBeOffsetAccount ||
        parseInt(this.returnDecimalValue(this.offsetBalance)) != this.updateDebt.offset ||
        this.debt.sourceOfFunds != this.updateDebt.sourceOfFunds ||
        // check source of fund change
        this.isSourceOfFundChange() ||
        // check advice comment
        this.checkUndefinedValue(this.debt.details) != this.checkUndefinedValue(this.updateDebt.details) ||
        this.checkUndefinedValue(this.debt.reason) != this.checkUndefinedValue(this.updateDebt.reason) ||
        this.checkUndefinedValue(this.debt.result) != this.checkUndefinedValue(this.updateDebt.result)
      ) {
        viewChange = true;
      }
    } else {
      viewChange = true;
    };

    return viewChange;
  }

  private checkUndefinedValue(value) {
    return !value ? "" : value;
  }

  private oncurrentBalanceFocus(value) {
    if (value && value != "") {
      this.currentBalance = this.returnDecimalValue(value);
    }
  }

  private oncurrentBalanceFocusOut(value) {
    if (value && value != "") {
      this.currentBalance = this.returnCurrenyFormat(value);
    }
  }

  private oncurrentBalanceKeyup(event) {
    let value = event.target && event.target.value;
    if (value && value != "") {
      this.debt.balance = parseInt(this.returnDecimalValue(value));
    }
  }

  private onRepaymentFocus(value) {
    if (value && value != "") {
      this.repayment = this.returnDecimalValue(value);
    }
  }

  private onRepaymentFocusOut(value) {
    if (value && value != "") {
      this.repayment = this.returnCurrenyFormat(value);
    }
  }

  private onRepaymentKeyup(event) {
    let value = event.target && event.target.value;
    if (value && value != "") {
      this.debt.repayment = parseInt(this.returnDecimalValue(value));
    }
  }

  private onInterestRateFocus(value) {
    if (value && value != "") {
      this.interestRate = this.returnDecimalValue(value);
    }
  }

  private onInterestRateFocusOut(value) {
    if (value && value != "") {
      this.interestRate = value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + "%";
    }
  }

  private onInterestRateKeyup(event) {
    let value = event.target && event.target.value;
    if (value && value != "") {
      this.debt.annualInterestRate = parseFloat(value.replace(/[^0-9.`-]+/g, ""));
    }
  }

  private onOffsetBalanceFocus(value) {
    if (value && value != "") {
      this.offsetBalance = this.returnDecimalValue(value);
    }
  }

  private onOffsetBalanceFocusOut(value) {
    if (value && value != "") {
      this.offsetBalance = this.returnCurrenyFormat(value);
    }
  }

  private onOffsetBalanceKeyup(event) {
    let value = event.target && event.target.value;
    if (value && value != "") {
      this.debt.offset = parseInt(this.returnDecimalValue(value));
    }
  }

  private isOwnershiptypeChange() {
    if (this.updateDebt.ownershipType == 100000000) {
      return this.selectedOwnershipType != this.updateDebt.primaryClientId;
    } else {
      return this.selectedOwnershipType != this.updateDebt.ownershipType.toString();
    }
  }

  private resetInputValue() {
    this.debt = new DebtActionModel();
    this.selectedOwnershipType = undefined;
    this.debt.debtCategory = undefined;
    this.isShowingOffsetAccount = undefined;
    this.adviceBuilderService.isUpdateAction = false; // mean create debt
    this.currentBalance = undefined
    this.interestRate = undefined;
    this.repayment = undefined;
    this.offsetBalance = undefined;
  }

  private sourceChange(client: Pair) {
    this.sourceName = client.value;
    this.debt.sourceId = client.id;
  }

  private validateYearCreate(createYear: number) {
    let currentYear = new Date().getFullYear();
    if (currentYear > createYear)
      return false;
    return true;
  }

  private showInvalidYear() {
    let currentYear = new Date().getFullYear();
    let iSub = this.confirmationDialogService.showModal({
      title: "Validation error",
      message: "Starting year must be greater " + currentYear,
      btnOkText: "Ok"
    }).subscribe(res => {
      iSub.unsubscribe();
    })
  }
}
