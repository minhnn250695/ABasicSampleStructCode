import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { OnBoardingCommonComponent } from '../../../../on-boarding-common.component';
import { OptionModel } from '../../../../models';
import { OnBoardingService } from '../../../../on-boarding.service';
import { Observable } from 'rxjs';
import { HandleFinancialSituationService } from '../../../handle-financial-situation.service';

@Component({
  selector: 'app-tax',
  templateUrl: './tax.component.html',
  styleUrls: ['./tax.component.css']
})
export class TaxComponent extends OnBoardingCommonComponent implements OnInit {

  //#region Properties
  @Output("expenseType") expenseType: EventEmitter<number> = new EventEmitter();

  taxAmount: number;
  selectedMember: string;
  familyMembers: OptionModel<string>[];
  taxFromClick: any;
  //#endregion

  //#region Constructors
  constructor(protected onboardingService: OnBoardingService, private _financialService: HandleFinancialSituationService) {
    super();
    this.familyMembers = [];
  }

  ngOnInit() {
    let members = this.getPrimarySpouseFirstNameWithId(
      this.onboardingService.houseHold
    );
    members.forEach(m => { this.familyMembers.unshift(m); });

    this.initTaxFromClick();
  }
  //#endregion

  //#region Initial data
  /** Get data if tax is clicked  */
  initTaxFromClick() {
    this.taxFromClick = this._financialService.initTax();
    if (this.taxFromClick) {
      this.taxAmount = this.taxFromClick.tax;
      this.selectedMember = this.taxFromClick.primaryClientId;
    }
  }
  //#endregion

  //#region View handler
  onFamilyMemberChange(event) {
    if (event) {
      this.selectedMember = event;
    }
  }

  onExpenseTypeChange(event) {
    if (event && event.target.value) {
      this.expenseType.emit(event.target.value);
    }
  }

  btnAddClick() {
    this._financialService.closeFinancialModal();
    this._financialService.openLoading();

    this.createUpdateTaxObservable().subscribe(response => {
      this.resetValues();

      // reload incomes/expenses list
      this._financialService.reloadIncomesExpenses();
    });
  }
  //#endregion

  //#region Helpers
  createUpdateTaxObservable(): Observable<any> {
    let value = this.taxAmount;

    if (value || value == 0) {
      let form = {
        "MemberId": this.selectedMember,
        "IncomeTax": value
      };

      return this.onboardingService.updateCashFlow(form);
    }
  }

  resetValues() {
    this.selectedMember = undefined;
    this.taxAmount = undefined;
    this.taxFromClick = undefined;
  }
  //#endregion
}
