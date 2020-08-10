import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { GoalsModel, GoalCategoryType, GoalSubCategoryType, GoalString, GoalType } from '../../models';
import { Pairs } from '../../../revenue-import/models';
import { Observable } from 'rxjs';
import { AdviceBuilderService } from '../../advice-builder/advice-builder.service';
import { ClientViewService } from '../../client-view.service';
import { RetirementIncomeGoalsModel } from '../../models/current-scenario/retirement-income-goal.model';
import { ISubscription } from 'rxjs/Subscription';
import { HandleErrorMessageService } from '../../../common/services/handle-error.service';

declare var $: any;
@Component({
  selector: 'goal-modal',
  templateUrl: './goal-modal.component.html',
  styleUrls: ['./goal-modal.component.css'],
})


export class GoalModalComponent implements OnInit {

  @Input() selectedGoal: GoalsModel = new GoalsModel();
  @Input() activeAssetList: any[] = [];
  @Input() activeDebtList: any[] = [];
  @Input() goalModalTitle: string;
  @Input() isCreateGoal: boolean = true;
  @Input() readOnly: boolean = false;
  @Input() isLandingPage: boolean = false;
  @Input() showInvestfit: boolean = false;

  @Output() reloadLandingPage: EventEmitter<boolean> = new EventEmitter();

