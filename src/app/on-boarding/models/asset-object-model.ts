export class AssetObject {
    id: string;
    name: string;
    assetType: number;
    ownershipType: number;
    assetPurpose: number;
    currentBalance: number;
    grossSalary: number;
    incomeDrawn: number;
    incomeFrequency: number;
    employerContribution: boolean = false;
    personalContribution: boolean = false;
    contributionsTax: number = 0;
    regularContributions: number = 0;
    contributionFrequency: number;
}