import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

// models
import { Result, UiEvent } from '../../common/models';
import { CashFlow, HouseHoldCashFlow, HouseHoldResponse, CurrentScenarioModel } from '../models';

// services
import { FpStorageService } from '../../local-storage.service';
import { ClientViewService } from '../client-view.service';
import { CashFlowService } from './cash-flow.service';

// components
import { ApiDataResult } from '../../common/api/api-data-result';
import { ConfigService } from '../../common/services/config-service';
import { BaseClientViewComponent } from '../base-client-view.component';
import { CashFlowDetails } from '../models/current-scenario/cash-flow-details.model';
import { CashFlowState } from './CashFlowState';

declare var $: any;

@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.css'],
})
export class CashFlowComponent extends BaseClientViewComponent implements OnInit, OnDestroy {
  houseHoldId: string;
  cashFlowDetail: CashFlowDetails = new CashFlowDetails();
  cashFlowDisplayDetail: any;
  private state: CashFlowState = new CashFlowState();
  private cashflowOverviewDetails: any = [];
  private containerInnerHeight: number = 0;
  private isShowIncomeDetails: boolean = false;
  private isShowExpensesDetails: boolean = false;

  constructor(
    private cashFlowService: CashFlowService,
    clientService: ClientViewService,
    fpStorageService: FpStorageService,
    configService: ConfigService) {
    super(clientService, fpStorageService, configService);
  }


  ngOnInit() {
    super.onBaseInit();
    this.onInit();
    if (this.isMobile)
      this.setupContentContainerHeight();
    this.initCashflowOverviewDetails();
    // get household
    let id = this.clientService.clientViewState.clientId;
    this.proceedEvent(CashFlowEvent.GET_HOUSEHOLD_INFO, id);
    this.setupPopover();

  }

  ngOnDestroy() {
    this.onDestroy();
    $('.popover').popover('hide');
  }

  /* =====================================================================================================================
  * Event handling
  * ===================================================================================================================== */
  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();
    let payload = event.payload;

    switch (event.event) {
      case CashFlowEvent.GET_HOUSEHOLD_INFO:
        return this.clientService.getClientHouseHolds(payload);
      case CashFlowEvent.GET_CASH_FLOWS:
        this.clientService.showLoading();
        return this.cashFlowObs();
      case CashFlowEvent.UPDATE_CASH_FLOW: return this.clientService.updateHouseHoldCashFlow(payload);
      default: break;
    }

