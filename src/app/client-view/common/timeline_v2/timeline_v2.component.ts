import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { GoalsModel } from '../../models';
import { RetirementProjectionModel } from '../../models';
import { AdviceBuilderService } from '../../advice-builder/advice-builder.service';
import { GoalCategoryType, GoalSubCategoryType } from '../../models';
import { TimelineV2Service } from './timeline_v2.service';
import { ISubscription } from 'rxjs/Subscription';
import { ThirdPartyService } from '../../../third-party/third-party.service'
import { HandleErrorMessageService } from '../../../common/services/handle-error.service';

declare var $: any;
@Component({
  selector: 'app-timeline-v2',
  templateUrl: './timeline_v2.component.html',
  styleUrls: ['./timeline_v2.component.css'],
  providers: [ThirdPartyService]
})

export class TimelineV2Component implements OnInit, OnDestroy {
  @Input() events: GoalsModel[] = [];
  @Input() showInvestfit: boolean = false;
  @Input() showGoalModal: boolean = true;
  @Input() readOnly: boolean = false;
  @Input() allowEditRetirementIncome: boolean = false;
  @Input() additionalButton: string;
  @Input() goalModalTitle: string;
  @Input() retirementProjection: RetirementProjectionModel = new RetirementProjectionModel();
  @Input() activeAssetList: any[] = [];
  @Input() activeDebtList: any[] = [];
  @Input() canDeleteGoal: boolean = false;
  @Input() isLandingPage: boolean = false;
  @Input() showDescription: boolean = false;
  @Input() enabledAddFirstGoal: boolean = false;

  @Output() retirementIncomeTargetSave: EventEmitter<any> = new EventEmitter();
  @Output() reloadLandingPage: EventEmitter<boolean> = new EventEmitter();
  @Output() addNewGoal: EventEmitter<boolean> = new EventEmitter();

  openGoalList: boolean = false;
  selectingPeriod: GoalsModel = new GoalsModel();
  goalModalContent: GoalsModel = new GoalsModel();
  currentYear: number = new Date().getFullYear();
  curPost: number;
  basePosition: number;
  timeLineWidth: number;
  goalModalSubcription: ISubscription;


  private isCreateGoal: boolean = false;
  constructor(
    private router: Router,
    private adviceBuilderService: AdviceBuilderService,
    private timelineService: TimelineV2Service,
    private thirdPartyService: ThirdPartyService,
    private handleErrorMessageService: HandleErrorMessageService,
  ) { }