  goalTypeName: string = "";
  iconCSS: string = "";
  clientAssets: Pairs[] = [];
  clientDebts: Pairs[] = [];
  private iSubscription: ISubscription;
  constructor(
    private router: Router,
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private clientViewService: ClientViewService,

  ) { }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.iSubscription) {
      this.iSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedGoal && changes.selectedGoal.currentValue) {

      this.getGoalTypeName(this.selectedGoal.subCategory, this.selectedGoal.category, this.selectedGoal.type);
      this.returnGoalIconCSS(this.selectedGoal.subCategory, this.selectedGoal.type);
      // if (this.isLandingPage) {
      // temporary convert FundedFrom
      let tempFundedFrom = this.convertFundedFrom(this.selectedGoal.fundedFrom);
      this.selectedGoal.fundedFrom = tempFundedFrom;
      // }
    }
    if (changes.activeAssetList && changes.activeAssetList.currentValue) {
      this.clientAssets = this.activeAssetList.map(asset => {
        return { id: asset.id, value: asset.name };
      });
    }
    if (changes.activeDebtList && changes.activeDebtList.currentValue) {
      this.clientDebts = this.activeDebtList.map(debt => {
        return { id: debt.id, value: debt.name };
      });
    }
  }

  private saveChangesGoal(event: any) {
    let goal: GoalsModel = event;
    // call api save goal
    goal.category = this.selectedGoal.category;
    goal.subCategory = this.selectedGoal.subCategory;

    let houseHoldId = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldId || !selectedStrategyID) { this.router.navigate(["/client-view/advice-builder"]); return; }
    this.adviceBuilderService.showLoading()

    let observable: Observable<any>[] = [];
    if (this.isCreateGoal) { // create goal
      observable.push(this.adviceBuilderService.createGoal(selectedStrategyID, houseHoldId, goal, this.selectedGoal.goalType));
    } else // update goal
    {
      if (this.isLandingPage) { // call specific api for update goal of current situation
        if (goal.goalType == GoalType.spending) {
          // temporary convert FundedFrom
          let tempFundedFrom = this.convertFundedFromCRM(JSON.parse(JSON.stringify(goal.fundedFrom)));
          goal.fundedFrom = tempFundedFrom;
        }
        observable.push(this.clientViewService.updateGoalForCurrentSituation(houseHoldId, this.selectedGoal.goalType, goal));
      } else { // api update goal with strategies
        observable.push(this.adviceBuilderService.updateGoal(selectedStrategyID, houseHoldId, goal, this.selectedGoal.goalType));
      }
    }
    this.iSubscription = Observable.zip.apply(null, observable).subscribe(res => {
      if (this.iSubscription) {
        this.iSubscription.unsubscribe();
      }
      this.adviceBuilderService.hideLoading()
      if (res[0].success) {
        if (this.isLandingPage == true) { // is update goal on client view landing page => reload data
          this.reloadLandingPage.emit(true);
        } else { //advice builder page
          if (goal.goalType == 3) // income goal
          {
            this.adviceBuilderService.reloadClientIncome();
          }
          // update current goal in timeline ==> because goal list including in scenario details
          this.adviceBuilderService.reloadStrategyDetails();
        }
      } else {
        this.handleErrorMessageService.handleErrorResponse(res[0]);
      }
    })
  }

  private convertFundedFromCRM(fundedFrom: number) {
    switch (fundedFrom) {
      case 0: return 509000000;
      case 1: return 509000001;
      case 2: return 509000002;
      case 3: return 509000003;
      default: return fundedFrom;
    }
  }
  private convertFundedFrom(fundedFrom: number) {
    switch (fundedFrom) {
      case 509000000: return 0;
      case 509000001: return 1;
      case 509000002: return 2;
      case 509000003: return 3;
      default: return fundedFrom;
    }
  }

  private saveChangesRetirementGoal(event: any) {
    let goal: RetirementIncomeGoalsModel = event;
    // call api save goal
    goal.category = this.selectedGoal.category;
    goal.subCategory = this.selectedGoal.subCategory;
    let desireRetirementIncome = { RetirementIncomeTarget: goal.desireRetirementIncome };

    let houseHoldId = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldId || !selectedStrategyID) { this.router.navigate(["/client-view/advice-builder"]); return; }
    this.adviceBuilderService.showLoading()
    this.adviceBuilderService.updateRetirementIncomeGoal(selectedStrategyID, houseHoldId, desireRetirementIncome).subscribe(res => {
      this.adviceBuilderService.hideLoading()
      if (res.success) {
        this.adviceBuilderService.reloadStrategyDetails();
        if (this.isLandingPage == true) // is update goal on client view landing page => reload data
          this.reloadLandingPage.emit(true);
      } else {
        this.handleErrorMessageService.handleErrorResponse(res[0]);
      }
    });

  }

  /**return text with suitable goalType */
  private getGoalTypeName(goalSubCategory: number, goalCategory: number, type: number) {
    if (type == 1) { // retirement income
      return this.goalTypeName = GoalString.RetirementIncome;
    }
    switch (goalSubCategory) {

      // lifestyles/ family
      case GoalSubCategoryType.HouseRenovation: this.goalTypeName = GoalString.HouseRenovation; break;
      case GoalSubCategoryType.ChildrenEducation: this.goalTypeName = GoalString.ChildrenEducation; break;
      case GoalSubCategoryType.NewChild: this.goalTypeName = GoalString.NewChild; break;
      case GoalSubCategoryType.SaveForHome: this.goalTypeName = GoalString.SaveForHome; break;
      case GoalSubCategoryType.SaveForHoliday: this.goalTypeName = GoalString.SaveForHoliday; break;
      case GoalSubCategoryType.SaveForACar: this.goalTypeName = GoalString.SaveForACar; break;
      //employment
      case GoalSubCategoryType.IncreaseIncome: this.goalTypeName = GoalString.IncreaseIncome; break;
      case GoalSubCategoryType.DecreaseIncome: this.goalTypeName = GoalString.DecreaseIncome; break;
      case GoalSubCategoryType.CareerChange: this.goalTypeName = GoalString.CareerChange; break;
      case GoalSubCategoryType.ExtendedLeave: this.goalTypeName = GoalString.ExtendedLeave; break;
      case GoalSubCategoryType.ReceiveInheritance: this.goalTypeName = GoalString.ReceiveInheritance; break;
      //finacial
      case GoalSubCategoryType.BudgetManagement: this.goalTypeName = GoalString.BudgetManagement; break;
      case GoalSubCategoryType.PurchaseProperty: this.goalTypeName = GoalString.PurchaseProperty; break;
      case GoalSubCategoryType.InvestShares: this.goalTypeName = GoalString.InvestShares; break;
      // case GoalSubCategoryType.ReduceDebt: this.goalTypeName = GoalString.reduceDebt; break;
      // Risk 
      case GoalSubCategoryType.Wills: this.goalTypeName = GoalString.Wills; break;
      case GoalSubCategoryType.PowersOfAttorney: this.goalTypeName = GoalString.PowersOfAttorney; break;
      // Future
      case GoalSubCategoryType.EstatePlanning: this.goalTypeName = GoalString.EstatePlanning; break;
      case GoalSubCategoryType.LeaveInheritance: this.goalTypeName = GoalString.LeaveInheritance; break;
      case GoalSubCategoryType.AgedCare: this.goalTypeName = GoalString.AgedCare; break;
      // Other goals
      case GoalSubCategoryType.Other:
        if (goalCategory === GoalCategoryType.Lifestyle) { this.goalTypeName = GoalString.LifestyleOther; break; }
        if (goalCategory === GoalCategoryType.Employment) { this.goalTypeName = GoalString.EmploymentOther; break; }
        if (goalCategory === GoalCategoryType.Financial) { this.goalTypeName = GoalString.FinancialOther; break; }
        if (goalCategory === GoalCategoryType.Riskmanagement) { this.goalTypeName = GoalString.RiskManagementOther; break; }
        if (goalCategory === GoalCategoryType.TheFuture) { this.goalTypeName = GoalString.FutureOther; break; }
    }
  }

  private returnGoalIconCSS(goalSubCategory: number, type: number) {
    if (type == 1) { // retirement income
      return this.iconCSS = "fa-cocktail";
    }

    switch (goalSubCategory) {
      // lifestyles/ family
      case GoalSubCategoryType.HouseRenovation: this.iconCSS = "fa-paint-brush"; break;
      case GoalSubCategoryType.ChildrenEducation: this.iconCSS = "fa-university"; break;
      case GoalSubCategoryType.NewChild: this.iconCSS = "fa-child"; break;
      case GoalSubCategoryType.SaveForHome: this.iconCSS = "fa-home"; break;
      case GoalSubCategoryType.SaveForHoliday: this.iconCSS = "fa-plane"; break;
      case GoalSubCategoryType.SaveForACar: this.iconCSS = "fa-car"; break;
      //employment
      case GoalSubCategoryType.IncreaseIncome: this.iconCSS = "fa-arrow-up"; break;
      case GoalSubCategoryType.DecreaseIncome: this.iconCSS = "fa-arrow-down"; break;
      case GoalSubCategoryType.CareerChange: this.iconCSS = "fa-map-signs"; break;
      case GoalSubCategoryType.ExtendedLeave: this.iconCSS = "fa-rocket"; break;
      case GoalSubCategoryType.ReceiveInheritance: this.iconCSS = "fa-hands-usd"; break;
      // Financial category
      case GoalSubCategoryType.BudgetManagement: this.iconCSS = "fa-money-bill"; break;
      case GoalSubCategoryType.PurchaseProperty: this.iconCSS = "fa-building"; break;
      case GoalSubCategoryType.InvestShares: this.iconCSS = "fa-suitcase"; break;
      // Risk Management category
      case GoalSubCategoryType.Wills: this.iconCSS = "fa-file-alt"; break;
      case GoalSubCategoryType.PowersOfAttorney: this.iconCSS = "fa-user"; break;
      // The future category
      case GoalSubCategoryType.EstatePlanning: this.iconCSS = "fa-wheelchair"; break;
      case GoalSubCategoryType.LeaveInheritance: this.iconCSS = "fa-hand-holding-usd"; break;
      case GoalSubCategoryType.AgedCare: this.iconCSS = "fa-blind"; break;
      // Other goals category
      case GoalSubCategoryType.Other: this.iconCSS = "fa-ellipsis-h"; break;
      default: this.iconCSS = "fa-question-circle";
    }
  }

}


export enum FundedFromType {
  Cashflow,
  Loan,
  OffsetAccount,
  Asset
}
