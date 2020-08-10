import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { GoalsModel } from '../../models';
import { RetirementProjectionModel } from '../../models';
import { AdviceBuilderService } from '../../advice-builder/advice-builder.service';
import { HandleErrorMessageService } from '../../../common/services/handle-error.service';
import { GoalCategoryType, GoalSubCategoryType } from '../../models';

const COLORS = { cashflow: "#00BCF2", debt: "#FFB900", retirement: "#EC008C", personal: "#00B294" };

const GoalTypes = {
  income: 0,
  retirement: 1,
  debt: 2,
  risk: 3,
  expense: 4,
};

declare var $: any;
@Component({
  selector: 'app-timeline-mobile',
  templateUrl: './timeline-mobile.component.html',
  styleUrls: ['./timeline-mobile.component.css']
})

export class TimelineMobileComponent implements OnInit, OnChanges, OnDestroy {

  @Input() events: GoalsModel[] = [];
  @Input() showInvestfit: boolean = false;
  @Input() allowEditRetirementIncome: boolean = false;
  @Input() allowUpdateGoalDetail: boolean = false;
  @Input() showAdditionalButton: string;
  @Input() retirementProjection: RetirementProjectionModel = new RetirementProjectionModel();
  @Output() retirementIncomeTargetSave: EventEmitter<any> = new EventEmitter();

  @Input() activeAssetList: any[] = [];
  @Input() activeDebtList: any[] = [];

