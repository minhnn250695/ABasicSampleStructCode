import { BaseClientState } from '../base-state.model';
import { CashFlowCal, ClientCalculation, HouseHoldCashFlow } from '../models';
export class CashFlowState extends BaseClientState {
  cashFlowCal: CashFlowCal;
  houseHoldCashFlow: HouseHoldCashFlow;
  clientCalculation: ClientCalculation;
  grossSalaryAll: number = 0;
  investmentIncomeAll: number = 0;
  govermentBenefitAll: number = 0;
  retirementIncomeAll: number = 0;
  otherIncomeAll: number = 0;
  grossIncomeAll: number = 0;
  lessSalaryPackaging: number = 0;
  lessSalarySacrifice: number = 0;
  lessIncomeTax: number = 0;

  getTotalExpenses(): number {
    return this.clientCalculation && this.clientCalculation.getTotalExpenses() || 0;
  }

  getSurplusIncome() {
    return this.clientCalculation && this.clientCalculation.getSurplusIncome() || 0;
  }
  totalRetireIncomeStreams() {
    this.retirementIncomeAll = this.cashFlowCal && this.cashFlowCal.totalRetireIncomeStreams() || 0;
    return this.retirementIncomeAll;
  }
  totalInvestmentIncome() {
    this.investmentIncomeAll = this.cashFlowCal && this.cashFlowCal.totalInvestmentIncome() || 0;
    return this.investmentIncomeAll;
  }
  totalGrossSalary() {
    this.grossSalaryAll = this.cashFlowCal && this.cashFlowCal.totalGrossSalary() || 0;
    return this.grossSalaryAll;
  }
  totalOtherIncome() {
    this.otherIncomeAll = this.cashFlowCal && this.cashFlowCal.totalOtherIncome() || 0;
    return this.otherIncomeAll;
  }
  totalGrossIncome() {
    // return this.cashFlowCal && this.cashFlowCal.totalGrossIncome() || 0;
    this.govermentBenefitAll = this.houseHoldCashFlow && this.houseHoldCashFlow.governmentBenefitIncome;
    if (this.grossSalaryAll || this.investmentIncomeAll || this.govermentBenefitAll
      || this.retirementIncomeAll || this.otherIncomeAll) {
      this.grossIncomeAll = this.grossSalaryAll + this.investmentIncomeAll + this.govermentBenefitAll
        + this.retirementIncomeAll + this.otherIncomeAll;
    }
    return this.grossIncomeAll;
  }
  totalSalaryPackaging() {
    this.lessSalaryPackaging = this.cashFlowCal && this.cashFlowCal.totalSalaryPackaging() || 0;
    return this.lessSalaryPackaging;
  }
  totalSalarySacrifice() {
    this.lessSalarySacrifice = this.cashFlowCal && this.cashFlowCal.totalSalarySacrifice() || 0;
    return this.lessSalarySacrifice;
  }
  totalIncomeTax() {
    this.lessIncomeTax = this.cashFlowCal && this.cashFlowCal.totalIncomeTax() || 0;
    return this.lessIncomeTax;
  }
  totalNetIncome() {
    // return this.cashFlowCal && this.cashFlowCal.totalNetIncome() || 0;
    let totalNetIncome = 0;
    if (this.lessIncomeTax || this.lessSalaryPackaging || this.lessSalarySacrifice || this.grossIncomeAll) {
      totalNetIncome = this.grossIncomeAll - (this.lessIncomeTax + this.lessSalaryPackaging + this.lessSalarySacrifice);
    }
    return totalNetIncome;
  }
  totalNonDeductibleDebt() {
    return this.cashFlowCal && this.cashFlowCal.totalNonDeductibleDebt() || 0;
  }
  totalDeductibleDebt() {
    return this.cashFlowCal && this.cashFlowCal.totalDeductibleDebt() || 0;
  }
  totalInvestmentExpense() {
    return this.cashFlowCal && this.cashFlowCal.totalInvestmentExpense() || 0;
  }
  totalInvestmentContribution() {
    return this.cashFlowCal && this.cashFlowCal.totalInvestmentContribution() || 0;
  }
  totalPersonalInsurance() {
    return this.cashFlowCal && this.cashFlowCal.totalPersonalInsurance() || 0;
  }
  /**
   * houseHoldCashFlow
   */
  lifeStyleExpensesDiscretionary() {
    return this.houseHoldCashFlow && this.houseHoldCashFlow.lifeStyleExpensesDiscretionary || 0;
  }
  lifeStyleExpensesFixed() {
    return this.houseHoldCashFlow && this.houseHoldCashFlow.lifeStyleExpensesFixed || 0;
  }
}
