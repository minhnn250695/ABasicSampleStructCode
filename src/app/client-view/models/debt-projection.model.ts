
export class DebtProjection {
    annualPayments: number;
    averageInterestRate: number;
    currentGrossDebt: number;
    currentNetDebt: number;
    parameters: {
        additionalMonthlyPayment: number;
    }
    yearsToPay: number;
    wishedYearsToPay: number;
    desiredYearsToPay: number;
    newYearsToPay: number;    
}
