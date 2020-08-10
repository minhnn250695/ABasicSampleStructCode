import { GoalsModel } from '../goals.model';
import { CashFlowDetails } from './cash-flow-details.model';
import { ActionModel } from './action.model';
import { RetirementProjectionModel } from '..';


export class ScenarioDetailsModel {

    scenarioId: string;
    scenarioName: string;
    retirementYear: number;
    lifeExpectancy: number;
    numberOfYears: number;
    familyMembers: {
        contactId: string;
        firstName: string;
        retirementAge: number;
        profileImageUrl: string;
    }[] = [];
    cashFlow: ScenarioCashFlow = new ScenarioCashFlow();
    personalProtection: ScenarioPersonalProtection[] = [];
    goals: GoalsModel[] = [];
    assets: ScenarioAsset = new ScenarioAsset();
    debt: ScenarioDebt = new ScenarioDebt();
    assetProjections: ScenarioAssetProjection = new ScenarioAssetProjection();
    debtProjections: ScenarioDebtProjection = new ScenarioDebtProjection();
    actions: ActionModel[] = [];
    retirementProjections: RetirementProjectionModel = new RetirementProjectionModel();
    scenarioType: number;
    debtScenario: {
        wishedYearsToPay: number
    }
    strategyDuration: number;
    constructor() {
    }
}

export class ScenarioCashFlow {
    netIncome: number;
    grossIncome: number;
    preTaxDeductions: number;
    taxPaid: number;
    totalExpenses: number;
    lifestyle: number;
    credit: number;
    investment: number;
    insurance: number;
    surplusIncome: number;
    details: CashFlowDetails[] = [];
    onTrack: number;
}

export class ScenarioAsset {
    totalAssets: number;
    investments: number;
    lifestyle: number;
    netContributions: number;
    onTrack: number;
}

export class ScenarioDebt {
    totalDebt: number;
    totalPayment: number;
    deductibleDebt: number;
    nonDeductibleDebt: number;
    wishedYearsToPay: number;
    yearsToPay: number;
    onTrack: number;
}

export class ScenarioAssetProjection {
    currentInvestments: number;
    parameters: {
        yearsToInvest: number;
        amountInvested: number;
        investmentReturns: number;
    };
    currentProjectedWealth: number;
    currentProjectedWealthPlusMonthlyContribution: number;
    currentProjectedWealthEquivalent: number;
    currentProjectedWealthEquivalentPlusMonthlyContribution: number;
    projectionYear: number;
}

export class ScenarioDebtProjection {
    currentGrossDebt: number;
    currentNetDebt: number;
    annualPayments: number;
    averageInterestRate: number;
    yearsToPay: number;
    desiredYearsToPay: number;
    wishedYearsToPay: number;
    newYearsToPay: number;
    parameters: {
        additionalMonthlyPayment: number;
    }
}

export class ScenarioPersonalProtection {
    contacts: PersonalProtectionContact[] = [];
    onTrack: number;
}

export class PersonalProtectionContact {
    fullName: string;
    age: number;
    lifeInsurance: number;
    gender: number;
    permanentDisability: number;
    traumaInsurance: number;
    temporaryDisability: number;
    onTrack: number;
    profileImageUrl: string;

}