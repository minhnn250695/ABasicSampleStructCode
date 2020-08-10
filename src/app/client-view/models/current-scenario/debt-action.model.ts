
export class DebtActionModel {
    actionId: string;
    actionTitle: string;
    sourceOfFunds: number;
    willThereBeOffsetAccount: boolean = false;
    sourceId: string;
    debtId: string;
    name: string;
    debtType: number;
    debtCategory: number;
    ownershipType: number;
    annualInterestRate: number;
    balance: number;
    offset: number;
    repayment: number;
    repaymentFrequency: number;
    startYear: number;
    primaryClientId: string;
    details: string;
    reason: string;
    result: string;
}