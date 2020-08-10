import { CashFlow } from './cash-flow.model';

/**
 * Cash flow calculation
 */
export class CashFlowCal {

    private cashMap: Map<string, CashFlow>;
    // keys: string[] = [];

    constructor() {
        // this.keys = ids ? ids : [];
        this.cashMap = new Map<string, CashFlow>();
    }

    ///////////////////// CALCULATE TOTAL VALUES ///////////////////////////////////////////////

    getAllCashFlows(ids?: string[]): CashFlow[] {
        if (!this.cashMap) return [];

        let keys: string[] = ids || Array.from(this.cashMap.keys());
        let result: CashFlow[] = [];

        keys.forEach(key => {
            let cash = this.get(key);
            if (cash) {
                result.push(cash);
            }
        })
        return result;
    }

    ///////////////////// RETURN TOTAL VALUES ///////////////////////////////////////////////
    private forEachData(ids: string[], callback: (cached: CashFlow) => void) {
        let newIds = ids || Array.from(this.cashMap.keys());
        if (!newIds || newIds && newIds.length == 0) {
            return 0;

        }
        newIds.forEach(key => {
            let cached = this.get(key);
            if (cached) {
                callback(cached);
            }
        });
    }

    totalGrossSalary(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.grossSalary || 0);
        })
        return total;
    }

    totalInvestmentIncome(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.investmentIncome || 0);
        })
        return total;
        // return this.totalInvestmentIncomeValue;
    }

    // totalGovermentBenefits(ids?: string[]) {
    //     let total = 0;
    //     this.forEachData(ids, (cached) => {
    //         total = total + (cached.governmentBenefits || 0);
    //     })
    //     return total;
    //     // return this.totalGovernmentBenefitsValue;
    // }

    totalRetireIncomeStreams(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.retirementIncomeStreams || 0);
        })
        return total;
        // return this.totalRetirementIncomeStreamsValue;
    }

    totalOtherIncome(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.otherIncome || 0);
        })
        return total;
        // return this.totalOtherIncomeValue;
    }

    totalGrossIncome(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.totalGrossIncome || 0);
        })
        return total;
        // return this.totalGrossIncomeValue;
    }

    totalSalaryPackaging(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.salaryPackaging || 0);
        })
        return total;
        // return this.totalSalaryPackagingValue;
    }

    totalSalarySacrifice(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.salarySacrifice || 0);
        })
        return total;
        // return this.totalSalarySacrificeValue;
    }

    totalIncomeTax(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.incomeTax || 0);
        })
        return total;
        // return this.totalIncomeTaxValue;
    }

    // getTotalNetIncome() {
    totalNetIncome(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.totalNetIncome || 0);
        })
        return total;
    }

    totalLifeStyleNeed(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.fixedExpenses || 0);
        })
        return total;
        // return this.totalFixedExpensesValue;
    }

    totalLifeStyleWant(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.discretionaryExpenses || 0);
        })
        return total;
        // return this.totalDiscretionaryExpensesValue;
    }

    totalNonDeductibleDebt(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.nonDeductibleDebt || 0);
        })
        return total;
        // return this.totalNonDeductibleDebtValue;
    }

    // deductibleDebt() {
    totalDeductibleDebt(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.deductibleDebt || 0);
        })
        return total;
        // return this.totalDeductibleDebtValue;
    }

    totalInvestmentExpense(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.investmentExpenses || 0);
        })
        return total;
        // return this.totalInvestmentExpensesValue;
    }

    totalInvestmentContribution(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.investmentContributions || 0);
        })
        return total;
        // return this.totalInvestmentContributionsValue;
    }

    totalPersonalInsurance(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.personalInsurance || 0);
        })
        return total;
    }

    totalExpenses(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.totalExpenses || 0);
        })
        return total;
    }

    totalSurplusIncome(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.surplusIncome || 0);
        })
        return total;
        // return this.totalSurplusIncomeValue;
    }

    totalWeeklySurplus(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.weeklySurplus || 0);
        })
        return total;
        // return this.totalWeeklySurplusValue;
    }

    incomeTax(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.incomeTax || 0);
        })
        return total;
        // return this.incomeTaxValue;
    }

    preTaxDeductions(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.salaryPackaging || 0) + (cached.salarySacrifice || 0);
        })
        return total;
        // return this.preTax;
    }

    lifestyle(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.fixedExpenses || 0) + (cached.discretionaryExpenses || 0);
        })
        return total;
        // return this.lifeStyleValue;
    }

    credit(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.deductibleDebt || 0) + (cached.nonDeductibleDebt || 0);
        })
        return total;
        // return this.creditValue;
    }

    investment(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (cached) => {
            total = total + (cached.investmentExpenses || 0) + (cached.investmentContributions || 0);
        })
        return total;
        // return this.investmentValue;
    }

    ///////////////////// SINGLE ID ///////////////////////////////////////////////

    addList(ids: string[], cashFlows: CashFlow[]) {
        if (!ids || ids && ids.length == 0) {
            return;
        }

        ids.forEach(id => {
            let cashFlow = cashFlows && cashFlows.find(item => item.primaryClientId == id);
            this.cashMap.set(id, cashFlow);
        });
    }

    add(id: string, cash: CashFlow) {
        this.cashMap.set(id, cash);
    }

    remove(id: string) {
        this.cashMap.delete(id);
    }

    get(id): CashFlow {
        return this.cashMap ? this.cashMap.get(id) : null;
    }

    clear() {
        this.cashMap.clear()
    }
}