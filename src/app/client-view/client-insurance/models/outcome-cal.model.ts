


export class OutcomeCalculation {

    constructor() {
        this.debtsPaidOff = 0;
        this.income = 0;
        this.years = 0;
        this.emergencySpending =0;
        this.isThumpsUp = true;

        this.months = 0;
        this.superannuationPayments = 0;
        this.incomePercent = 0;
    }

    forWho: string;
    debtsPaidOff: number; // in percentage
    income: number;
    years: number;
    emergencySpending: number;
    isThumpsUp: boolean;
    months: number;
    superannuationPayments: number;
    incomePercent: number;
}