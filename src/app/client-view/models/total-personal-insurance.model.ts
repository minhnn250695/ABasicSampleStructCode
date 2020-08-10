
import { PersonalInsuranceOutcomes } from './personal_insurance_outcomes.model';

export class TotalPersonalInsurance {
    private insuranceMap: Map<string, PersonalInsuranceOutcomes>;
    private totalDebtsValue: number;

    constructor() {
        this.insuranceMap = new Map<string, PersonalInsuranceOutcomes>();
    }



    /**
     * ========================================================================================================================
     * 
     * ======================================================================================================================== 
     */
    addList(ids: string[], outcomes: PersonalInsuranceOutcomes[]) {
        if (!ids || ids && ids.length == 0) {
            return;
        }

        ids.forEach(id => {
            let outcome = outcomes && outcomes.find(item => item.contactId == id);
            this.insuranceMap.set(id, outcome);
        });
    }

    add(id: string, insurance: PersonalInsuranceOutcomes) {
        this.insuranceMap.set(id, insurance);
    }

    remove(id: string) {
        this.insuranceMap.delete(id);
    }

    get(id): PersonalInsuranceOutcomes {
        return this.insuranceMap ? this.insuranceMap.get(id): null;
    }

    clear() {
        this.insuranceMap.clear()
    }
}