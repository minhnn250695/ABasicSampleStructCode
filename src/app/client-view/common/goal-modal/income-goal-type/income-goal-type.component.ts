import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { GoalsModel, IncomeFrequency, IncomeType, FinancialFrequencyType } from '../../../models';
import { OptionModel, ClientIncome } from '../../../../on-boarding/models';
import { Pairs } from '../../../../revenue-import/models';
import { DatepickerComponent } from '../../../../common/components/datepicker/datepicker.component';
import { FamilyMembers, AdviceBuilderService } from '../../../advice-builder/advice-builder.service';
import { Router } from '@angular/router';
import { IncomeActionModel } from '../../../models/current-scenario/income-action.model';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { OnBoardingCommonComponent } from '../../../../on-boarding/on-boarding-common.component';
import { HandleErrorMessageService } from '../../../../common/services/handle-error.service';
import { ClientViewService } from '../../../client-view.service';
declare var $: any;
@Component({
  selector: 'income-goal-type',
  templateUrl: './income-goal-type.component.html',
  styleUrls: ['./income-goal-type.component.css'],
})


export class IncomeGoalTypeComponent extends OnBoardingCommonComponent implements OnInit {

  @Input("goal") goalInput: GoalsModel = new GoalsModel();
  @Input() iconCSS: string = "";
  @Input() goalTypeName: string = "";
  @Input() goalIconCSS: string = "";
  @Input() clientAssets: Pairs[];
  @Input() clientDebts: Pairs[];
  @Input() readOnly: boolean = false;
  @Input() clientIncomeList: ClientIncome[] = [];
  @Input() isCreateGoal: boolean = true;
  @Input() isLandingPage: boolean = false;

  @Output() goalEmitting: EventEmitter<GoalsModel> = new EventEmitter();

  private members: FamilyMembers[] = [];
  private financeFrequencyType: Array<OptionModel<number>> = [];
  private incomeFrequencyList: Array<OptionModel<number>> = [];
  private incomeTypeList: Array<OptionModel<number>> = [];

