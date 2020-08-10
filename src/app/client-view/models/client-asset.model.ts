
export class ClientAsset {
    id: string;
    name: string;
    currentBalance: number;
    assetType: string;
    assetPurpose: string;
    ownershipType: string;
    owner: string;
    investmentStyle: string;
    estimatedNetReturns: number;
    annualContributions: number;
    annualNetContributions: number;
    annualWithdrawals: number;
    outOfPocketEpenses: number;
    annualIncome: number;
    primaryClientId: string;
    // new api
    primaryClientFirstName: string;
    primaryClientLastName: string;
    contributionsTax: number;
    regularContributions: number;
    dataFeedsConnected: boolean;
    annualTaxedPersonalConts: number;
    annualUntaxedPersonalConts: number;
    employerContribution: boolean;
    personalContribution: boolean = false;
    contributionFrequency: number;
    incomeDrawn: number;
    incomeFrequency: number;
    // Asset Projections Details
    accountBalance: number;
    transfer: number;
    netContributions: number;
}

// Balance
// Annual Employer Contributions
// Annual Taxed Personal Contributions
// Annual Untaxed Personal Contributions
// Annual Income Drawn
// Contributions Tax
// Tax on Returns
// Platform Fees
// Investment Fees
// Adviser Fees
// Out of Pocket Expenses
// Personal Insurance Costs
// Net Annual Contributions
