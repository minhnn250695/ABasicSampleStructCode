import { Component, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, Input } from '@angular/core';
import { GoalsModel } from '../../models';
import { GoalType, GoalCategoryType, GoalSubCategoryType } from '../../models';
import { Pairs } from '../../../revenue-import/models';
import { TimelineV2Service } from '../timeline_v2/timeline_v2.service';

declare var $: any;
@Component({
  selector: 'new-goal-button',
  templateUrl: './new-goal-button.component.html',
  styleUrls: ['./new-goal-button.component.css'],
})
export class NewGoalButtonComponent implements OnInit, OnChanges {
  @Input() goalModalTitle: string;
  @Input() activeAssetList: any[] = [];
  @Input() activeDebtList: any[] = [];
  @Input() addNewGoal: boolean = false;

  private selectedGoal: GoalsModel = new GoalsModel();

  // init enum list using in html
  private GoalSubCategoryTypeEnum = GoalSubCategoryType;
  private GoalCategoryTypeEnum = GoalCategoryType;
  private GoalTypeEnum = GoalType;
  private goalRecords: Pairs[] = [
    { id: GoalSubCategoryType.HouseRenovation.toString(), value: "House renovation" },
    { id: GoalSubCategoryType.ChildrenEducation.toString(), value: "Children's education" },
    { id: GoalSubCategoryType.NewChild.toString(), value: "A new child" },
    { id: GoalSubCategoryType.SaveForHome.toString(), value: "Save for a home" },
    { id: GoalSubCategoryType.SaveForHoliday.toString(), value: "Save for a holiday" },
    { id: GoalSubCategoryType.SaveForACar.toString(), value: "Save for a car" },
    { id: 'other-family', value: "Other - Lifestyle/family" },

    { id: GoalSubCategoryType.IncreaseIncome.toString(), value: "Increase in income" },
    { id: GoalSubCategoryType.DecreaseIncome.toString(), value: "Decrease in income" },
    { id: GoalSubCategoryType.CareerChange.toString(), value: "Career change" },
    { id: GoalSubCategoryType.ExtendedLeave.toString(), value: "Extended leave" },
    { id: GoalSubCategoryType.ReceiveInheritance.toString(), value: "Receive inheritance" },
    { id: 'other-employment', value: "Other - Employment" },

    { id: GoalSubCategoryType.BudgetManagement.toString(), value: "Budget management" },
    { id: GoalSubCategoryType.PurchaseProperty.toString(), value: "Purchase property" },
    { id: GoalSubCategoryType.InvestShares.toString(), value: "Invest in shares" },
    { id: 'other-financial', value: "Other - Financial" },

    { id: GoalSubCategoryType.Wills.toString(), value: "Wills" },
    { id: GoalSubCategoryType.PowersOfAttorney.toString(), value: "Powers of attorney" },
    { id: 'other-risk', value: "Other - Risk management" },

    { id: GoalSubCategoryType.EstatePlanning.toString(), value: "Estate planning" },
    { id: GoalSubCategoryType.LeaveInheritance.toString(), value: "Leave inheritance" },
    { id: GoalSubCategoryType.AgedCare.toString(), value: "Aged care" },
    { id: 'other-future', value: "Other - The future" }
  ];
  constructor(private timelineService: TimelineV2Service) { }

