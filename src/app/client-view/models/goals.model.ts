import { IncomeActionModel } from './current-scenario/income-action.model';

export class GoalsModel {
    goalId: string;
    color: string;
    name: string;
    contactId: string;
    description: string;
    category: number;
    subCategory: number;
    goalType: number;
    startYear: number;
    financeFrequency: number;
    sourceAssetId: string;
    sourceDebtId: string;
    amount: number;
    fundedFrom: number;
    endYear: number;
    numberOfYears: number;
    type: number;
    onTrack: number;
    
    // use for income goal
    income: IncomeActionModel = new IncomeActionModel();


}