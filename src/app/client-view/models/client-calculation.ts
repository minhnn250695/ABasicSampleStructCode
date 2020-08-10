
import { FinanceUtil } from '../../common/utils';
import { AssetType } from '../../common/models/asset-type.enum';
import { AssetPurpose } from './asset-purpose.enum';
import { CashFlowCal } from './cash-flow-cal.model';
import { ClientAsset } from './client-asset.model';
import { ClientDebt } from './client-debt.model';
import { Contact } from './contact.model';
import { HouseHoldCashFlow } from './house-hold-cash-flow.model';
import { HouseHoldResponse } from './household-response.model';
import { TotalClientAssets } from './total-client-assets.model';
import { TotalClientDebts } from './total-client-debts.model';

export class ClientCalculation {
  private financeUtil: FinanceUtil = new FinanceUtil();
  private readonly rateInflation = 2.5;
  private readonly avgAgeWorkStarts = 20;
  private readonly maxLifeExpectancy = 95;
  private readonly returnRateCash = 3.0;
  constructor(private totalClientAssets?: TotalClientAssets,
    private totalClientDebts?: TotalClientDebts,
    private totalCashFlow?: CashFlowCal,
    private houseHoldResponse?: HouseHoldResponse,
    private houseHoldCashFlow?: HouseHoldCashFlow) {

  }

  setTotalAssets(totalClientAssets: TotalClientAssets) {
    this.totalClientAssets = totalClientAssets;
  }

  setTotalDebts(totalClientDebts?: TotalClientDebts) {
    this.totalClientDebts = totalClientDebts;
  }

  setTotalCashFlows(totalCashFlow?: CashFlowCal) {
    this.totalCashFlow = totalCashFlow;
  }

  getTotalAssetsObject() {
    return this.totalClientAssets;
  }

  getTotalDebtsObject() {
    return this.totalClientDebts;
  }

  getTotalCashFlowsObject() {
    return this.totalCashFlow;
  }

  setHouseHoldResponse(houseHoldResponse: HouseHoldResponse) {
    this.houseHoldResponse = houseHoldResponse;
  }

  getHouseHoldMembers() {
    return this.houseHoldResponse && this.houseHoldResponse.members;
  }

  setHouseHoldCashFlow(houseHoldCashFlow: HouseHoldCashFlow) {
    this.houseHoldCashFlow = houseHoldCashFlow;
  }

  getHouseHoldCashFlow() {
    return this.houseHoldCashFlow;
  }

  getHouseHoldId() {
    return this.houseHoldResponse && this.houseHoldResponse.id;
  }

  /**
   * ============================================================================================================================
   *  CASH FLOW CALCULATION
   * ============================================================================================================================
   */

  getTotalExpenses(): number {
    let total = 0;

    if (this.houseHoldCashFlow) {
      if (this.houseHoldCashFlow.lifeStyleExpensesFixed) total += this.houseHoldCashFlow.lifeStyleExpensesFixed;
      if (this.houseHoldCashFlow.lifeStyleExpensesDiscretionary) total += this.houseHoldCashFlow.lifeStyleExpensesDiscretionary;
    }
    if (this.totalCashFlow) {
      total += (this.totalCashFlow.totalNonDeductibleDebt() || 0);
      total += (this.totalCashFlow.totalDeductibleDebt() || 0);
      total += (this.totalCashFlow.totalInvestmentExpense() || 0);
      total += (this.totalCashFlow.totalInvestmentContribution() || 0);
      total += (this.totalCashFlow.totalPersonalInsurance() || 0);
    }

    return total || 0;
  }

  totalNetIncome() {
    return this.totalCashFlow && this.totalCashFlow.totalNetIncome() || 0;
  }

  getSurplusIncome() {
    return (this.totalNetIncome() - this.getTotalExpenses()) || 0;
  }

  /**
   * ============================================================================================================================
   *  RETIREMENT CALCULATION
   * ============================================================================================================================
   */
  yearsUntilRetirement() {
    let members = this.houseHoldResponse && this.houseHoldResponse.members;
    if (!members || members && members.length === 0) { return 0; }

    let client1 = members[0];
    let client2 = members[1];
    // retirementIncome
    let age1 = (client1 && client1.retirementAge || 0) - (client1 && client1.age || 0);
    let age2 = (client2 && client2.retirementAge || 0) - (client2 && client2.age || 0);
    return Math.max(age1, age2, 0);
  }

