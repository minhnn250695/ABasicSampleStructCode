import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { ExpenseComponent } from '../../../../on-boarding/financial-situation/family-cashflow/expense/expense.component';
import { HandleFinancialSituationService } from '../../../../on-boarding/financial-situation/handle-financial-situation.service';

@Component({
  selector: 'app-mobile-expense',
  templateUrl: './mobile-expense.component.html',
  styleUrls: ['./mobile-expense.component.css']
})

export class MobileExpenseComponent extends ExpenseComponent implements OnInit {

  constructor(_financialService: HandleFinancialSituationService) {
    super(_financialService);
  }

  ngOnInit() {
    super.ngOnInit();
  }
}
