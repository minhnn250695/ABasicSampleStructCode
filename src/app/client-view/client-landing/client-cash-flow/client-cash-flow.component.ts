import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
// services
import { ConfigService } from '../../../common/services/config-service';
import { ClientViewService } from '../../client-view.service';
// models
import { CashFlowCal, ClientCalculation, HouseHoldResponse } from '../../models';

import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';
import { CashFlowCurrent } from '../../models/current-scenario/cash-flow-current.model';

declare var $: any;

@Component({
  selector: 'fp-client-cash-flow',
  templateUrl: './client-cash-flow.component.html',
  styleUrls: ['./client-cash-flow.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientCashFlowComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  //#region Properties
  @Input() cashFlow: CashFlowCurrent = new CashFlowCurrent();

  private clientCalculation: ClientCalculation;
  private totalCashFlow: CashFlowCal;  // actual list to display into view
  private currentDisplayType: string;
  //#endregion

  //#region Constructors
  constructor(private clientService: ClientViewService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    super.onBaseInit();    
    this.checkUsingMobile();
    // super.setupFixedFirstColumnTable();
    this.currentDisplayType = "Income";
  }

  ngOnDestroy() {
    this.onBaseDestroy();
  }
  //#endregion

  //#region Actions
  private showDetails(type: string) {
    if(type) {
      if(type != this.currentDisplayType)
        this.currentDisplayType = type;
      else
      this.currentDisplayType = "";
    }
  }

  private totalNetIncome() {
    return this.totalCashFlow && this.totalCashFlow.totalNetIncome() || 0;
  }

  private totalGrossIncome() {
    return this.totalCashFlow && this.totalCashFlow.totalGrossIncome() || 0;
  }

  private preTaxDeductions() {
    return this.totalCashFlow && this.totalCashFlow.preTaxDeductions() || 0;
  }

  private incomeTax() {
    return this.totalCashFlow && this.totalCashFlow.incomeTax() || 0;
  }

  private totalExpenses() {
    return this.totalCashFlow && this.totalCashFlow.totalExpenses() || 0;
  }

  private lifestyle() {
    return this.totalCashFlow && this.totalCashFlow.lifestyle() || 0;
  }

  private credit() {
    return this.totalCashFlow && this.totalCashFlow.credit() || 0;
  }

  private investment() {
    return this.totalCashFlow && this.totalCashFlow.investment() || 0;
  }

  private totalPersonalInsurance() {
    return this.totalCashFlow && this.totalCashFlow.totalPersonalInsurance() || 0;
  }

  private getSurplusIncome() {
    return this.clientCalculation && this.clientCalculation.getSurplusIncome() || 0;
  }

  private getGrossSalary() {
    return this.totalCashFlow && this.totalCashFlow.totalGrossSalary() || 0;
  }

  private getGovernmentBenefit() {
    return 0;
  }

  private getOtherIncome() {
    return this.totalCashFlow && this.totalCashFlow.totalOtherIncome() || 0;
  }

  private getInvestmentIncome() {
    return this.totalCashFlow && this.totalCashFlow.totalInvestmentIncome() || 0;
  }

  private getRetirementIncome() {
    return this.totalCashFlow && this.totalCashFlow.totalRetireIncomeStreams() || 0;
  }

  private getPreTaxSpending() {
    return this.totalCashFlow && this.totalCashFlow.preTaxDeductions() || 0;
  }

  private getSalarySacrifice() {
    return this.totalCashFlow && this.totalCashFlow.totalSalarySacrifice() || 0;
  }

  private getTotalIncomeTax() {
    return this.totalCashFlow && this.totalCashFlow.totalIncomeTax() || 0;
  }

  private getTotalNetIncome() {
    return this.totalCashFlow && this.totalCashFlow.totalNetIncome() || 0;
  }

  private getExpense() {
    return this.totalCashFlow && this.totalCashFlow.totalExpenses() || 0;
  }

  private getLifeStyleNeeds() {
    return this.totalCashFlow && this.totalCashFlow.totalLifeStyleNeed() || 0;
  }

  private getLifeStyleWants() {
    return this.totalCashFlow && this.totalCashFlow.totalLifeStyleWant() || 0;
  }

  private getLifeStyleGoal() {
    return 0;
  }

  private getNonDeductibleDebt() {
    return this.totalCashFlow && this.totalCashFlow.totalNonDeductibleDebt() || 0;
  }

  private getDeductibleDebt() {
    return this.totalCashFlow && this.totalCashFlow.totalDeductibleDebt() || 0;
  }

  private getInvestmentExpenses() {
    return this.totalCashFlow && this.totalCashFlow.totalInvestmentExpense() || 0;
  }

  private getInvestmentContribution() {
    return this.totalCashFlow && this.totalCashFlow.totalInvestmentContribution() || 0;
  }

  private getPersonalInsurance() {
    return this.totalCashFlow && this.totalCashFlow.totalPersonalInsurance() || 0;
  }

  private getTotalExpenses() {
    return this.totalCashFlow && this.totalCashFlow.totalExpenses() || 0;
  }

  private getWeeklySurplus() {
    return this.totalCashFlow && this.totalCashFlow.totalWeeklySurplus() || 0;
  }

  private getNetAccountTransfers() {
    return 0;
  }
  //#endregion
}
