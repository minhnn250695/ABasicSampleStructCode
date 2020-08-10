import { Component, OnInit, ViewChild } from '@angular/core';
import { TaxComponent } from './tax/tax.component';
import { HouseholdSpendingComponent } from './household-spending/household-spending.component';
import { HandleFinancialSituationService } from '../../handle-financial-situation.service';
import { ExpenseType } from '../../../models';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
})

export class ExpenseComponent implements OnInit {
  //#region Properties
  @ViewChild("tax") tax: TaxComponent;
  @ViewChild("houseHoldSpending") houseHoldSpending: HouseholdSpendingComponent;
  // @Input("expense") expense: any;

  expenseType: number;  // 1: tax; 2: household spending
  isValidInput: boolean;
  //#endregion 

  //#region Constructors
  constructor(private _financialService: HandleFinancialSituationService) {
  }

  ngOnInit() {
    this.initExpenseFromClick();
  }
  //#endregion 

  //#region Initial data
  initExpenseFromClick() {
    let temp = this._financialService.getType();
    if (!temp || temp == -1) {
      this.expenseType = 1;
    } else if(temp == ExpenseType.Fixed || temp == ExpenseType.Discretionary || temp == ExpenseType.Other) {
      this.expenseType = 2;
    }

    if (temp == -1 && this.tax) {
      this.tax.initTaxFromClick();
    } else if (this.houseHoldSpending) {
      this.houseHoldSpending.initHouseHoldSpendingFromClick();
    }
  }
  //#endregion 

  //#region View handlers
  handleExpenseTypeChange(type) {
    if (type) {
      this.expenseType = type;
    }
  }
  //#endregion

  //#region Helpers
  resetValues() {
    if (this.expenseType == 1) {
      this.tax.resetValues();
    } else if (this.expenseType == 2) {
      this.houseHoldSpending.resetValues();
    }
  }
  //#endregion
}
