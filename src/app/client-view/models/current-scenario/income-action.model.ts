export class IncomeActionModel {
    contactId: string;
    grossIncome: number;
    incomeFrequency: number
    incomeId: string;
    incomeType: number;
    incomeName: string;
    startYear: number;
    endYear: number;
    financeFrequency: number;
    // using for create income goal
    taxPaid: number;
    preTaxSpending: number;
}