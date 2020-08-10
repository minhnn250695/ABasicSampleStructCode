import { ClientDebt } from './client-debt.model';
import { DebtType } from './debt-type.enum';
import { FinanceUtil } from '../../common/utils';

export class TotalClientDebts {
    private debtsMap: Map<string, ClientDebt[]>;
    private financeUtil: FinanceUtil = new FinanceUtil();

    constructor() {
        this.debtsMap = new Map<string, ClientDebt[]>();
    }

    getAllClientDebts(ids?: string[]): ClientDebt[] {
        if (!this.debtsMap) return [];

        let keys: string[] = ids || Array.from(this.debtsMap.keys());
        let result: ClientDebt[] = [];

        keys.forEach(key => {
            let debts = this.get(key);
            if (debts) {
                result = result.concat(debts);
            }
        })

        return result;
    }
    /**
    * get total debts 
    */
    getTotalDebts(ids?: string[]): number {
        let total = 0;
        this.forEachData(ids, cached => {
            total = total + (cached.currentBalance || 0) - (cached.offsetAccountBalance || 0);
        });
        return total;
        // return this.totalDebtsValue || 0;
    }

    getTotalDeductiveDebts(ids?: string[]): number {
        let total = 0;
        this.forEachData(ids, cached => {
            if (cached.debtType == DebtType.Deductible) {
                total = total + (cached.currentBalance || 0) - (cached.offsetAccountBalance || 0);
            }
        });
        return total;
        // return this.totalDeductibleDebts || 0;
    }

    getTotalNonDeductiveDebts(ids?: string[]): number {
        let total = 0;
        this.forEachData(ids, cached => {
            if (cached.debtType == DebtType.Non_Deductible) {
                total = total + (cached.currentBalance || 0) - (cached.offsetAccountBalance || 0);
            }
        });
        return total;
        // return this.totalNonDeductibleDebts || 0;
    }

    getTotalGrossDebts(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, cached => {
            total = total + (cached.currentBalance || 0)
        });

        return total;
        // return this.totalGrossDebts || 0;
    }

    getTotalAnnualPayment(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, cached => {
            total = total + (cached.annualPayment || 0)
        })
        return total;
        // return this.totalAnnualPayment || 0;
    }

    getAverageInterestRate(ids?: string[]) {
        let totalGrossDebts = this.getTotalGrossDebts();
        let totalBalanceRate = 0;
        this.forEachData(ids, cached => {
            // if (cached.debtType == DebtType.Non_Deductible) {
            //     totalBalanceRate = totalBalanceRate + (cached.annualInterestRate * cached.currentBalance / 100 || 0);
            // }
            totalBalanceRate = totalBalanceRate + (cached.annualInterestRate * cached.currentBalance / 100 || 0);

        });

        return totalGrossDebts == 0 ? 0 : (totalBalanceRate / totalGrossDebts) * 100;
    }

    getYearToPay() {
        let rate = (this.getAverageInterestRate() / 12) / 100;
        let payment = this.getTotalAnnualPayment() / 12;
        let currentDebt = this.getTotalDebts();
        let result = this.financeUtil.NPER(rate, payment * (-1), currentDebt, 0);
        return result || 0
    }

    getNewYearsToPay(additionalPayment: number = 0) {
        let rate = (this.getAverageInterestRate() / 12) / 100;
        let payment = this.getTotalAnnualPayment() / 12 + additionalPayment;
        let currentDebt = this.getTotalDebts();
        return this.financeUtil.NPER(rate, payment * (-1), currentDebt, 0) || 0
    }
    /**
     * get number of paid years
     */
    getPaidYearNum() {
        return this.getYearToPay();
    }

    getDebtList(wantedKeys: string[]): ClientDebt[] {
        let keys = wantedKeys || Array.from(this.debtsMap.keys());
        if (!keys) { return []; };

        let results: ClientDebt[] = []
        keys.forEach(key => {
            let debts = this.get(key);
            if (debts) {
                results = results.concat(debts);
            }
        })

        return results;
    }

    // fNPER(rate, payment, present, future, type?) {
    //     // Initialize type
    //     let newType = type || 0;

    //     // Initialize future value
    //     let newFuture = future || 0;

    //     // Evaluate rate and periods (TODO: replace with secure expression evaluator)
    //     rate = eval(rate);

    //     // Return number of periods
    //     let num = payment * (1 + rate * newType) - newFuture * rate;
    //     let den = (present * rate + payment * (1 + rate * newType));
    //     if (den == 0) den = 1
    //     return Math.log(num / den ) / Math.log(1 + rate);
    // }

    /**
     * 
     * @param ids 
     * @param callback 
     */
    private forEachData(ids: string[], callback: (cached: ClientDebt) => void) {
        let newIds = ids || Array.from(this.debtsMap.keys());
        if (!newIds || newIds && newIds.length == 0) {
            return 0;

        }

        let debts = this.getAllClientDebts(newIds);
        debts.forEach(debt => {
            if (debt) callback(debt);
        });
    }

    /**
     * ========================================================================================================================
     * 
     * ======================================================================================================================== 
     */
    addList(ids: string[], debts: ClientDebt[]) {
        if (!ids || ids && ids.length == 0) {
            return;
        }

        ids.forEach(id => {
            let debtsOfId = debts && debts.filter(item => item.primaryClientId == id)
                .map(item => {
                    return item;
                });
            this.debtsMap.set(id, debtsOfId);
        });

    }   

    remove(id: string) {
        this.debtsMap.delete(id);
    }

    get(id): ClientDebt[] {
        return this.debtsMap ? this.debtsMap.get(id) : null;
    }

    clear() {
        this.debtsMap.clear()
    }
}