  private selectedIncomeId: string;
  private goalOutPut: GoalsModel = new GoalsModel();
  private isShowLastYear: boolean = true;
  private grossIncome: string = "";
  private preTaxSpending: string = "";
  private taxPaid: string = "";
  iconCSSList: string[] = [
    // lifestyles/ family
    "fa-paint-brush",
    "fa-university",
    "fa-child",
    "fa-home",
    "fa-plane",
    "fa-car",
    //employment
    "fa-arrow-up",
    "fa-arrow-down",
    "fa-map-signs",
    "fa-rocket",
    "fa-hands-usd",
    // Financial category
    "fa-money-bill",
    "fa-building",
    "fa-suitcase",
    // Risk Management category
    "fa-file-alt",
    "fa-user",
    // The future category
    "fa-wheelchair",
    "fa-hand-holding-usd",
    "fa-blind",
    "fa-ellipsis-h",
    "fa-question-circle"
  ];

  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private router: Router,
    private clientViewService: ClientViewService,
    private confirmationDialogService: ConfirmationDialogService
  ) { super(); }

  ngOnInit() {
    //init data for dropdown on view
    this.initDataSource();
    // reset input value after modal hidden
    $('#update-goal').on('hidden.bs.modal', () => {
      this.resetInputValue();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isLandingPage && changes.isLandingPage.firstChange) {
      if (this.isLandingPage) { // client view landing
        this.members = this.clientViewService.familyMembers;
      } else {// advice builder page
        this.members = this.adviceBuilderService.selectedScenario.familyMembers;
      }
    }
    if (changes.goalInput && changes.goalInput.currentValue) {
      this.goalOutPut = JSON.parse(JSON.stringify(this.goalInput));
      if (!this.goalOutPut.income) { this.goalOutPut.income = new IncomeActionModel() }

      // only show endYear if endYear != startYear
      if (this.goalOutPut.startYear != this.goalOutPut.endYear) {
        this.isShowLastYear = true;
      } else this.isShowLastYear = false;
      // check if current is existing income => show it on the dropdow
      
      this.clientIncomeList.forEach(income => {
        if ((this.goalOutPut && this.goalOutPut.income) && income.id == this.goalOutPut.income.incomeId) {
          this.selectedIncomeId = this.goalOutPut.income.incomeId;
        }
      });

      // add current symbol for gross income/pre tax/ tax paid if they have value
      this.updateIncomeToView();
    }
  }

  private initDataSource() {
    // init value for frequency type and funded from type
    this.financeFrequencyType = this.getFinanceFrequencyTypes();
    this.incomeFrequencyList = this.getIncomeFrequency();
    this.incomeTypeList = this.getIncomeType();
  }

  private emitGoalToSave() {
    // pre-tax spending may empty => then set it is 0    
    if (!this.preTaxSpending) {
      this.goalOutPut.income.preTaxSpending = 0;
    }
    let isValidFirstYear = this.validateYearCreate(this.goalOutPut.startYear);
    let isValidLastYear = this.validateYearCreate(this.goalOutPut.endYear);

    // check first year and last year is greater than current year
    if (isValidFirstYear && isValidLastYear) {
      if (this.goalOutPut.financeFrequency == 0) { // only first year
        this.goalOutPut.endYear = this.goalOutPut.startYear;
        // make sure contact id of income is same with contact id of goal income
        this.goalOutPut.income.contactId = this.goalOutPut.contactId;
        this.goalEmitting.emit(this.goalOutPut);
        $('#update-goal').modal('hide');
      } else { // first year and last year
        if (this.validateEndYearGeaterStartYear(this.goalOutPut.startYear, this.goalOutPut.endYear)) {
          this.goalEmitting.emit(this.goalOutPut);
          $('#update-goal').modal('hide');
        } else {
          this.showInvalidYear('End year', 'Start year');
        }
      }
    } else { // invalid first year or last year
      let currentYear = new Date().getFullYear().toString();
      if (!isValidFirstYear) {
        this.showInvalidYear('Starting year', currentYear);
      } else if (!isValidLastYear) {
        this.showInvalidYear('End year', currentYear);
      }
    }
  }

  private viewDetectChange() {
    // if (!this.isCreateGoal) { // is update goal
      // if goal input different from goalInput => change
      if (this.goalInput.name != this.goalOutPut.name ||
        (this.goalInput.income && this.goalInput.income.incomeName) != (this.goalOutPut.income && this.goalOutPut.income.incomeName) ||
        this.goalInput.contactId != this.goalOutPut.contactId ||
        this.goalInput.financeFrequency != this.goalOutPut.financeFrequency ||
        (this.goalInput.income && this.goalInput.income.incomeFrequency) != (this.goalOutPut.income && this.goalOutPut.income.incomeFrequency) ||
        (this.goalInput.income && this.goalInput.income.incomeType) != (this.goalOutPut.income && this.goalOutPut.income.incomeType) ||
        this.goalInput.startYear != this.goalOutPut.startYear ||
        this.goalInput.endYear != this.goalOutPut.endYear ||
        (this.goalInput.income && this.goalInput.income.grossIncome) != parseInt(this.returnDecimalValue(this.grossIncome)) ||
        (this.goalInput.income && this.goalInput.income.preTaxSpending) != parseInt(this.returnDecimalValue(this.preTaxSpending)) ||
        (this.goalInput.income && this.goalInput.income.taxPaid) != parseInt(this.returnDecimalValue(this.taxPaid))
      ) {
        return true;
      }
    // }
    // create new goal or not change
    return false;
  }

  private returnDecimalValue(number: string) {
    if (!number) return;
    return number.replace(/[^0-9.`-]+/g, "");
  }

  private returnCurrenyFormat(number: string) {
    return '$' + number.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  private updateIncomeToView() {
    if (this.goalOutPut.income && (this.goalOutPut.income.grossIncome || this.goalOutPut.income.grossIncome == 0)) {
      this.grossIncome = this.returnCurrenyFormat(this.goalOutPut.income.grossIncome.toString());
    }
    if (this.goalOutPut.income && (this.goalOutPut.income.preTaxSpending || this.goalOutPut.income.preTaxSpending == 0)) {
      this.preTaxSpending = this.returnCurrenyFormat(this.goalOutPut.income.preTaxSpending.toString());
    }
    if (this.goalOutPut.income && (this.goalOutPut.income.taxPaid || this.goalOutPut.income.taxPaid == 0)) {
      this.taxPaid = this.returnCurrenyFormat(this.goalOutPut.income.taxPaid.toString());
    }
  }

  private financeFrequencyChange(event: any) {
    let value = event.target && event.target.value;
    if (value == 0) {
      this.goalOutPut.endYear = this.goalOutPut.startYear;
    } else {
      this.goalOutPut.endYear = undefined;
      this.isShowLastYear = true;
    }
  }

  private incomeChange(event: any) {
    let incomeId = event && event.target.value;
    let houseHoldId = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldId || !selectedStrategyID) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      // get selected income by 'incomeId'
      this.adviceBuilderService.showLoading()
      this.resetIncomeValue();
      this.adviceBuilderService.getClientIncomeDetails(houseHoldId, selectedStrategyID, incomeId).subscribe(res => {
        this.adviceBuilderService.hideLoading()
        if (res.success) {
          let selectedIncome = res.data as IncomeActionModel;

          //auto field income witd value of income have "incomeId" above
          this.goalOutPut.income.incomeId = selectedIncome.incomeId;

          //api only update value for contactId of goal. Not update for contact id of income
          this.goalOutPut.contactId = this.goalOutPut.income.contactId = selectedIncome.contactId;
          this.goalOutPut.income.incomeFrequency = selectedIncome.incomeFrequency;
          this.goalOutPut.income.incomeName = selectedIncome.incomeName;
          this.goalOutPut.income.incomeType = selectedIncome.incomeType;
          this.goalOutPut.income.grossIncome = selectedIncome.grossIncome;
          this.goalOutPut.income.preTaxSpending = selectedIncome.preTaxSpending;
          this.goalOutPut.income.taxPaid = selectedIncome.taxPaid;
          this.goalOutPut.startYear = selectedIncome.startYear;
          this.goalOutPut.endYear = undefined;
          this.updateIncomeToView();
        }
        else {
          this.handleErrorMessageService.handleErrorResponse(res);
        }
      })

    }
  }

  private onInputFocusIn(value, type) {
    if (value && value != "") {
      switch (type) {
        case 1: this.grossIncome = this.returnDecimalValue(value); break;
        case 2: this.preTaxSpending = this.returnDecimalValue(value); break;
        case 3: this.taxPaid = this.returnDecimalValue(value); break;
      }
    }
  }

  private onInputFocusOut(value, type) {
    if (value && value != "") {
      switch (type) {
        case 1: this.grossIncome = this.returnCurrenyFormat(value); break;
        case 2: this.preTaxSpending = this.returnCurrenyFormat(value); break;
        case 3: this.taxPaid = this.returnCurrenyFormat(value); break;
      }
    }
  }

  private onGrossIncomeKeyup(event) {
    let value = event.target && event.target.value;
    if (value)
      this.goalOutPut.income.grossIncome = parseInt(value.replace(/[^0-9.`-]+/g, ""));
  }

  private onPreTaxKeyup(event) {
    let value = event.target && event.target.value;
    this.goalOutPut.income.preTaxSpending = parseInt(value.replace(/[^0-9.`-]+/g, ""));
  }

  private onTaxPaidKeyup(event) {
    let value = event.target && event.target.value;
    this.goalOutPut.income.taxPaid = parseInt(value.replace(/[^0-9.`-]+/g, ""));
  }

  private resetInputValue() {
    this.goalOutPut = new GoalsModel();
    //set frequence is yearly as default
    this.goalOutPut.financeFrequency = 1;
    this.selectedIncomeId = undefined;
    this.grossIncome = undefined;
    this.taxPaid = undefined;
    this.preTaxSpending = undefined;
  }

  private resetIncomeValue() {
    this.goalOutPut.income = new IncomeActionModel();
    this.goalOutPut.startYear = undefined;
    //set frequence is yearly as default
    this.goalOutPut.financeFrequency = 0;
    this.grossIncome = undefined;
    this.taxPaid = undefined;
    this.preTaxSpending = undefined;
  }

  private getIncomeFrequency() {
    let options: Array<OptionModel<number>> = [
      { name: "Weekly", code: IncomeFrequency.Weekly },
      { name: "Fortnightly", code: IncomeFrequency.Fortnightly },
      { name: "Monthly", code: IncomeFrequency.Monthly },
      { name: "Quarterly", code: IncomeFrequency.Quarterly },
      { name: "HalfYearly", code: IncomeFrequency.HalfYearly },
      { name: "Yearly", code: IncomeFrequency.Yearly }
    ];
    return options;
  }

  private getIncomeType() {
    let options: Array<OptionModel<number>> = [
      { name: "Employment", code: IncomeType.Employment },
      { name: "GovernmentBenefit", code: IncomeType.GovernmentBenefit },
      { name: "Other", code: IncomeType.Other },
    ];
    return options;
  }


  // private checkValidYear(startYear: string, endYear: string) {
  //   if (parseInt(endYear) < parseInt(startYear)) {
  //     return false;
  //   }
  //   return true;
  // }

  private validateYearCreate(createYear: number) {
    let currentYear = new Date().getFullYear();
    if (currentYear > createYear)
      return false;
    return true;
  }

  private validateEndYearGeaterStartYear(startYear: number, endYear: number) {
    if (startYear > endYear) {
      return false;
    }
    return true;
  }

  private showInvalidYear(greaterYear: string = '', lesserYear: string = '') {
    let iSub = this.confirmationDialogService.showModal({
      title: "Validation error",
      message: greaterYear + " must be greater than or equal to " + lesserYear,
      btnOkText: "Ok"
    }).subscribe(res => {
      iSub.unsubscribe();
    })
  }
}