  yearsInRetirement() {
    let members = this.houseHoldResponse && this.houseHoldResponse.members;
    if (!members || members && members.length === 0) { return 0; }

    let client1 = members[0];
    let client2 = members[1];
    // retirementIncome
      let age1 = this.maxLifeExpectancy - (client1 && client1.retirementAge || this.maxLifeExpectancy);
      let age2 = this.maxLifeExpectancy - (client2 && client2.retirementAge || this.maxLifeExpectancy);
    return Math.max(age1, age2);
  }

  retirementCapital() {
    let assetsAverageReturns = this.getAvgNetReturn() / 100;
    let retirementYearsUntil = this.yearsUntilRetirement();
    let contribution = -1 * this.getTotalNetContribution();
    let assetsTotal = -1 * this.getTotalCurrentInvestment();
    let yearsToPay = this.getYearToPayDebt();

    let value1 = this.financeUtil.FV(assetsAverageReturns, retirementYearsUntil, contribution, assetsTotal) || 0;
    //
    let averageInterestRate = this.getAverageInterestRate() / 100;
    let netDebt = this.getCurrentNetDebt();
    let annualPayments = -1 * this.getTotalAnnualPayment();

    let value2 = averageInterestRate && (yearsToPay > retirementYearsUntil) ? this.financeUtil.FV(averageInterestRate, retirementYearsUntil, annualPayments, netDebt) : 0;

    return value1 + value2;
  }

  retirementCapitalEquivalent() {
    let retirementCapital = -1 * this.retirementCapital();
    let value = this.financeUtil.PV(this.rateInflation / 100, this.yearsUntilRetirement(), 0, retirementCapital) || 0;

    return value;
  }

  retirementIncome() {
    let retirementCapital = -1 * this.retirementCapital();
    let value = this.financeUtil.PMT(this.returnRateCash / 100, this.yearsInRetirement(), retirementCapital, 0, 0);
    return value;
  }

  retirementIncomeEquivalent() {
    let retirementCapitalEquivalent = -1 * this.retirementCapitalEquivalent();
    let value = this.financeUtil.PMT(this.returnRateCash / 100, this.yearsInRetirement(), retirementCapitalEquivalent, 0, 0);
    return value;
  }

  retirementIncomePercentage(householdRetirementIncome: number) {
    let retirementIncomeEquivalent = this.retirementIncomeEquivalent() || 0;
    if (!householdRetirementIncome) return 0;
    let percent = retirementIncomeEquivalent / householdRetirementIncome;
    return (percent > 1 ? 1 : percent) * 100;
  }

  /**
   *
   */
  getRetirementYearPercent() {
    if (!this.houseHoldResponse) {
      return null;
    }

    if (!this.houseHoldResponse.retirementYear) {
      return null;
    }

    let members = this.houseHoldResponse.members;
    if (!members || members && members.length === 0) { return null; }

    let client1 = members[0];
    let client2 = members[1];
    // age
    let client1Age = client1 && client1.age || 0;
    let client2Age = client2 && client2.age || 0;
    // retirement age
    let client1RetirementAge = client1 && client1.retirementAge || 0;
    let client2RetirementAge = client2 && client2.retirementAge || 0;
    // RetirementYearsUntil
    let currentYear = new Date().getFullYear();
    let retirementYearsUntil = (this.houseHoldResponse.retirementYear || 0) - currentYear;

    let percentage = 0;
    if (Math.max(client1Age, client2Age) < this.avgAgeWorkStarts) {
      percentage = (1 - retirementYearsUntil / (Math.max(client1RetirementAge, client2RetirementAge) -
        Math.max(client1Age, client2Age))) * 100;
    }
    percentage = (1 - retirementYearsUntil /
      (Math.max(client1RetirementAge, client2RetirementAge) - this.avgAgeWorkStarts)) * 100;

    return Math.round(percentage);
  }

  houseHoldRetirementIncome() {
    return this.houseHoldResponse && this.houseHoldResponse.retirementIncome || 0;
  }

  houseHoldRetirmentYear() {
    return this.houseHoldResponse && this.houseHoldResponse.retirementYear || 0;
  }

  updateRetirementIncome(income: number) {
    if (this.houseHoldResponse) this.houseHoldResponse.retirementIncome = income;
  }



  /**
   * ============================================================================================================================
   *  INDIVIDUAL CONTACT CALCULATION
   * ============================================================================================================================
   */

  annualEmployerContributions(contact: Contact) {
    if (!contact) { return 0; };
    return (contact.grossSalary || 0) * (contact.superannuationRate / 100 || 0);
  }