  selectingPeriod: GoalsModel = new GoalsModel();
  currentYear: number = new Date().getFullYear();
  curPost: number;
  timeLineWidth: number;
  constructor(
    private router: Router,
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.events && changes.events.currentValue && changes.events.currentValue.length > 0) {
      let availableEvents = changes.events.currentValue.filter(event => !event.predefined || event.name === "Retirement Income");
      availableEvents = this.filterGoals(availableEvents);
      this.events = availableEvents;
      if (this.events && this.events.length > 0) {
        this.events.sort((a, b) => this.sortEventsAscending(a, b));
      }
    }
  }

  ngOnDestroy() {
    $(".modal.fade.in").modal("hide");
  }

  initialColor() {
    if (this.events.length > 0) {
      let substyle: any = document.createElement("style");
      document.head.appendChild(substyle);
      for (let index in this.events) {
        if (index) {
          let period$ = this.events[index];
          let periodId = `period${index}`;

          if (period$.type === GoalTypes.income || period$.type === GoalTypes.expense)
            period$.color = COLORS.cashflow;
          else if (period$.type === GoalTypes.risk)
            period$.color = COLORS.personal;
          else if (period$.type === GoalTypes.debt)
            period$.color = COLORS.debt;
          else if (period$.type === GoalTypes.retirement)
            period$.color = COLORS.retirement;

          substyle.sheet.insertRule('li#' + periodId + '::before { background-color: ' + period$.color + ' } ', 0);
          substyle.sheet.insertRule('li#' + periodId + '::after { background-color: ' + period$.color + ' } ', 0);
        }
      }
    }
  }

  selectPeriod(index: number) {
    if (index >= 0 && index < this.events.length) {
      this.selectingPeriod = { ...this.events[index] };
      this.curPost = index;
    }
  }

  updateGoal(index: number) {
    this.selectPeriod(index)
    this.getGoalDetail()
  }

  getGoalDetail() {
    const houseHoldId = localStorage.getItem('houseHoldID');
    const selectedStrategyID = localStorage.getItem('selectedStrategyID');
    const goalId = this.selectingPeriod.goalId;

    if (!houseHoldId || !selectedStrategyID || !goalId) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      // update selected goal value
      this.adviceBuilderService.getGoalDetailsById(houseHoldId, selectedStrategyID, goalId).subscribe(res => {
        if (res.success) {
          this.selectingPeriod = res.data;
          this.getCurrentGoalType(this.selectingPeriod.category);
        } else {
          this.handleErrorMessageService.handleErrorResponse(res);
        }
      })
    }
  }

  private filterGoals(goals: GoalsModel[]) {
    let availableGoal: GoalsModel[] = [];
    goals.forEach(goal => {
      // type === 1 is retirement goal
      if (goal.type === 1) { availableGoal.push(goal); }

      switch (goal.subCategory) {
        case GoalSubCategoryType.HouseRenovation: availableGoal.push(goal); break;
        case GoalSubCategoryType.ChildrenEducation: availableGoal.push(goal); break;
        case GoalSubCategoryType.NewChild: availableGoal.push(goal); break;
        case GoalSubCategoryType.SaveForHome: availableGoal.push(goal); break;
        case GoalSubCategoryType.SaveForHoliday: availableGoal.push(goal); break;
        case GoalSubCategoryType.SaveForACar: availableGoal.push(goal); break;

        case GoalSubCategoryType.IncreaseIncome: availableGoal.push(goal); break;
        case GoalSubCategoryType.DecreaseIncome: availableGoal.push(goal); break;
        case GoalSubCategoryType.CareerChange: availableGoal.push(goal); break;
        case GoalSubCategoryType.ExtendedLeave: availableGoal.push(goal); break;

        case GoalSubCategoryType.BudgetManagement: availableGoal.push(goal); break;
        case GoalSubCategoryType.GeneralInvesting: availableGoal.push(goal); break;
        case GoalSubCategoryType.PurchaseProperty: availableGoal.push(goal); break;
        case GoalSubCategoryType.InvestShares: availableGoal.push(goal); break;

        case GoalSubCategoryType.Wills: availableGoal.push(goal); break;
        case GoalSubCategoryType.PowersOfAttorney: availableGoal.push(goal); break;

        case GoalSubCategoryType.EstatePlanning: availableGoal.push(goal); break;
        case GoalSubCategoryType.AgedCare: availableGoal.push(goal); break;
        default: { }
      }
    });
    return availableGoal;
  }

  private getCurrentGoalType(category: number) {
    // set tempory if don't have category
    if (!category) return this.selectingPeriod.category = 1;

    switch (category) {
      case GoalCategoryType.Lifestyle: this.selectingPeriod.goalType = 1; break;
      case GoalCategoryType.Employment: this.selectingPeriod.goalType = 3; break;
      case GoalCategoryType.Financial:
        {
          if (this.selectingPeriod.subCategory == GoalSubCategoryType.BudgetManagement)
            this.selectingPeriod.goalType = 2
          else
            this.selectingPeriod.goalType = 1;
        }; break;
      case GoalCategoryType.Riskmanagement: this.selectingPeriod.goalType = 2; break;
      case GoalCategoryType.TheFuture:
        {
          if (this.selectingPeriod.subCategory == GoalSubCategoryType.LeaveInheritance)
            this.selectingPeriod.goalType = 1;
          else this.selectingPeriod.goalType = 2;
        }; break;
      default: this.selectingPeriod.goalType = 1;
    }
  }

  returnGoalIconCSS(goalSubCategory: number, type: number) {
    let iconCss = "";
    // retirement income => type == 1
    if (type == 1) { return iconCss = "fa-cocktail"; }

    switch (goalSubCategory) {
      // lifestyles/ family
      case GoalSubCategoryType.HouseRenovation: iconCss = "fa-paint-brush"; break;
      case GoalSubCategoryType.ChildrenEducation: iconCss = "fa-university"; break;
      case GoalSubCategoryType.NewChild: iconCss = "fa-child"; break;
      case GoalSubCategoryType.SaveForHome: iconCss = "fa-home"; break;
      case GoalSubCategoryType.SaveForHoliday: iconCss = "fa-plane"; break;
      case GoalSubCategoryType.SaveForACar: iconCss = "fa-car"; break;
      //employment
      case GoalSubCategoryType.IncreaseIncome: iconCss = "fa-arrow-up"; break;
      case GoalSubCategoryType.DecreaseIncome: iconCss = "fa-arrow-down"; break;
      case GoalSubCategoryType.CareerChange: iconCss = "fa-map-signs"; break;
      case GoalSubCategoryType.ExtendedLeave: iconCss = "fa-rocket"; break;
      case GoalSubCategoryType.ReceiveInheritance: iconCss = "fa-hands-usd"; break;
      // Financial category
      case GoalSubCategoryType.BudgetManagement: iconCss = "fa-money-bill"; break;
      case GoalSubCategoryType.GeneralInvesting: iconCss = "fa-dollar-sign"; break;
      case GoalSubCategoryType.PurchaseProperty: iconCss = "fa-building"; break;
      case GoalSubCategoryType.InvestShares: iconCss = "fa-suitcase"; break;
      // Risk Management category
      case GoalSubCategoryType.Wills: iconCss = "fa-file-alt"; break;
      case GoalSubCategoryType.PowersOfAttorney: iconCss = "fa-user"; break;
      // The future category
      case GoalSubCategoryType.EstatePlanning: iconCss = "fa-wheelchair"; break;
      case GoalSubCategoryType.LeaveInheritance: iconCss = "fa-hand-holding-usd"; break;
      case GoalSubCategoryType.AgedCare: iconCss = "fa-blind"; break;
      // Other goal category
      case GoalSubCategoryType.Other: iconCss = "fa-ellipsis-h"; break;
      default: {
        iconCss = "fa-question-circle";
      }
    }
    return iconCss;
  }

  goToReportPage() {
    this.router.navigate(["/client-view/retirement-report"]);
  }

  goToStrategyDetails(scenarioId: string) {
    this.router.navigate(['/client-view/advice-builder/strategy-details']);
  }

  btnSaveClick(targetValue: any) {
    let incomeTargetValue = parseFloat(targetValue);
    if (incomeTargetValue || incomeTargetValue === 0) {
      this.retirementIncomeTargetSave.emit(incomeTargetValue);
    }
    else
      this.retirementIncomeTargetSave.emit(null);
  }

  private shiftTimeline(index: number) {
    let distance = 30;
    let finalPos = 0 - (distance * index);
    document.getElementById("period-nodes").style.left = `${finalPos}px`;
  }

  private sortEventsAscending(a: GoalsModel, b: GoalsModel) {
    return a.startYear - b.startYear;
  }
}
export enum GoalType {
  spending = 1,
  non_spending = 2,
  income = 3,
}

export enum GoalString {
  // Lifestyle category
  HouseRenovation = "House renovation",
  ChildrenEducation = "Children's education",
  NewChild = "A new child",
  SaveForHome = "Save for a home",
  SaveForHoliday = "Save for a holiday",
  LifestyleOther = "Lifestyle other",
  // Employment category
  IncreaseIncome = "Increase in income",
  DecreaseIncome = "Decrease in income",
  CareerChange = "Career change",
  ExtendedLeave = "Extended leave",
  ReceiveInheritance = "Receive inheritance",
  EmploymentOther = "Employment other",
  // Financial category
  BudgetManagement = "Budget management",
  PurchaseProperty = "Purchase property",
  InvestShares = "Invest in shares",
  ReduceDebt = "Reduce debt",
  FinancialOther = "Financial other",
  // Risk Management category
  Wills = "Wills",
  PowersOfAttorney = "Powers of attorney",
  RiskManagementOther = "Risk management other",
  // The future category
  EstatePlanning = "Estate planning",
  LeaveInheritance = "Leave inheritance",
  AgedCare = "Aged care",
  FutureOther = "Future other"
}