
import { PersonalInsuranceSummary } from './personal-insurance-summary.model';

export class TotalPersonalInsuranceSummary {
    private insuranceMap: Map<string, PersonalInsuranceSummary[]> 
    constructor(private keys: string[]) {
        this.insuranceMap = new Map();
    }


    
    getPersonalInsuranceSummarys(wantedIds?: string[]) : PersonalInsuranceSummary[] {
        let keys = wantedIds ? wantedIds : this.keys;

        if (!keys) {
            return [];
        }

        let results: PersonalInsuranceSummary[] = [];
        keys.forEach(id => {
            let item = this.get(id);
            if (item) {
                let newItem = this.sumPersonalSummary(item);
                if (newItem) {
                    newItem.primaryOwnerId = id;
                    results.push(newItem)
                };
            }
        });
        return results;
    }

    private sumPersonalSummary(source: PersonalInsuranceSummary[]): PersonalInsuranceSummary {
        if (!source || source.length == 0) {return null};

        let result = new PersonalInsuranceSummary();
        result.annualInsurancePremium = 0;
        result.benefitPremiums = 0;
        result.businessExpensesTotal = 0;
        result.incomeProtectionTotal = 0;

        result.lifeInsuranceTotal = 0;
        result.paidByBusiness = 0;
        result.paidBySuperannuation = 0;
        result.paidByYou = 0;

        result.policyFee = 0;
        result.totalCost = 0;
        result.totalPremium = 0;
        result.tpdInsuranceTotal = 0;
        result.traumaInsuranceTotal = 0;

        source.forEach(item => {
            if (item.annualInsurancePremium) result.annualInsurancePremium += item.annualInsurancePremium;
            if (item.benefitPremiums) result.benefitPremiums += item.benefitPremiums;
            if (item.businessExpensesTotal) result.businessExpensesTotal += item.businessExpensesTotal;
            if (item.incomeProtectionTotal) result.incomeProtectionTotal += item.incomeProtectionTotal;

            if (item.lifeInsuranceTotal) result.lifeInsuranceTotal += item.lifeInsuranceTotal;
            if (item.paidByBusiness) result.paidByBusiness += item.paidByBusiness;
            if (item.paidBySuperannuation) result.paidBySuperannuation += item.paidBySuperannuation;
            if (item.paidByYou) result.paidByYou += item.paidByYou;

            if (item.policyFee) result.policyFee += item.policyFee;
            if (item.totalCost) result.totalCost += item.totalCost;
            if (item.totalPremium) result.totalPremium += item.totalPremium;
            if (item.tpdInsuranceTotal) result.tpdInsuranceTotal += item.tpdInsuranceTotal;
            if (item.traumaInsuranceTotal) result.traumaInsuranceTotal += item.traumaInsuranceTotal;
        })

        return result;
    }

    ///////////////////// SINGLE ID ///////////////////////////////////////////////

    addList(ids: string[], summaries: PersonalInsuranceSummary[]) {
        if (!ids || ids && ids.length == 0) {
            return;
        }

        ids.forEach(id => {
            let list = summaries && summaries.filter(item => item.primaryClientId == id)
                                            .map(item => {
                                                item.primaryOwnerId = item.primaryClientId;
                                                return item;
                                            });
            this.insuranceMap.set(id, list);
        });
    }

    add(id: string, data: PersonalInsuranceSummary[]) {
        let newData = data;
        if (newData) {
            newData = newData.map(item => {
                item.primaryOwnerId = id;
                return  item;
            })
        }
        this.insuranceMap.set(id, data);
    }

    remove(id: string) {
        this.insuranceMap.delete(id);
    }

    get(id): PersonalInsuranceSummary[] {
        return this.insuranceMap ? this.insuranceMap.get(id) : null;
    }

    clear() {
        this.insuranceMap.clear()
    }
}