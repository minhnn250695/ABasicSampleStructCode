import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { GoalsModel, IncomeFrequency, IncomeType, FinancialFrequencyType } from '../../../models';
import { OptionModel, ClientIncome } from '../../../../on-boarding/models';
import { Pairs } from '../../../../revenue-import/models';
import { DatepickerComponent } from '../../../../common/components/datepicker/datepicker.component';
import { FamilyMembers, AdviceBuilderService } from '../../../advice-builder/advice-builder.service';
import { Router } from '@angular/router';
import { IncomeActionModel } from '../../../models/current-scenario/income-action.model';
import { OnBoardingCommonComponent } from '../../../../on-boarding/on-boarding-common.component';
import { HandleErrorMessageService } from '../../../../common/services/handle-error.service';
declare var $: any;
@Component({
  selector: 'income-goal-type-view',
  templateUrl: './income-goal-type-view.component.html',
  styleUrls: ['./income-goal-type-view.component.css'],
})


export class IncomeGoalTypeViewComponent extends OnBoardingCommonComponent implements OnInit {

  @Input("goal") goalInput: GoalsModel = new GoalsModel();
  @Input() iconCSS: string = "";
  @Input() goalTypeName: string = "";
  @Input() goalIconCSS: string = "";
  @Input() clientAssets: Pairs[];
  @Input() clientDebts: Pairs[];
  @Input() readOnly: boolean = false;
  @Output() goalEmitting: EventEmitter<GoalsModel> = new EventEmitter();

  private members: FamilyMembers[] = [];
  private FinancialFrequencyType: Array<OptionModel<number>> = [];
  private incomeFrequencyList: Array<OptionModel<number>> = [];
  private incomeTypeList: Array<OptionModel<number>> = [];
  private clientIncomeList: ClientIncome[] = []
  private selectedIncomeId: string = "-1";
  private goalOutPut: GoalsModel = new GoalsModel();
  private isShowLastYear = true;
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
  ) { super(); }

  ngOnInit() {
    //init data for dropdown on view
    this.initDataSource();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.goalTypeName && changes.goalTypeName.firstChange) {
      this.members = this.adviceBuilderService.selectedScenario.familyMembers;
    }
    if (changes.goalInput && changes.goalInput.currentValue) {
      this.goalOutPut = JSON.parse(JSON.stringify(this.goalInput));
      // only show endYear if endYear != startYear
      if (this.goalOutPut.startYear != this.goalOutPut.endYear) {
        this.isShowLastYear = true;
      } else this.isShowLastYear = false;
    }

  }

  private initDataSource() {
    // init value for frequency type and funded from type
    this.FinancialFrequencyType = this.getFinanceFrequencyTypes();
    this.incomeFrequencyList = this.getIncomeFrequency();
    this.incomeTypeList = this.getIncomeType();
    this.clientIncomeList = this.adviceBuilderService.clientIncomeSource;

  }

  // private emitGoalToSave() {
  //   // console.log('Current goal to create', this.goal);
  //   if (!this.goalOutPut.endYear)
  //     this.goalOutPut.endYear = this.goalOutPut.startYear;
  //   this.goalEmitting.emit(this.goalOutPut);
  // }

  // private incomeChange(event: any) {
  //   let incomeId = event && event.target.value;
  //   let houseHoldId = localStorage.getItem('houseHoldID');
  //   let selectedStrategyID = localStorage.getItem('selectedStrategyID');
  //   if (!houseHoldId || !selectedStrategyID) {
  //     this.router.navigate(["/client-view/advice-builder"]);
  //   } else {
  //     // get selected income by 'incomeId'
  //     this.adviceBuilderService.showLoading()
  //     this.adviceBuilderService.getClientIncomeDetails(houseHoldId, selectedStrategyID, incomeId).subscribe(res => {
  //       this.adviceBuilderService.hideLoading()
  //       if (res.success) {
  //         let selectedIncome = res.data as IncomeActionModel;

  //         //auto field income witd value of income have "incomeId" above
  //         this.goalOutPut.income.incomeId = selectedIncome.incomeId;

  //         this.goalOutPut.income.contactId = selectedIncome.contactId;
  //         this.goalOutPut.income.incomeFrequency = selectedIncome.incomeFrequency;
  //         this.goalOutPut.income.incomeName = selectedIncome.incomeName;
  //         this.goalOutPut.income.incomeType = selectedIncome.incomeType;
  //         this.goalOutPut.income.grossIncome = selectedIncome.grossIncome;
  //         this.goalOutPut.income.preTaxSpending = selectedIncome.preTaxSpending;
  //         this.goalOutPut.income.taxPaid = selectedIncome.taxPaid;
  //       }
  //       else {
  //         this.handleErrorMessageService.handleErrorResponse(res);
  //       }
  //     })

  //   }
  // }

  // private resetInputValue() {
  //   this.goalOutPut = new GoalsModel();
  //   //set frequence is yearly as default
  //   this.goalOutPut.financeFrequency = 1;
  //   this.selectedIncomeId = "-1";
  // }

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

  getSelectedIncomeType() {
    var incomeType = "N/A";
    if (this.goalOutPut && this.goalOutPut.income && this.goalOutPut.income.incomeType != undefined) {
      var incomeTypeList = this.incomeTypeList.filter(type => type.code == this.goalOutPut.income.incomeType)
      incomeType = incomeTypeList[0].name;
    }
    return incomeType;
  }

  getSelectedIncomeFrequency() {
    var incomeFrequency = "N/A";
    if (this.goalOutPut && this.goalOutPut.income && this.goalOutPut.income.incomeFrequency != undefined) {
      var incomeFrequencyList = this.incomeFrequencyList.filter(type => type.code == this.goalOutPut.income.incomeFrequency)
      incomeFrequency = incomeFrequencyList[0].name;
    }
    return incomeFrequency;
  }

  getSelectedFinanceFrequency() {
    var financeFrequency = "N/A";
    if (this.goalOutPut.financeFrequency != undefined) {
      var FinancialFrequencyType = this.FinancialFrequencyType.filter(type => type.code == this.goalOutPut.financeFrequency)
      financeFrequency = FinancialFrequencyType[0].name;
    }
    return financeFrequency;
  }

  getSelectedClientIncome() {
    var clientIncome = "N/A";
    if (this.selectedIncomeId != undefined) {
      var clientIncomeList = this.clientIncomeList.filter(income => income.id == this.selectedIncomeId);
    }
    return clientIncome;
  }

  getSelectedHouseHoldMember() {
    var member = "N/A";
    if (!this.goalOutPut.income) return member;
    if (this.goalOutPut.income.contactId != undefined && this.goalOutPut.income.contactId != "00000000-0000-0000-0000-000000000000") {
      var houseHoldMembers = this.members.filter(member => member.contactId == this.goalOutPut.income.contactId)
      member = (houseHoldMembers && houseHoldMembers.length > 0) ? houseHoldMembers[0].firstName : 'N/A';
    }
    return member;
  }
}

