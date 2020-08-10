import { Component, OnInit, Output, EventEmitter, OnDestroy } from "@angular/core";
import { OptionModel } from "../../models";
import { OnBoardingCommonComponent } from "../../on-boarding-common.component";
import { OnBoardingService } from "../../on-boarding.service";
import { ClientDebt, DebtType, DebtCategoryType } from '../../../client-view/models';
import { HandleFinancialSituationService } from '../handle-financial-situation.service';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';

declare var $: any;
@Component({
  selector: "app-debt-type",
  templateUrl: "./debt-type.component.html",
  styleUrls: ["./debt-type.component.css"]
})
export class DebtTypeComponent extends OnBoardingCommonComponent implements OnInit, OnDestroy {

  //#region Properties
  hasDebtName: boolean = false;
  isShowInterestRateType: boolean = false;
  isShowOffsetAccount: boolean = false;
  isShowOffsetBalance: boolean = false;
  isShowOffsetBalanceAtBegin: boolean = false;
  isValidInterestRate: boolean = true;
  isValidForm: boolean = true;

  primaryClientId: string;

  // resources
  ownerShipTypes: OptionModel<number>[] = [];
  debtCategoryList: OptionModel<number>[] = [];
  requencyTypes: OptionModel<number>[] = [];
  interestRateTypes: OptionModel<number>[] = [];

  // view
  // itemName: string;
  interestRateNumber: string;
  selectedOwnerShip: string;
  clientDebt: ClientDebt;
  clientDebtFromApi: ClientDebt;
  currentBalance: string;
  repayment: string;
  offsetAccountBalance: string;
  //#endregion

  //#region Constructors
  constructor(
    protected onboardingService: OnBoardingService,
    private confirmationDialogService: ConfirmationDialogService,
    private _financialService: HandleFinancialSituationService) {
    super();
    this.clientDebt = new ClientDebt();
  }

  ngOnInit(): void {
    super.initPopover();
    this.debtCategoryList = this.getDebtCategoryType();
    this.requencyTypes = this.getFrequencyType();
    this.interestRateTypes = this.getInterestRateType();
    this.primaryClientId = this.onboardingService.getPrimaryClientId();
    this.initOwnershipTypes();
    this.initDebtFromClick();
  }

  ngOnDestroy(): void {
    $('.popover').popover('hide');
  }
  //#endregion

  //#region Initial data
  /**
   * If user choose a record from debt list
   * => Get selected record from service and bind to `clientDebt` variable.
   * 
   * Check debt type
   */
  initDebtFromClick() {
    let debt = this._financialService.initFinancial();
    if (!debt) { return; }
    this.resetDebt();
    this.clientDebt = { ...debt };
    this.clientDebtFromApi = { ...debt };
    this.currentBalance = this._financialService.convertNumberToCurrency(this.clientDebt.currentBalance + '');
    this.repayment = this._financialService.convertNumberToCurrency(this.clientDebt.repayment + '');
    this.offsetAccountBalance = this._financialService.convertNumberToCurrency(this.clientDebt.offsetAccountBalance + '');

    this.manageDebtViewFromDebtType();

    this.initOnwershipFromClick(this.clientDebt.ownershipType);

    this.interestRateNumber = this.clientDebt.annualInterestRate + "%";
  }

  // get household list of member
  // find firstname of primary and spouse
  // add their names to current ownership-types
  // set debt-name = ownership-type - debt-type

  initOwnershipTypes(): void {
    let temp: OptionModel<any>[] = this.getOwnershipType();
    // if house hold is empty => call it again
    if (!this.onboardingService.houseHold) {
      // cal api get house hold
      this.onboardingService.getHouseHold().subscribe(response => {
        this.unshiftMemberToOwnership(temp, response);
        this.onboardingService.storeHouseHold(response);
      });
    } else {
      this.unshiftMemberToOwnership(temp, this.onboardingService.houseHold);
    }
  }

  private unshiftMemberToOwnership(temp: any, houseHold) {
    let individual: Array<OptionModel<string>> = this.getPrimarySpouseFirstNameWithId(houseHold);
    individual.forEach(m => { temp.unshift(m); });
    this.ownerShipTypes = temp;
    // return temp;
  }

