import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

// entity
import { Report } from '../../../document-generator/generate-report/report.model';
import { ScenarioDetailsModel, GoalsModel, GoalCategoryType, GoalSubCategoryType } from '../../models';

// service
import { AdviceBuilderService } from './../advice-builder.service';
import { HandleErrorMessageService } from '../../../common/services/handle-error.service';
import { BackgroundProcessService } from '../../../common/services/background-process.service';
import { ISubscription } from 'rxjs/Subscription';
import { ClientViewService } from '../../client-view.service';

declare var $: any;
@Component({
  selector: 'app-compare-strategies',
  templateUrl: './compare-strategies.component.html',
  styleUrls: ['./compare-strategies.component.css']
})
export class CompareStrategiesComponent implements OnInit {

  private currentStrategyId: string;
  private strategyId1: string;
  private strategyId2: string;
  private compareStrategy: any;
  private strategies: Array<ScenarioDetailsModel> = [];
  private houseHoldID: string = localStorage.getItem('houseHoldID');
  private selectedGoal: GoalsModel = new GoalsModel();
  private tempStrategy: any;
  private templates: any;
  private generatingReport1: boolean = false;
  private failed1: boolean = false;
  private generatingReport2: boolean = false;
  private failed2: boolean = false;
  private isDisabled: string = null;
  private members: any;
  private iSub: ISubscription;
  private duration: number = 0;
  @ViewChild('alertModal') alertModal: any;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private processService: BackgroundProcessService,
    private clientViewService: ClientViewService,
  ) {
    this.strategyId1 = this.activatedRoute.snapshot.paramMap.get('strategy1');
    this.strategyId2 = this.activatedRoute.snapshot.paramMap.get('strategy2');
  }

  ngOnInit() {
    this.currentStrategyId = localStorage.getItem('currentStrategy');
    this.getScenariosDetails();
  }

  private getScenariosDetails() {
    if (this.strategyId1 != '' && this.strategyId2 != '') {
      let observable: Observable<any>[] = [];
      this.adviceBuilderService.showLoading();
      observable.push(this.adviceBuilderService.getScenarioDetails(this.houseHoldID, this.strategyId1));
      observable.push(this.adviceBuilderService.getScenarioDetails(this.houseHoldID, this.strategyId2));
      observable.push(this.adviceBuilderService.getDebtProjectionByScenarioId(this.houseHoldID, this.strategyId1));
      observable.push(this.adviceBuilderService.getDebtProjectionByScenarioId(this.houseHoldID, this.strategyId2));
      observable.push(this.adviceBuilderService.getReportTemplates());
      this.iSub = Observable.zip.apply(null, observable).subscribe(response => {
        if (this.iSub) {
          this.iSub.unsubscribe();
        }
        this.strategies = []; // reset current list
        this.templates = [];
        if (response && response.length > 0) {
          for (var i = 0; i < response.length; i++) {
            if (i == 4) {
              this.templates = response[i];
            }
            else if (response[i] && response[i].success) {
              if (i == 0 || i == 1) {
                let strategy = response[i].data;
                this.duration = strategy && strategy.strategyDuration;
                let durationEndYear = this.duration + new Date().getFullYear();
                if (this.duration)
                  strategy.goals = strategy.goals.filter(event => (!event.predefined || event.name === "Retirement Income") && event.startYear <= durationEndYear && this.filterGoals(event));
                if (strategy.goals && strategy.goals.length > 0) {
                  strategy.goals.sort((a, b) => this.sortEventsAscending(a, b));
                }
                this.strategies.push(strategy);
                if (!this.compareStrategy && response[i].data.scenarioId != this.currentStrategyId)
                  this.compareStrategy = response[i].data;
              }
              else if (i == 2) {
                this.strategies[0].debtProjections = response[i].data;
                this.strategies[0].debt.totalPayment = this.getDebtTotalPayment(response[i].data);
              }
              else if (i == 3) {
                this; this.strategies[1].debtProjections = response[i].data;
                this.strategies[1].debt.totalPayment = this.getDebtTotalPayment(response[i].data);
              }
            }
            else {
              this.handleErrorMessageService.handleErrorResponse(response[i]);
            }
          }
        }
        this.adviceBuilderService.hideLoading();
      });
    }
  }

  private durationSaveChanges() {
    let houseHoldID = localStorage.getItem('houseHoldID');
    this.adviceBuilderService.showLoading();
    this.clientViewService.updateStrategyDuration(this.duration, houseHoldID).subscribe(res => {
      if (res && res.success) {
        this.clientViewService.reloadCurrentScenario(houseHoldID).subscribe(response => {
          if (response.success) {
            this.getScenariosDetails();
          }
        });
      } else {
        this.handleErrorMessageService.handleErrorResponse(res);
      }
    });
  }

  private filterGoals(goal: GoalsModel) {
    let enabledShow: boolean = false;
    // type === 1 is retirement goal
    if (goal.type === 1) { enabledShow = true }
    else {
      switch (goal.subCategory) {
        case GoalSubCategoryType.HouseRenovation: enabledShow = true; break;
        case GoalSubCategoryType.ChildrenEducation: enabledShow = true; break;
        case GoalSubCategoryType.NewChild: enabledShow = true; break;
        case GoalSubCategoryType.SaveForHome: enabledShow = true; break;
        case GoalSubCategoryType.SaveForHoliday: enabledShow = true; break;
        case GoalSubCategoryType.SaveForACar: enabledShow = true; break;

        case GoalSubCategoryType.IncreaseIncome: enabledShow = true; break;
        case GoalSubCategoryType.DecreaseIncome: enabledShow = true; break;
        case GoalSubCategoryType.CareerChange: enabledShow = true; break;
        case GoalSubCategoryType.ExtendedLeave: enabledShow = true; break;
        case GoalSubCategoryType.ReceiveInheritance: enabledShow = true; break;

        case GoalSubCategoryType.BudgetManagement: enabledShow = true; break;
        case GoalSubCategoryType.PurchaseProperty: enabledShow = true; break;
        case GoalSubCategoryType.InvestShares: enabledShow = true; break;

        case GoalSubCategoryType.Wills: enabledShow = true; break;
        case GoalSubCategoryType.PowersOfAttorney: enabledShow = true; break;

        case GoalSubCategoryType.EstatePlanning: enabledShow = true; break;
        case GoalSubCategoryType.LeaveInheritance: enabledShow = true; break;
        case GoalSubCategoryType.AgedCare: enabledShow = true; break;

        case GoalSubCategoryType.Other: { if (goal.type != 1) enabledShow = true; } break;
      }
    }
    return enabledShow;
  }

  //#region Handle goal modal
  /**
   * 
   * @param goalId 
   * @param scenarioId 
   */
  private getGoalDetail(goalId: string, scenarioId: string) {
    this.selectedGoal = new GoalsModel();     // Reset content of goal modal
    if (!this.houseHoldID || !scenarioId || !goalId) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      // update selected goal value
      this.adviceBuilderService.getGoalDetailsById(this.houseHoldID, scenarioId, goalId).subscribe(res => {
        if (res.success) {
          this.selectedGoal = JSON.parse(JSON.stringify(res.data));
          this.getCurrentGoalType(this.selectedGoal.category, this.selectedGoal.type);
        } else {
          // hide goal modal
          $('#goal-modal').modal('hide');
          this.handleErrorMessageService.handleErrorResponse(res);
        }
      })
    }
  }

  /**
   * 
   * @param category - goal category
   */
  private getCurrentGoalType(category: number, type: number) {
    // Retirement income goal
    if (type == 1) {
      this.selectedGoal.goalType = 4; return;
    }
    switch (category) {
      case GoalCategoryType.Lifestyle: this.selectedGoal.goalType = 1; break;
      case GoalCategoryType.Employment: this.selectedGoal.goalType = 3; break;
      case GoalCategoryType.Financial:
        {
          if (this.selectedGoal.subCategory == GoalSubCategoryType.BudgetManagement)
            this.selectedGoal.goalType = 2
          else
            this.selectedGoal.goalType = 1;
        }; break;
      case GoalCategoryType.Riskmanagement: this.selectedGoal.goalType = 2; break;
      case GoalCategoryType.TheFuture:
        {
          if (this.selectedGoal.subCategory == GoalSubCategoryType.LeaveInheritance)
            this.selectedGoal.goalType = 1;
          else this.selectedGoal.goalType = 2;
        }; break;
      default: {
        this.selectedGoal.goalType = 1;
      }
    }
  }
  //#endregion

  //#region handle click event
  /**
   * 
   * @param scenario 
   */
  private changeToEditMode(scenario: ScenarioDetailsModel) {
    this.tempStrategy = scenario;
    this.alertModal.show();
  }

  private generateReport(scenario: ScenarioDetailsModel, template: any, index: number) {
    this['generatingReport' + index] = true;
    this['failed' + index] = false;
    this.isDisabled = 'disabled';

    let householdId = localStorage.getItem('houseHoldID');
    let clientId = localStorage.getItem('selected_client_id_in_client_view');
    let client: any;
    this.members = this.adviceBuilderService.selectedScenario.personalProtection;
    if (!this.members.contacts || this.members.contacts.length <= 0) {
      this.adviceBuilderService.getScenarioDetails(householdId, scenario.scenarioId).subscribe(response => {
        if (response && response.success) {
          this.members = response.data.personalProtection;
          let i = this.members.outcomes.findIndex((outcome) => outcome.contactId == clientId);
          if (i >= 0) {
            client = this.members.contacts[i];
            this.processGenerateReport(template, scenario, clientId, client, index);
          }
        }
        else
          console.log("Request failed");
      });
    }
    else {
      let i = this.members.outcomes.findIndex((outcome) => outcome.contactId == clientId);
      if (i >= 0) {
        client = this.members.contacts[i];
        this.processGenerateReport(template, scenario, clientId, client, index);
      }
    }
  }

  private processGenerateReport(template: any, scenario: ScenarioDetailsModel, clientId: string, client: any, index: number) {
    if (client && client.fullName) {
      let report = new Report(template.name, template.id, clientId, client.fullName);
      this.adviceBuilderService.generateReport(report, scenario.scenarioId)
        .subscribe(result => {
          if (result.success) {
            let processId = result.data;
            this.processService.waitProcessComplete(processId, 15000, 40, true).then(result => {
              if (result.finished) {
                this.router.navigate(["document/report-manager"]);
              }
              this.isDisabled = null;
              this['generatingReport' + index] = false;
              this['failed' + index] = result.failed;
            });
          }
        });
    }
  }
  //#endregion

  //#region events
  private getAlertMessage() {
    return `You are leaving the Compare Strategy page, you can always generate the comparison again at any time.\n\nIf you make any updates to your strategy, those updates will be reflected in the new comparison.\n\nDo you want to continue to Edit Strategy mode?`;
  }

  private confirmChangeToEditMode() {
    localStorage.setItem('selectedStrategyID', this.tempStrategy.scenarioId);
    localStorage.setItem('selectedStrategyName', this.tempStrategy.scenarioName);
    this.router.navigate(["/client-view/advice-builder/strategy-details"]);
  }

  private getDebtTotalPayment(debts: any) {
    let currentYear = new Date().getFullYear();
    let totalPayment: number = 0;
    debts.forEach(debt => {
      for (var i = 0; i < debt.debtPeriods.length; i++) {
        if (currentYear == debt.debtPeriods[i].year) {
          totalPayment += debt.debtPeriods[i].annualPayment;
          break;
        }
      }
    });
    return totalPayment;
    // let totalPayment: number = 0;
    // if (debt) {
    //   if (debt.deductibleDebt)
    //     totalPayment += debt.deductibleDebt;
    //   if (debt.nonDeductibleDebt)
    //     totalPayment += debt.nonDeductibleDebt;
    // }
    // return totalPayment;
  }

  private getCashFlowTotalPremiums(cashflow: any) {
    let totalPremiums: number = 0;
    if (cashflow && cashflow.details[0]) {
      if (cashflow.details[0].insurancePaidByYou)
        totalPremiums += cashflow.details[0].insurancePaidByYou;
      if (cashflow.details[0].insurancePaidBySuperAnnuation)
        totalPremiums += cashflow.details[0].insurancePaidBySuperAnnuation;
      if (cashflow.details[0].insurancePaidByBusiness)
        totalPremiums += cashflow.details[0].insurancePaidByBusiness;
    }
    return totalPremiums;
  }

  private sortEventsAscending(a: GoalsModel, b: GoalsModel) {
    return a.startYear - b.startYear;
  }

  private goToPage(strategyId) {
    localStorage.setItem('selectedStrategyID', strategyId);
    this.router.navigate(['/client-view/advice-builder']);
  }
  //#endregion
}