  ngOnInit() {
    this.initAutoComplete("search-goal", this.goalRecords);
    $('html').on('click', (e) => {
      if (!$(e.target).parents().is('.collapse.in') && !$(e.target).is('#addGoalButton')) {
        this.collapseGoalButton();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.addNewGoal && changes.addNewGoal.currentValue) ||
      (changes.addNewGoal && changes.addNewGoal.previousValue && !changes.addNewGoal.currentValue)) {
      $('.collapse#collapGoalMenu').collapse('hide');
      this.collapseGoalButton();
      setTimeout(() => {
        $('.collapse#collapGoalMenu').collapse('show');
        this.onClickAddGoalButton();
      }, 400);
    }
  }

  ngOnDestroy() {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }

  private initAutoComplete(id: string, records: Pairs[]) {
    if (records === undefined || records.length === 0) return;
    const item = $("#" + id);
    item.autocomplete({
      source: (request, response) => {
        let results = $.ui.autocomplete.filter(records, request.term);
        response(results.slice(0, 50));
      },
      open: () => {
        $('.ui-autocomplete').css('width', '174px');
      },
      select: (e, ui) => {
        this.openGoalModal(ui.item.id);
      }
    });
    item.autocomplete("option", "appendTo", "#goal-search-group");
  }

  private showGoalSubcategoty(id: string) {
    $("#" + id).addClass("in");
    this.hideAnotherGoalSubcategory(id);
  }

  private openGoalModal(subCategory: string) {
    this.collapseGoalButton();

    // determine goal category and goal type by goal subcategory
    let selectedGoalType: number;
    let selectedGoalCategory: number;
    this.determineGoalCategoryAndGoalType(subCategory, (goalType, goalCategory) => {
      selectedGoalType = goalType;
      selectedGoalCategory = goalCategory;
    });

    // temporay set value for other goal type
    let goalSubCategory: number;
    if (subCategory == 'other-family' || subCategory == 'other-employment' || subCategory == 'other-financial'
      || subCategory == 'other-risk' || subCategory == 'other-future') {
      goalSubCategory = GoalSubCategoryType.Other;
    } else {
      goalSubCategory = parseInt(subCategory);
    }

    // set goal type - subcategory and category to decide with modal would be show (spending/non/income)
    this.selectFinancial_GoalType(goalSubCategory, selectedGoalType, selectedGoalCategory);
    $('#update-goal').modal('show');
  }

  private onClickAddGoalButton() {
    // colappse add action menu
    $("#menuActions").removeClass("in");
    $('#search-goal').val('');
    this.hideAnotherGoalSubcategory('hide-all');
  }

  private collapseGoalButton() {
    $("#collapGoalMenu").removeClass("in");
    $('#search-goal').val('');
    $('ul.ui-autocomplete').hide();
    this.hideAnotherGoalSubcategory('hide-all');
  }

  private determineGoalCategoryAndGoalType(subCategory: string, callback: (selectedGoalType: number,
    selectedGoalCategory: number) => void) {
    if (
      subCategory == GoalSubCategoryType.HouseRenovation.toString() ||
      subCategory == GoalSubCategoryType.ChildrenEducation.toString() ||
      subCategory == GoalSubCategoryType.NewChild.toString() ||
      subCategory == GoalSubCategoryType.SaveForHome.toString() ||
      subCategory == GoalSubCategoryType.SaveForHoliday.toString() ||
      subCategory == GoalSubCategoryType.SaveForACar.toString() ||
      subCategory == 'other-family') {
      callback(this.GoalTypeEnum.spending, GoalCategoryType.Lifestyle);
    } else if (
      subCategory == GoalSubCategoryType.IncreaseIncome.toString() ||
      subCategory == GoalSubCategoryType.DecreaseIncome.toString() ||
      subCategory == GoalSubCategoryType.CareerChange.toString() ||
      subCategory == GoalSubCategoryType.ExtendedLeave.toString() ||
      subCategory == GoalSubCategoryType.ReceiveInheritance.toString() ||
      subCategory == 'other-employment') {
      callback(this.GoalTypeEnum.income, GoalCategoryType.Employment);
    } else if (
      subCategory == GoalSubCategoryType.PurchaseProperty.toString() ||
      subCategory == GoalSubCategoryType.InvestShares.toString() ||
      subCategory == 'other-financial') {
      callback(this.GoalTypeEnum.spending, GoalCategoryType.Financial);
    } else if (
      subCategory == GoalSubCategoryType.Wills.toString() ||
      subCategory == GoalSubCategoryType.PowersOfAttorney.toString() ||
      subCategory == 'other-risk') {
      callback(this.GoalTypeEnum.non_spending, GoalCategoryType.Riskmanagement);
    } else if (
      subCategory == GoalSubCategoryType.EstatePlanning.toString() ||
      subCategory == GoalSubCategoryType.AgedCare.toString() ||
      subCategory == 'other-future') {
      callback(this.GoalTypeEnum.non_spending, GoalCategoryType.TheFuture);
    }

    // beside that we have some special cases      
    else if (subCategory == GoalSubCategoryType.LeaveInheritance.toString()) {
      callback(this.GoalTypeEnum.spending, GoalCategoryType.TheFuture);
    } else if (subCategory == GoalSubCategoryType.BudgetManagement.toString()) {
      callback(this.GoalTypeEnum.non_spending, GoalCategoryType.Financial);
    }
  }

  private hideAnotherGoalSubcategory(subCategoryID: string) {
    switch (subCategoryID) {
      case 'lifestyle-family': {
        $("#employment").removeClass("in");
        $("#financial").removeClass("in");
        $("#risk-management").removeClass("in");
        $("#thefuture").removeClass("in");
        break;
      };
      case 'employment': {
        $("#lifestyle-family").removeClass("in");
        $("#financial").removeClass("in");
        $("#risk-management").removeClass("in");
        $("#thefuture").removeClass("in");
        break;
      };
      case 'financial': {
        $("#lifestyle-family").removeClass("in");
        $("#employment").removeClass("in");
        $("#risk-management").removeClass("in");
        $("#thefuture").removeClass("in");
        break;
      };
      case 'risk-management': {
        $("#lifestyle-family").removeClass("in");
        $("#employment").removeClass("in");
        $("#financial").removeClass("in");
        $("#thefuture").removeClass("in");
        break;
      };
      case 'thefuture': {
        $("#lifestyle-family").removeClass("in");
        $("#employment").removeClass("in");
        $("#financial").removeClass("in");
        $("#risk-management").removeClass("in");
        break;
      };
      default: {
        $("#lifestyle-family").removeClass("in");
        $("#employment").removeClass("in");
        $("#financial").removeClass("in");
        $("#risk-management").removeClass("in");
        $("#thefuture").removeClass("in");
      }
    }
  }

  //#region add new goal dropdown list  
  private selectFinancial_GoalType(goalSubCategory: number, goalType: number, goalCategory: number) {
    const newGoal = new GoalsModel();
    newGoal.goalType = goalType;
    newGoal.subCategory = goalSubCategory;
    newGoal.category = goalCategory;

    this.selectedGoal = JSON.parse(JSON.stringify(newGoal));
    this.timelineService.showGoalModal({
      mode: "add",
      title: "Add new goal",
      assetList: [],
      debtList: [],
      content: this.selectedGoal
    });
  }
}