  ngOnInit() {
    this.goalModalSubcription = this.timelineService.goalModalObserver()
      .subscribe(response => {
        if (response && response.title) {
          this.goalModalTitle = response.title;
          this.goalModalContent = response.content;
          this.isCreateGoal = true;
          const btnGoalEle = document.getElementById("btn-goal-modal");
          btnGoalEle.click();
        }
      })
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.events && changes.events.currentValue && changes.events.currentValue.length > 0) {

      let availableEvents = changes.events.currentValue.filter(event => !event.predefined || event.name === "Retirement Income");
      if (!this.isLandingPage) { // filter again these goal not existing in advice builder
        availableEvents = this.filterGoalsForAdviceBuilder(availableEvents);
      } else if (this.isLandingPage) { // filter again these goal not existing in client view
        availableEvents = this.filterGoalsClientView(availableEvents);
      }

      this.events = availableEvents;
      if (this.events && this.events.length > 0) {
        this.events.sort((a, b) => this.sortEventsAscending(a, b));
        this.events.forEach(event => {
          if (event.name == "Retirement Income") {
            event.category = 1;
            event.subCategory = 1;
          }
        });
        this.initTimeline();
        this.selectPeriod(0);
      }
    }
  }

  ngOnDestroy() {
    $(".modal.fade.in").modal("hide");
    this.goalModalSubcription.unsubscribe();
  }

  initTimeline() {
    this.basePosition = 470;
    this.timeLineWidth = 200 * this.events.length;
  }

  selectPeriod(index: number) {
    if (index >= 0 && index < this.events.length) {
      this.curPost = index;
      this.goalModalTitle = "Your goal";
      this.selectingPeriod = { ...this.events[index] };
      this.shiftTimeline(index);
    }
    else if (this.events.length == 0) {
      this.shiftTimeline(0);
    }
  }
  getGoalDetail() {
    this.isCreateGoal = false;
    const houseHoldId = localStorage.getItem('houseHoldID');
    const selectedStrategyID = localStorage.getItem('selectedStrategyID');
    const goalId = this.selectingPeriod.goalId;
    this.goalModalContent = new GoalsModel();     // Reset content of goal modal
    if (!houseHoldId || !selectedStrategyID || !goalId) {
      $('#update-goal').modal('hide');

      this.handleErrorMessageService.handleErrorResponse({
        error: { "errorCode": 404, "errorMessage": "This goal is not exist" }
      });

      // this.router.navigate(["/client-view/advice-builder"]);
    } else {
      // update selected goal value
      this.adviceBuilderService.getGoalDetailsById(houseHoldId, selectedStrategyID, goalId).subscribe(res => {
        if (res.success) {
          this.goalModalContent = JSON.parse(JSON.stringify(res.data));
          this.getCurrentGoalType(this.goalModalContent.category, this.goalModalContent.type);
        } else {
          // hide goal modal
          $('#update-goal').modal('hide');
          this.handleErrorMessageService.handleErrorResponse(res);
        }
      })
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

  btnSaveClick(targetValue: any) {
    let incomeTargetValue = parseFloat(targetValue);
    if (incomeTargetValue || incomeTargetValue === 0) {
      this.retirementIncomeTargetSave.emit(incomeTargetValue);
    }
    else
      this.retirementIncomeTargetSave.emit(null);
  }

  deleteGoal() {
    this.adviceBuilderService.showLoading();
    let houseHoldId = localStorage.getItem('houseHoldID');
    let seletedStrategyId = localStorage.getItem('selectedStrategyID');

    this.adviceBuilderService.deleteGoal(houseHoldId, seletedStrategyId, this.selectingPeriod.goalId).subscribe(res => {
      if (res.success) {
        // reload all data in strategy detail page
        this.adviceBuilderService.reloadAllData();
      } else {
        this.adviceBuilderService.hideLoading();
        this.handleErrorMessageService.handleErrorResponse(res);
      }
    });
  }

  shiftTimeline(index: number) {
    const distance = 158.5;
    const finalPos = this.basePosition - (distance * index);

    document.getElementById("period-nodes").style.transition = `transform .4s ease-in-out`;
    document.getElementById("period-nodes").style.transform = `translateX(${finalPos}px)`;
  }

  private reloadGoalsInLandingPage(event) {
    this.reloadLandingPage.emit(event);
  }
  private sortEventsAscending(a: GoalsModel, b: GoalsModel) {
    return a.startYear - b.startYear;
  }

  private getCurrentGoalType(category: number, type: number) {
    // Retirement income goal
    if (type == 1) {
      this.goalModalContent.goalType = 4; return;
    }
    switch (category) {
      case GoalCategoryType.Lifestyle: this.goalModalContent.goalType = 1; break;
      case GoalCategoryType.Employment: this.goalModalContent.goalType = 3; break;
      case GoalCategoryType.Financial:
        {
          if (this.goalModalContent.subCategory == GoalSubCategoryType.BudgetManagement)
            this.goalModalContent.goalType = 2
          else
            this.goalModalContent.goalType = 1;
        }; break;
      case GoalCategoryType.Riskmanagement: this.goalModalContent.goalType = 2; break;
      case GoalCategoryType.TheFuture:
        {
          if (this.goalModalContent.subCategory == GoalSubCategoryType.LeaveInheritance)
            this.goalModalContent.goalType = 1;
          else this.goalModalContent.goalType = 2;
        }; break;
      default: {
        this.goalModalContent.goalType = 1;
      }
    }
  }

  private filterGoalsForAdviceBuilder(goals: GoalsModel[]) {
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
        case GoalSubCategoryType.ReceiveInheritance: availableGoal.push(goal); break;

        case GoalSubCategoryType.BudgetManagement: availableGoal.push(goal); break;
        case GoalSubCategoryType.PurchaseProperty: availableGoal.push(goal); break;
        case GoalSubCategoryType.InvestShares: availableGoal.push(goal); break;

        case GoalSubCategoryType.Wills: availableGoal.push(goal); break;
        case GoalSubCategoryType.PowersOfAttorney: availableGoal.push(goal); break;

        case GoalSubCategoryType.EstatePlanning: availableGoal.push(goal); break;
        case GoalSubCategoryType.LeaveInheritance: availableGoal.push(goal); break;
        case GoalSubCategoryType.AgedCare: availableGoal.push(goal); break;

        case GoalSubCategoryType.Other: { if (goal.type != 1) availableGoal.push(goal); } break;
        default: { }
      }
    });
    return availableGoal;
  }

  private filterGoalsClientView(goals: GoalsModel[]) {
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

  private isShowInvestfit() {
    return this.selectingPeriod.name == 'Retirement Income' && this.showInvestfit;
  }

  private goToInvestfit() {
    this.router.navigate(["/client-view/retirement-report"]);
  }

  private getDisplayGoalContent() {
    let goalYear = this.selectingPeriod.startYear ? this.selectingPeriod.startYear : "No date ";
    let goalName = this.selectingPeriod.name ? this.selectingPeriod.name : "N/A ";
    return goalYear + ' - ' + goalName;
  }

  private setContentHeight() {
    let content = this.getDisplayGoalContent();
    if (content.length > 86)
      return 'card-height-100';
    else if (content.length > 64)
      return 'card-height-80';
    else if (content.length > 32)
      return 'card-height-60';
    else
      return 'card-height-40';
  }

  openAddNewGoalList() {
    this.openGoalList = !this.openGoalList;
    this.addNewGoal.emit(this.openGoalList);
  }
}