  /**
   * ============================================================================================================================
   *  INDIVIDUAL ASSET CALCULATION
   * ============================================================================================================================
   */
  getAnualNetContribution(asset: ClientAsset) {
    if (!asset) { return 0; };

    let ownerId = asset.primaryClientId;
    let clients = this.houseHoldResponse && this.houseHoldResponse.members;
    if (!clients) { return 0; };
    let owner = clients.find(item => item.id === ownerId);

    let employercontribution = (asset.assetType === AssetType.Superannuation_Account.toString()) ? this.annualEmployerContributions(owner) : 0;
    let contribution = (asset.annualTaxedPersonalConts || 0) + employercontribution;
    let result = contribution * (1 - (asset.contributionsTax / 100 || 0)) + (asset.annualUntaxedPersonalConts || 0);
    return owner && result || 0;
  }

  /**
   * ============================================================================================================================
   *  TOTAL ASSETS CALCULATION
   * ============================================================================================================================
   */
  getTotalNetContribution(ids?: string[]) {
    let assets = this.totalClientAssets && this.totalClientAssets.getAllClientAssets(ids);
    if (!assets) { return 0; }
    let total = 0;
    assets.forEach(item => {
      if (item && item.assetPurpose === "100000000") {
        total = total + this.getAnualNetContribution(item);
      }
    });

    return total;
  }

  getFutureTotalInvestment(numOfYear: number, calculatedKeys?: string[]) {
    if (!this.totalClientAssets) return 0;


    let assets = this.totalClientAssets.getAllClientAssets(calculatedKeys);
    if (!assets) { return 0; };

    let total = 0;

    assets.filter(item => item.assetPurpose === AssetPurpose.Investment.toString())
      .forEach(asset => {
        total = total + this.assetFutureValueFor(asset, numOfYear);
      });

    return total;
  }


  assetFutureValueFor(asset: ClientAsset, numOfYear: number): number {
    if (!asset || asset && (asset.assetPurpose === AssetPurpose.Lifestyle.toString())) {
      return 0;
    }

    let currentFv = asset.currentBalance || 0;
    let pmt = -1 * ((this.getAnualNetContribution(asset) || 0) - (asset.annualIncome || 0));

    let value = this.financeUtil.FV(asset.estimatedNetReturns / 100 || 0, numOfYear, pmt, currentFv * -1);

    let result = value >= 0 ? value : 0;
    if (asset.name === "Trust Investment Fund") {
      result = result + this.getSurplusIncome();
    }

    return result;
  }

  /**
   * project wealth
   */
  getCurrentProjectWealth(yearToInvest: number) {
    let assetsAverageReturns = this.getAvgNetReturn() / 100 || 0;
    let totalContribution = -1 * this.getTotalNetContribution() || 0;
    let assetsTotal = -1 * this.getTotalCurrentInvestment() || 0;
    return this.financeUtil.FV(assetsAverageReturns, yearToInvest || 0, totalContribution, assetsTotal);
  }

  getCurrentProjectWealthEquivalent(yearToInvest: number) {
    let rate = this.rateInflation / 100;
    let current = -1 * this.getCurrentProjectWealth(yearToInvest);

    return this.financeUtil.PV(rate, yearToInvest || 0, 0, current);
  }

  getAdditionalProjectWealth(yearToInvest: number, amount: number, investReturnRate: number) {
    let currentWealth = this.getCurrentProjectWealth(yearToInvest);

    //
    let rate = (investReturnRate / 12 || 0) / 100;
    let nper = yearToInvest * 12 || 0;
    let newAmount = -1 * amount || 0;
    return currentWealth + this.financeUtil.FV(rate, nper, newAmount, 0);
  }

  getAdditionalProjectWealthEquivalent(yearToInvest: number, amount: number, investReturnRate: number) {
    let rate = this.rateInflation / 100;
    let current = -1 * this.getAdditionalProjectWealth(yearToInvest, amount, investReturnRate);

    return this.financeUtil.PV(rate, yearToInvest || 0, 0, current);
  }


  /**
   *
   */
  getTotalCurrentInvestment(): number {
    let assets = this.totalClientAssets && this.totalClientAssets.getAllClientAssets();
    if (!assets) { return 0; }
    let total = 0;
    assets.forEach(item => {
      total = total + (item && item.assetPurpose === "100000000" && item.currentBalance || 0);
    });

    return total;
  }

