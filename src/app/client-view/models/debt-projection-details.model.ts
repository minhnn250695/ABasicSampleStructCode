export class DebtProjectionDetails {
    debtName: string;
    debtPeriods: {
        year: number;
        loanBalance: number,
        offsetAccount: number,
        annualPayment: number,
        netInterest: number,
        transfer: number,
    }[] = [];
}