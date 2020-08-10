import { Component, OnInit, ViewChild, EventEmitter, Output, OnDestroy } from '@angular/core';
import { IncomeComponent } from './income/income.component';
import { ExpenseComponent } from './expense/expense.component';
import { HandleFinancialSituationService } from '../handle-financial-situation.service';
import { OnBoardingCommonComponent } from '../../on-boarding-common.component';

declare var $: any;
@Component({
  selector: 'app-family-cashflow',
  templateUrl: './family-cashflow.component.html',
  styleUrls: ['./family-cashflow.component.css']
})
export class FamilyCashFlowComponent extends OnBoardingCommonComponent implements OnInit, OnDestroy {

  //#region Properties
  @ViewChild("income") income: IncomeComponent;
  @ViewChild("expense") expense: ExpenseComponent;
  @Output("addNewAsset") addNewAsset: EventEmitter<boolean>;

  selectingTab: number = 1;
  isAddNew: boolean = true;
  itemName: string;
  //#endregion

  //#region Constructors
  constructor(private _financialService: HandleFinancialSituationService) {
    super();
    this.addNewAsset = new EventEmitter();
  }

  ngOnInit() {
    super.initPopover();

    // check if there is cashFlow from click and the selected tab
    let temp = this._financialService.getType();

    if (!temp && temp != 0) {
      this.isAddNew = true;

    } else {
      this.isAddNew = false;
      if (temp == -1 || temp == -2 || temp == -3) {
        this.selectingTab = 2;
      } else {
        this.selectingTab = 1;
      }
    }
  }

  ngOnDestroy(): void {
    $('.popover').popover('hide');
  }
  //#endregion 

  //#region View Handlers
  /** Called by the outer component after this component is already created */
  onTabChange(tab: number) {
    this.selectingTab = tab;
    
    // set default as household spending
    this.expense.expenseType = 2;
  }

  /** Called by financial-situation component when income is clicked */
  onIncomeClick() {
    this.isAddNew = false;
    this.income.initIncomeFromClick();
    this.getItemName();

  }

  /** Called by financial-situation component when tax or household spending is clicked */
  onExpenseClick() {
    this.isAddNew = false;
    this.expense.initExpenseFromClick();
    this.getItemName();
  }
  //#endregion

  //#region Helpers
  resetValues() {
    if (this.income)
      this.income.resetValues();
    if (this.expense)
      this.expense.resetValues();

    this.selectingTab = 1;
    this.isAddNew = true;
  }

  getItemName() {
    this.itemName = this._financialService.getName();
  }
  //#endregion
}