  initOnwershipFromClick(type) {
    if (!type) { return; }

    if (type != 100000000) {
      this.selectedOwnerShip = type;
    } else {
      this.selectedOwnerShip = this.clientDebt.primaryClientId;
    }
  }
  //#endregion 

  //#region View Handlers
  onDebtCategoryTypeChange(): void {
    let category = this.clientDebt.debtCategory;
    if (!category) { return; }
    if (category == DebtCategoryType.RentalPropertyLoan || category == DebtCategoryType.InvestmentLoan) {
      this.clientDebt.debtType = 100000000;
    }
    if (category == DebtCategoryType.HomeMortgage || category == DebtCategoryType.CarLoan || category == DebtCategoryType.CreditCard || category == DebtCategoryType.PersonalLoan || category == DebtCategoryType.Other) {
      this.clientDebt.debtType = 100000001;
    }
    this.manageDebtViewFromDebtType();
    this.updateDebtName();
  }

  onOwnershipChange(event: any): void {
    let type = event.target.value;
    if (!type) { return; }

    if (type == 100000001 || type == 100000002 || type == 100000003 || type == 100000005) {
      this.clientDebt.ownershipType = type;
      this.clientDebt.primaryClientId = undefined;
    } else {
      this.clientDebt.ownershipType = 100000000;
      this.clientDebt.primaryClientId = type;
    }

    this.updateDebtName();
  }

  interestRateChange(event) {
    let value = event.target.value;
    if (!value) {
      this.clientDebt.annualInterestRate = 0;
      return;
    }

    this.clientDebt.annualInterestRate = value;
    this.interestRateNumber = value;
  }

  interestRateFocus() {
    if (this.interestRateNumber)
      this.interestRateNumber = this.interestRateNumber.replace("%", "");
  }

  interestRateFocusOut(value) {
    if (!value) { return; }

    this.onKeyUpValidate(value);
    if (this.interestRateNumber && this.isValidInterestRate == true)
      this.interestRateNumber = this.interestRateNumber + "%";
  }

  onKeyUpValidate(value) {
    let isNumber = this.isDecimalNumber(value);
    let double = parseFloat(value);
    if (double <= 0 || double > 100.0 || !isNumber)
      this.isValidInterestRate = false;
    else this.isValidInterestRate = true;
  }

  btnAddItemClick(type: number): void {
    this._financialService.closeFinancialModal();
    this._financialService.openLoading();

    let houseHoldID = localStorage.getItem('houseHoldID');
    // set current houseHoldID for client debt
    this.clientDebt.householdId = houseHoldID;

    // Add new client debt
    if (type == 1) {
      this.onboardingService.addNewDebt(this.primaryClientId, this.clientDebt).subscribe(response => {
        if (response.success) {
          this.resetDebt();
          this._financialService.reloadDebts();
        } else {
          this._financialService.closeLoading();
          this._financialService.openFinancialModal();
          this.confirmationDialogService.showModal({
            title: "Error #" + response.error.errorCode,
            message: response.error.errorMessage,
            btnOkText: "OK"
          });
        }
      }, error => {
        console.log(error);
        this._financialService.closeLoading();
      });
    }

    // Update client debt
    if (type == 2) {
      if (!this.isShowOffsetBalance) this.clientDebt.offsetAccountBalance = 0;
      this.onboardingService.updateClientDebt(this.primaryClientId, this.clientDebt).subscribe(response => {
        if (response.success) {
          this.resetDebt();
          this._financialService.reloadDebts();
        } else {
          this._financialService.closeLoading();
          this._financialService.openFinancialModal();
          this.confirmationDialogService.showModal({
            title: "Error #" + response.error.errorCode,
            message: response.error.errorMessage,
            btnOkText: "OK"
          });
        }
      }, error => {
        console.log(error);
        this._financialService.closeLoading();
      });
    }
  }
  //#endregion