    return Observable.empty();
  }

  handleEventResult(result: Result) {
    if (!result) return;
    let payload = result.payload;

    switch (result.event) {
      case CashFlowEvent.GET_HOUSEHOLD_INFO:
        this.state.houseHolds = payload;
        this.houseHoldId = payload.id;
        this.getHouseholdCashFlow(payload.id);
        this.loadCashFlows();
        break;
      case CashFlowEvent.GET_CASH_FLOWS:
        this.state.cashFlowCal = payload.cash;
        this.state.houseHoldCashFlow = payload.houseHoldCash;
        this.clientService.hideLoading();
        break;
      case CashFlowEvent.UPDATE_CASH_FLOW:
        this.clientService.hideLoading();
        this.state.houseHoldCashFlow = result.orginalPayload;
        break;
      default:
        break;
    }
  }

  handleError(error: any) { }

  private toggleCashflowItemDetails(index) {
    this.cashFlowDisplayDetail[index].isShow = !this.cashFlowDisplayDetail[index].isShow;
  }

  private isShow(item) {
    return item.isShow;
  }

  initCashflowOverviewDetails() {
    this.cashflowOverviewDetails = [
      { label: "Surplus", id: "overview-surplus", icon: "fa-chart-line", value: 0 },
      { label: "Weekly Surplus", id: "overview-weekly-surplus", icon: "fa-calendar", value: 0 },
    ]
  }
  getHouseholdCashFlow(id: string) {
    this.clientService.getCurrentScenario(id).subscribe((response: ApiDataResult<CurrentScenarioModel>) => {
      if (response.success) {
        const cashFlowList = this.cloneObject(response.data.cashFlow);
        this.cashFlowDetail = cashFlowList.details[0];
        this.getDisplayInfo();

      }
    });
  }

  private getDisplayInfo() {
    if (this.cashFlowDetail) {
      // Overview details
      this.cashflowOverviewDetails[0].value = this.cashFlowDetail && this.cashFlowDetail.surplusIncome ? this.cashFlowDetail.surplusIncome : 0;
      this.cashflowOverviewDetails[1].value = this.cashFlowDetail && this.cashFlowDetail.weeklySurplus ? this.cashFlowDetail.weeklySurplus : 0;
      // Income/Expense details
      this.cashFlowDisplayDetail = [
        {
          label: "Income", type: "income", id: "income", isShow: false,
          total: { id: 'total-net-income', label: "Total Net Income", value: this.cashFlowDetail.totalNetIncome ? this.cashFlowDetail.totalNetIncome : 0 },
          details: [
            { id: 'gross-salary', label: "Gross Salary", value: this.cashFlowDetail.grossSalary ? this.cashFlowDetail.grossSalary : 0 },
            { id: 'investment-income', label: "Investment income", value: this.cashFlowDetail.investmentIncome ? this.cashFlowDetail.investmentIncome : 0 },
            { id: 'goverment-benefits', label: "Goverment benefits", value: this.cashFlowDetail.governmentBenefits ? this.cashFlowDetail.governmentBenefits : 0 },
            { id: 'retirement-income-streams', label: "Retirement income streams", value: this.cashFlowDetail.retirementIncomeStreams ? this.cashFlowDetail.retirementIncomeStreams : 0 },
            { id: 'other-income', label: "Other income", value: this.cashFlowDetail.otherIncome ? this.cashFlowDetail.otherIncome : 0 },
            { id: 'total-gross-income', label: "Total gross income", value: this.cashFlowDetail.totalGrossIncome ? this.cashFlowDetail.totalGrossIncome : 0 },
            { id: 'less-salary-packaging', label: "Less salary packaging", value: this.cashFlowDetail.preTaxSpending ? this.cashFlowDetail.preTaxSpending : 0 },
            { id: 'less-salary-sacrifice', label: "Less salary sacrifice", value: this.cashFlowDetail.salarySacrifice ? this.cashFlowDetail.salarySacrifice : 0 },
            { id: 'less-income-tax', label: "Less income tax", value: this.cashFlowDetail.incomeTax ? this.cashFlowDetail.incomeTax : 0 },
          ]
        },
        {
          label: "Expenses", type: "expenses", id: "expenses", isShow: false,
          total: { id: 'total-expenses', label: "Total Expenses", value: this.cashFlowDetail.totalExpenses },
          details: [
            { id: 'lifestyle-fixed', label: "Lifestyle fixed", value: this.cashFlowDetail.lifestyleNeeds ? this.cashFlowDetail.lifestyleNeeds : 0 },
            { id: 'lifestyle-discretionary', label: "Lifestyle discretionary", value: this.cashFlowDetail.lifestyleWants ? this.cashFlowDetail.lifestyleWants : 0 },
            { id: 'lifestyle-goals', label: "Lifestyle goals", value: this.cashFlowDetail.lifestyleGoals ? this.cashFlowDetail.lifestyleGoals : 0 },
            { id: 'non-deductible-debt', label: "Non-deductible debt", value: this.cashFlowDetail.nonDeductibleDebt ? this.cashFlowDetail.nonDeductibleDebt : 0 },
            { id: 'deductible-debt', label: "Deductible debt", value: this.cashFlowDetail.deductibleDebt ? this.cashFlowDetail.deductibleDebt : 0 },
            { id: 'investment-expenses', label: "Investment expenses", value: this.cashFlowDetail.investmentExpenses ? this.cashFlowDetail.investmentExpenses : 0 },
            { id: 'investment-contributions', label: "Investment contributions", value: this.cashFlowDetail.investmentContributions ? this.cashFlowDetail.investmentContributions : 0 },
            { id: 'personal-insurances', label: "Personal insurances", value: this.cashFlowDetail.personalInsurance ? this.cashFlowDetail.personalInsurance : 0 },
          ]
        }
      ]
    }

  }
  /* =====================================================================================================================
  * View Action
  * ===================================================================================================================== */
  private actionUpdateCashFlow(updatedCashFlow: HouseHoldCashFlow) {
    this.proceedEvent(CashFlowEvent.UPDATE_CASH_FLOW, updatedCashFlow);
  }

  /**
   * getCashFlow
   */
  private getGovermentBenefits() {
    return this.state.houseHoldCashFlow && this.state.houseHoldCashFlow.governmentBenefitIncome || 0;
  }


  /* =====================================================================================================================
  * Private Part
  * ===================================================================================================================== */
  private setupPopover() {

    // close popover when click outside
    $('html').on('click', (e) => {
      if (!$(e.target).parents().is('.popover.in') && !$(e.target).parents().is('a')) {
        $('[rel="popover"]').popover('hide');
      }
    });

    $('.update').click(() => {
      let fixed = parseFloat($('.popover #txtNeeds').val());
      let discretionary = parseFloat($('.popover #txtWants').val());

      $('[rel="popover"]').popover('hide');

      if (!this.state.houseHoldCashFlow) {
        return;
      }
      let updatedCashFlow: HouseHoldCashFlow = { ...this.state.houseHoldCashFlow };

      if (fixed || fixed === 0) {
        updatedCashFlow.lifeStyleExpensesFixed = fixed;
      }

      if (discretionary || discretionary === 0) {
        updatedCashFlow.lifeStyleExpensesDiscretionary = discretionary;
      }

      this.actionUpdateCashFlow(updatedCashFlow);
    });
  }

  private setupContentContainerHeight() {
    this.containerInnerHeight = window.innerHeight - 113;
  }

  private loadCashFlows() {
    this.proceedEvent(CashFlowEvent.GET_CASH_FLOWS);
  }

  private cashFlowObs(): Observable<any> {
    let cashFlow = this.cashFlowService.getCashFlowsFor(this.state.getIds());
    let houseHoldCash = this.clientService.getHouseHoldCashFlow(this.houseHoldId);
    return Observable.zip(cashFlow, houseHoldCash, (res1, res2) => {
      return { cash: res1, houseHoldCash: res2 };
    });
  }
}

enum CashFlowEvent {
  GET_HOUSEHOLD_INFO,
  GET_CASH_FLOWS,
  UPDATE_CASH_FLOW
}