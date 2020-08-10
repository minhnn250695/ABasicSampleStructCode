

export class PersonalInsuranceSummary {
    annualInsurancePremium: number;
    benefitPremiums: number;
    benefitType: number; // 100000000
    benefits: any[]; // dont know yet
    businessExpensesTotal: number;
    id: string;
    incomeProtectionTotal: number;
    lifeInsuranceTotal: number;
    name: string;
    number: string;
    ownershipType: number; // 100000000
    paidByBusiness: number;
    paidBySuperannuation: number;
    paidByYou: number;
    policyFee: number;
    policyType: number; // 1
    totalCost: number;
    totalPremium: number;
    tpdInsuranceTotal: number;
    traumaInsuranceTotal: number;

    primaryClientId: string;

    // primary
    primaryOwnerId: string;
}