  getAvgNetReturn(): number {
    let assets = this.totalClientAssets && this.totalClientAssets.getAllClientAssets();
    if (!assets) { return 0; }
    let balanceNetReturn = 0;
    let totalInvestment = 0;

    assets.forEach(item => {
      if (item && item.assetPurpose === "100000000") {
        balanceNetReturn = balanceNetReturn + (item.currentBalance || 0) * (item.estimatedNetReturns / 100 || 0);
        totalInvestment = totalInvestment + (item.currentBalance || 0);
      }
    });

    return (totalInvestment === 0 ? 0 : balanceNetReturn / totalInvestment) * 100;
  }

  getEquivalent(yearToInvest: number): number {
    if (!this.totalClientAssets) { return 0; }

    let rate = this.rateInflation / 100 || 0;
    let nper = yearToInvest || 0;
    let pmt = 0;
    let current = this.totalClientAssets.getFutureTotalInvestment(yearToInvest) * -1;
    return this.financeUtil.PV(rate, nper, pmt, current);
  }

  getAdditionalContribution(amountInvested: number,
    yearToInvest: number,
    investmentReturnsRate: number): number {
    if (!this.totalClientAssets) { return 0; }
    // default
    let newYearToInvest = yearToInvest || 0;
    let newAmountInvested = amountInvested || 0;
    investmentReturnsRate = investmentReturnsRate || 0;

    let current = this.totalClientAssets.getFutureTotalInvestment(newYearToInvest);

    let fv = this.financeUtil.FV((investmentReturnsRate / 100) / 12, newYearToInvest * 12, newAmountInvested * -1, 0);
    return current + fv || 0;
  }

  getAdditionalEquivalent(amountInvested: number,
    yearToInvest: number,
    investmentReturnsRate: number) {
    if (!this.totalClientAssets) { return 0; }

    let newYearToInvest = yearToInvest || 0;
    let newAmountInvested = amountInvested || 0;
    investmentReturnsRate = investmentReturnsRate || 0;

    let rate = (this.rateInflation / 100) || 0;
    let nper = yearToInvest || 0;
    let pmt = 0;
    let fv = this.getAdditionalContribution(amountInvested, yearToInvest, investmentReturnsRate) * -1;
    return this.financeUtil.PV(rate, newYearToInvest, pmt, fv);
  }

  /**
   * ============================================================================================================================
   *  DEBT CALCULATION
   * ============================================================================================================================
   */
  getCurrentGrossDebt(): number {
    let debts = this.totalClientDebts && this.totalClientDebts.getAllClientDebts();
    if (!debts) { return 0; }

    let total = 0;
    debts.forEach(item => {
      if (item) total = total + (item.currentBalance || 0);
    });

    return total;
  }

  getCurrentNetDebt(): number {
    let debts = this.totalClientDebts && this.totalClientDebts.getAllClientDebts();
    if (!debts) { return 0; }

    let total = 0;
    debts.forEach(item => {
      if (item) total = total + (item.currentBalance || 0) - (item.offsetAccountBalance || 0);
    });

    return total;
  }

  getTotalDeductilePayments(): number {
    let cashes = this.totalCashFlow && this.totalCashFlow.getAllCashFlows();
    if (!cashes) { return 0; };

    let total = 0;
    cashes.forEach(item => {
      if (item) total = total + (item.deductibleDebt || 0);
    });

    return total;
  }

  getTotalNonDeductilePayments(): number {
    let cashes = this.totalCashFlow && this.totalCashFlow.getAllCashFlows();
    if (!cashes) { return 0; };

    let total = 0;
    cashes.forEach(item => {
      if (item) total = total + (item.nonDeductibleDebt || 0);
    });

    return total;
  }

  getTotalAnnualPayment(): number {
    return this.getTotalDeductilePayments() + this.getTotalNonDeductilePayments();
  }
  /**
   * average interest rate
   */
  getAverageInterestRate(): number {
    if (!this.totalClientDebts) return 0;
    return this.totalClientDebts.getAverageInterestRate();
  }

  getYearToPayDebt(additionalPayment: number = 0): number {
    let rate = (this.getAverageInterestRate() / 12) / 100;
    let payments = -1 * (this.getTotalAnnualPayment() / 12 + (additionalPayment || 0));
    let currentDebt = this.getCurrentNetDebt();
    let nper = this.financeUtil.NPER(rate, payments, currentDebt, 0);
    return nper / 12 || 0;
  }

}
