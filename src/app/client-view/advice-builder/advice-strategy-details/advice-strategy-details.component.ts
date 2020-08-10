import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';

// entity
import { ScenarioDetailsModel } from '../../models/current-scenario/scenario-details.model';

// services
import { ClientViewService } from '../../client-view.service';
import { AdviceBuilderService } from '../advice-builder.service';
import { HandleErrorMessageService } from '../../../common/services/handle-error.service';

declare var $: any;
@Component({
  selector: 'app-advice-strategy-details',
  templateUrl: './advice-strategy-details.component.html',
  styleUrls: ['./advice-strategy-details.component.css']
})
export class AdviceStrategyDetailsComponent implements OnInit {
  private scenario: ScenarioDetailsModel = new ScenarioDetailsModel();
  private iSubReloadData: ISubscription;
  private iSub: ISubscription;

  private addNewGoal: boolean = false;

  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private router: Router,
    private clientService: ClientViewService
  ) {
    // handle reload ActiveAssetAction, ActiveInsuranceAction, ActiveDebtAction
    this.iSubReloadData = this.adviceBuilderService.handleReloadData().subscribe(response => {
      switch (response) {
        case 0: { this.getAllDataToReloadView(); break }; // reload all data
        case 1: { this.getAllDataToReloadView(true, false, false, false, false, false, false, false); break }; // get selected strategy details
        // get each ActiveAsset not close and close/ ActiveDebt/ ActiveInsurance not close and close
        case 2: { this.getAllDataToReloadView(true, true, true, true, true, true, false, false); break };
        case 3: { this.getAllDataToReloadView(true, false, false, false, false, false, true, false); break }; // get action list
        case 4: { this.getAllDataToReloadView(true, false, false, false, false, false, false, true); break }; // get client income
        case 5: { this.getAllDataToReloadView(true, false, false, false, false, false, true, false); break };// get strategy details and actions
        case 6: { this.getAllDataToReloadView(true, true, false, false, false, false, true, false); break };// get asset and actions
        case 7: { this.getAllDataToReloadView(true, false, false, false, true, false, true, false); break };// get insurances and actions
        case 8: { this.getAllDataToReloadView(true, true, true, false, false, false, true, false); break }; // get AvailableAsset not closed and closed and action
        case 9: { this.getAllDataToReloadView(true, false, false, false, true, true, true, false); break }; // get AvailableInsurance not closed and closed and action
        default: { this.getAllDataToReloadView(); break };
      }
    });
  }

  ngOnInit() {
    let strategyStoragedNoReload = localStorage.getItem('strategy_storaged_no_reload');
    if (strategyStoragedNoReload == 'true' && this.adviceBuilderService.selectedScenario.scenarioId) {
      localStorage.setItem('strategy_storaged_no_reload', 'false');
    } else {
      let currentSelectedStrategy = this.adviceBuilderService.selectedScenario;

      // all value is empty <= reload page
      if (currentSelectedStrategy && !currentSelectedStrategy.scenarioId) {
        this.adviceBuilderService.reloadAllData();
      }
    }


    const houseHoldID = localStorage.getItem("houseHoldID");
    if (!this.clientService.currentScenario.id) {
      this.clientService.reloadCurrentScenario(houseHoldID).subscribe();
    }

  }

  ngOnDestroy() {
    this.iSubReloadData.unsubscribe();
    if (this.iSub) {
      this.iSub.unsubscribe();
    }
  }

  updateGoalListEvent(event: boolean) {
    if (event) {
      this.adviceBuilderService.reloadStrategyDetails();
    }
  }

  private filterGoalInRange(availableEvents, strategyDuration) {
    let currentYear = new Date().getFullYear();
    let endYearDuration = currentYear + strategyDuration;
    return availableEvents = availableEvents.filter(event => event.startYear >= currentYear && event.startYear <= endYearDuration);
  }

  private getAllDataToReloadView(reloadStrategy: boolean = true, reloadNotCloseAsset: boolean = true, reloadClosedAsset: boolean = true,
    reloadDebt: boolean = true, reloadNotCloseInsurance: boolean = true, reloadClosedInsurance: boolean = true, reloadActions: boolean = true, reloadClientIncome: boolean = true,
    reloadAssetProjections: boolean = true, reloadDebtProjections: boolean = true, reloadPersonalInsuranceProjections: boolean = true) {
    let observable: Observable<any>[] = [];
    let houseHoldID = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldID || !selectedStrategyID) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      this.adviceBuilderService.showLoading();
      // 1. handle strategy details response
      if (reloadStrategy) {
        observable.push(this.adviceBuilderService.getScenarioDetails(houseHoldID, selectedStrategyID));
      }
      // 2. handle active asset response
      if (reloadNotCloseAsset) {
        observable.push(this.adviceBuilderService.getAvailableAssetList(houseHoldID, selectedStrategyID, true));
      }
      // 3. handle active debt response
      if (reloadDebt) {
        observable.push(this.adviceBuilderService.getDebtList(houseHoldID, selectedStrategyID));
      }
      // 4. handle active insurance response
      if (reloadNotCloseInsurance) {
        observable.push(this.adviceBuilderService.getAvailableInsuranceList(houseHoldID, selectedStrategyID, true));
      }
      // 5. handle actions list response
      if (reloadActions) {
        observable.push(this.adviceBuilderService.getActionList(houseHoldID, selectedStrategyID));
      }
      // 6. handle client income list
      if (reloadClientIncome) {
        observable.push(this.adviceBuilderService.getClientIncomesByScenarioId(houseHoldID, selectedStrategyID));
      }
      // 7. handle asset closed list
      if (reloadClosedAsset) {
        observable.push(this.adviceBuilderService.getAvailableAssetList(houseHoldID, selectedStrategyID, false));
      }
      // 8. hand insurance closed list
      if (reloadClosedInsurance) {
        observable.push(this.adviceBuilderService.getAvailableInsuranceList(houseHoldID, selectedStrategyID, false));
      }
      // 9. handle asset projections
      if (reloadAssetProjections) {
        observable.push(this.adviceBuilderService.getAssetProjectionByScenarioId(houseHoldID, selectedStrategyID));
      }
      // 10. handle debt projections
      if (reloadDebtProjections) {
        observable.push(this.adviceBuilderService.getDebtProjectionByScenarioId(houseHoldID, selectedStrategyID));
      }
      // 11. handle personal insurance projections
      if (reloadPersonalInsuranceProjections) {
        observable.push(this.adviceBuilderService.getPersonalInsuranceProjectionByScenarioId(houseHoldID, selectedStrategyID));
      }
      let index = -1;
      this.iSub = Observable.zip.apply(null, observable).subscribe(response => {
        if (this.iSub) {
          this.iSub.unsubscribe();
        }

        this.adviceBuilderService.hideLoading();
        if (response && response.length > 0) {
          // 1. handle strategy details response
          if (reloadStrategy) {
            index++;
            if (response[index] && response[index].success) {
              this.scenario = this.adviceBuilderService.selectedScenario = response[index].data;
              this.adviceBuilderService.selectedScenario.goals = this.filterGoalInRange(this.scenario.goals, this.scenario.strategyDuration);
              this.adviceBuilderService.cashFlowDetails = this.scenario && this.scenario.cashFlow && this.scenario.cashFlow.details;
              this.adviceBuilderService.familyMembers = this.scenario.familyMembers;
              localStorage.setItem("selectedStrategyID", this.scenario.scenarioId);
            }
            else {
              this.handleErrorMessageService.handleErrorResponse(response[index])
            }
          }

          // 2. handle active asset response
          if (reloadNotCloseAsset) {
            index++;
            if (response[index] && response[index].success) {
              this.adviceBuilderService.notClosedAssetList = response[index].data;
            }
            else {
              this.handleErrorMessageService.handleErrorResponse(response[index])
            }
          }

          // 3. handle active debt response
          if (reloadDebt) {
            index++;
            if (response[index] && response[index].success) {
              this.adviceBuilderService.debtList = response[index].data;
            }
            else {
              this.handleErrorMessageService.handleErrorResponse(response[index])
            }
          }

          // 4. handle active insurance response     
          if (reloadNotCloseInsurance) {
            index++;
            if (response[index] && response[index].success) {
              this.adviceBuilderService.activeInsuranceList = response[index].data;
            }
            else {
              this.handleErrorMessageService.handleErrorResponse(response[index])
            }
          }

          // 5. handle actions list response
          if (reloadActions) {
            index++;
            if (response[index] && response[index].success) {
              this.adviceBuilderService.actions = response[index].data;
            }
            else {
              this.handleErrorMessageService.handleErrorResponse(response[index])
            }
          }

          // 6. handle client income list
          if (reloadClientIncome) {
            index++;
            if (response[index] && response[index].success) {
              this.adviceBuilderService.clientIncomeSource = response[index].data;
            }
            else {
              this.handleErrorMessageService.handleErrorResponse(response[index])
            }
          }

          // 7. handle asset closed list
          if (reloadClosedAsset) {
            index++;
            if (response[index] && response[index].success) {
              this.adviceBuilderService.closedAssetList = response[index].data;
            }
            else {
              this.handleErrorMessageService.handleErrorResponse(response[index])
            }
          }

          // 8. hand insurance closed list
          if (reloadClosedInsurance) {
            index++;
            if (response[index] && response[index].success) {
              this.adviceBuilderService.closedInsuranceList = response[index].data;
            }
            else {
              this.handleErrorMessageService.handleErrorResponse(response[index])
            }
          }

          // 9. handle asset projections
          if (reloadAssetProjections) {
            index++;
            if (response[index] && response[index].success) {
              this.scenario = this.adviceBuilderService.assetProjections = response[index].data;
            }
            else {
              this.handleErrorMessageService.handleErrorResponse(response[index])
            }
          }

          // 10. handle debt projections
          if (reloadDebtProjections) {
            index++;
            if (response[index] && response[index].success) {
              this.scenario = this.adviceBuilderService.debtProjections = response[index].data;
            }
            else {
              this.handleErrorMessageService.handleErrorResponse(response[index])
            }
          }

          // 11. handle personal insurance projections
          if (reloadPersonalInsuranceProjections) {
            index++;
            if (response[index] && response[index].success) {
              this.scenario = this.adviceBuilderService.insuranceProjection = response[index].data;
            }
            else {
              this.handleErrorMessageService.handleErrorResponse(response[index])
            }
          }

          //#endregion handle response for projections
        }
      });
    }
  }

  private addGoal(event){
    this.addNewGoal = event;
  }
}
