

import { InsuranceBenefit } from './insurance-benefit.model';

export class InsuranceInfo {
    annualInsurancePremium: number;
    benefitPremiums: number;
    benefitType: number; //100000000
    benefits: InsuranceBenefit[]; // dont know yet
    businessExpensesTotal: number;
    id: string;
    incomeProtectionTotal: number;
    lifeInsuranceTotal: number;
    lifeInsuranceCompany: string;
    name: string;
    number: string;
    ownershipType: number; //100000000
    paidByBusiness: number;
    paidBySuperannuation: number;
    paidByYou: number;
    policyFee: number;
    policyType: number; //1
    totalCost: number;
    totalPremium: number;
    tpdInsuranceTotal: number;
    traumaInsuranceTotal: number;
    productProviderName: string;
    dataFeedsConnected: boolean;
    primaryClientId: string;
    quickNotes: string;
    premiumFrequency: number;
    // primary
    primaryOwnerId: string;

    policyStatus: number;
    productProviderId: string;
}