import { Contact } from './contact.model';

export class TotalClientRetirement {
    clientHouseHolds: Contact[] = null;
    private currentIncome: number;
    private retirementIncome: number;

    constructor(private keys: string[] = []) {

    }

    calculate() {
        this.clearData();
        if (!this.clientHouseHolds) { return; }

        this.clientHouseHolds.forEach(item => {
            if (!item) { return; }
            // current income
            if (item.currentIncome) this.currentIncome += item.currentIncome;
            if (item.retirementIncome) this.retirementIncome += item.retirementIncome;

        });
    }

    getCurrentIncome() { return this.currentIncome; }
    getRetirementIncome() { return this.retirementIncome; }
    getIncomePercentage() {
        let retirementIncome = this.getRetirementIncome();
        if (retirementIncome == 0 ) { return 0;}

        let percent = (this.getCurrentIncome()/retirementIncome) * 100;
        if (percent < 0) {return 0;}
        return percent > 100 ? 100 : percent;
    }

    /**
     * 
     */
    private clearData() {
        this.currentIncome = 0;
        this.retirementIncome = 0;
    }
}