  //#region Helpers
  private updateDebtName(): void {
    let debTypeName: string;
    let ownershipName: string;
    // set debtype
    if (this.clientDebt.debtCategory)
      debTypeName = this.debtCategoryList.find(debt => debt.code == this.clientDebt.debtCategory).name;
    // set ownershipname
    if (this.clientDebt.ownershipType && this.clientDebt.ownershipType != 0) {
      if (this.clientDebt.ownershipType == 100000000)
        ownershipName = this.ownerShipTypes.find(type => type.code.toString() == this.selectedOwnerShip).name;
      else
        ownershipName = this.ownerShipTypes.find(type => type.code == this.clientDebt.ownershipType).name;
    }
    // set debt name
    if (ownershipName && debTypeName)
      this.clientDebt.name = ownershipName + " - " + debTypeName;
    else if (debTypeName)
      this.clientDebt.name = debTypeName;

  }

  private manageDebtViewFromDebtType(): void {
    if (!this.clientDebt.debtCategory) { return; }

    if (this.clientDebt.debtCategory == DebtCategoryType.RentalPropertyLoan || this.clientDebt.debtCategory == DebtCategoryType.HomeMortgage) {
      this.isShowInterestRateType = true;
      this.isShowOffsetAccount = true;
      this.isShowOffsetBalance = this.clientDebt && this.clientDebt.offsetAccountBalance ? true : false;
      this.isShowOffsetBalanceAtBegin = this.clientDebtFromApi && this.clientDebtFromApi.offsetAccountBalance ? true : false;
    } else {
      this.isShowInterestRateType = false;
      this.isShowOffsetAccount = false;
      this.isShowOffsetBalance = false;
      this.isShowOffsetBalanceAtBegin = false;
      this.clientDebt.offsetAccountBalance = undefined;
    }

  }

  private checkFormValidation(debtForm: ClientDebt): boolean {
    if (!debtForm || !debtForm.debtType || !debtForm.ownershipType
      || !debtForm.name || !debtForm.currentBalance) {
      return false;
    }

    return true;
  }

  /** Check value in right format
   * Accept:
   * 0.01
   * 0.12
   * 10.01
   * 100.00
   * ****************
   * Not accept:
   * all number <= 0
   * more than 2 number after dot
   * 010
   * 10.1
   * 100.01
   */
  private isDecimalNumber(value): boolean {
    let regexp = /^(?:[1-9]\d*|0)?(\.\d{0,2})?$/g;
    return regexp.test(value);
  }

  resetDebt() {
    this.clientDebt = new ClientDebt();
    this.currentBalance = undefined;
    this.repayment = undefined;
    this.offsetAccountBalance = undefined;
    this.selectedOwnerShip = undefined;
    this.hasDebtName = false;
    this.interestRateNumber = undefined;
    this.isShowInterestRateType = false;
    this.isShowOffsetAccount = false;
    this.isShowOffsetBalance = false;
    this.isValidInterestRate = true;
    this.isValidForm = true;
  }
  //#endregion

  //#region Input handler
  private onAmountFocus(value, field) {

    if (value && value != "") {
      this[field] = this._financialService.convertCurrencyToNumber(value);
    }
  }

  private onAmountFocusOut(value, field) {

    if (value && value != "") {
      this[field] = this._financialService.convertNumberToCurrency(value);
    }
  }

  private onAmountKeyup(event, field) {
    let value = event.target && event.target.value;
    this.clientDebt[field] = parseInt(this._financialService.convertCurrencyToNumber(value));
  }
  //#endregion

  //#region Handle Data Changes
  private detectDataChanges() {
    if (this.clientDebtFromApi.debtType !== this.clientDebt.debtType
      || this.clientDebtFromApi.debtCategory != this.clientDebt.debtCategory
      || this.clientDebtFromApi.ownershipType !== this.clientDebt.ownershipType
      || this.clientDebtFromApi.name !== this.clientDebt.name
      || this.clientDebtFromApi.currentBalance !== this.clientDebt.currentBalance
      || this.clientDebtFromApi.annualInterestRate !== this.clientDebt.annualInterestRate
      || this.clientDebtFromApi.interestRateType !== this.clientDebt.interestRateType
      || this.clientDebtFromApi.repayment !== this.clientDebt.repayment
      || this.clientDebtFromApi.repaymentFrequency !== this.clientDebt.repaymentFrequency
      || this.isShowOffsetBalanceAtBegin !== this.isShowOffsetBalance
      || this.isShowOffsetBalance && this.clientDebtFromApi.offsetAccountBalance !== this.clientDebt.offsetAccountBalance)
      return true;
    return false;
  }
  //#endregion
}