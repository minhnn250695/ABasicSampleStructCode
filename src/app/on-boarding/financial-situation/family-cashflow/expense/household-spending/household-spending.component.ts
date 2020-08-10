import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { OnBoardingCommonComponent } from '../../../../on-boarding-common.component';
import { OnBoardingService } from '../../../../on-boarding.service';
import { Observable } from 'rxjs';
import { HandleFinancialSituationService } from '../../../handle-financial-situation.service';
import { ClientExpense } from '../../../../models';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../../../../common/dialog/confirmation-dialog/confirmation-dialog.service'
declare var $: any;
@Component({
  selector: 'app-household-spending',
  templateUrl: './household-spending.component.html',
  styleUrls: ['./household-spending.component.css']
})

export class HouseholdSpendingComponent extends OnBoardingCommonComponent implements OnInit {
  //#region Properties
  @Output("expenseType") expenseType: EventEmitter<number> = new EventEmitter();

  // view
  selectedFrequency: number;
  selectedSpendingAmount: number;
  selectedSpendingType: number;
  expenseAmount: string;
  houseHoldSpendingFromClick: ClientExpense;
  houseHoldSpendingUpdate: ClientExpense = new ClientExpense();

  // data for init view
  spendingTypeList = [{ code: 509000000, name: "Fixed" }, { code: 509000001, name: "Discretionary" }, { code: 509000003, name: "Other" }];
  frequencyTypeList = [{ code: 100000004, name: "Weekly" }, { code: 100000005, name: "Fortnightly " }, { code: 100000000, name: "Monthly" }, { code: 100000001, name: "Quarterly" }, { code: 100000002, name: "Half Yearly" }, { code: 100000003, name: "Yearly" }];
  //#endregion

  //#region Constructors
  constructor(protected onboardingService: OnBoardingService, private _financialService: HandleFinancialSituationService,
    private confirmationDialogService: ConfirmationDialogService) {
    super();
  }

  ngOnInit() {
    this.initHouseHoldSpendingFromClick();
  }
  //#endregion

  //#region Initial data
  initHouseHoldSpendingFromClick() {
    this.houseHoldSpendingFromClick = this._financialService.initHouseHoldSpending();
    if (this.houseHoldSpendingFromClick) {
      this.houseHoldSpendingUpdate = { ... this.houseHoldSpendingFromClick };
      this.expenseAmount = this._financialService.convertNumberToCurrency(this.houseHoldSpendingUpdate.expenseAmount + '');
    }
  }
  //#endregion

  //#region View handlers
  onExpenseTypeChange(event) {
    if (event && event.target.value) {
      this.expenseType.emit(event.target.value);
    }
  }

  btnAddClick(type: number) {
    this._financialService.closeFinancialModal();
    this._financialService.openLoading();
    if (type == 1) {// add new
      let expenseName = this.spendingTypeList.find(type => type.code == this.houseHoldSpendingUpdate.expenseType).name.toLocaleLowerCase();

      this.houseHoldSpendingUpdate.expenseName = "Household expense " + expenseName;
      this.houseHoldSpendingUpdate.householdId = this.onboardingService.houseHold.id;
      this.houseHoldSpendingUpdate.expenseFrequency = 100000003; // Yearly
      this.onboardingService.addNewClientExpense(this.houseHoldSpendingUpdate).subscribe(res => {
        if (res.success) {
          this._financialService.reloadExpenses();
        } else
          this.showError(res.error);
      })
    } else if (type == 2) { // update
      this.onboardingService.updateClientExpense(this.houseHoldSpendingUpdate).subscribe(res => {
        if (res.success) {
          this._financialService.reloadExpenses();
        } else
          this.showError(res.error);
      })
    }

  }
  //#endregion

  //#region Helpers  

  showError(error: any) {
    this._financialService.closeLoading();
    let subcription: ISubscription = this.confirmationDialogService.showModal({
      title: "Error #" + error.errorCode,
      message: "" + error.errorMessage,
      btnOkText: "Ok"
    }).subscribe(() => {
      subcription.unsubscribe();
    });
  }

  resetValues() {
    this.houseHoldSpendingUpdate = new ClientExpense()
    this.houseHoldSpendingFromClick = undefined;
    this.expenseAmount = undefined;
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
    this.houseHoldSpendingUpdate[field] = parseInt(this._financialService.convertCurrencyToNumber(value));
  }
  //#endregion

  // Handle data changes
  private detectDataChanges() {
    if (this.houseHoldSpendingFromClick.expenseAmount != parseInt(this._financialService.convertCurrencyToNumber(this.expenseAmount)) ||
      this.houseHoldSpendingFromClick.expenseType != this.houseHoldSpendingUpdate.expenseType) {
      return true;
    }
    return false;
  }

}
