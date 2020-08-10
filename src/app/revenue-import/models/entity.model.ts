

export class Entity {
    entityId: string
    dateTimeImportedUTC: Date
    date: Date;
    productNumber: string;
    productName: string;
    productId: string;
    clientName: string;
    clientId: string;
    clientAssetId: string;
    clientAssetName: string;
    clientDebtId: string;
    clientDebtName: string;
    contactName: string;
    personalInsuranceId: string;
    personalInsuranceName: string;
    adviserPercentage: number;
    grossRevenue: number;
    grossTax: number;
    adviserRevenue: number;
    adviserTax: number;
    productProvider: string;
    productProviderId: string;
    revenueType: string;
    revenueTypeId: string;
    revenueCategory: string;
    revenueCategoryId: string;
    opportunity: string;
    opportunityId: string;
    owner: string;
    isMatched: boolean;
    partitionKey: string;
    rowKey: string;
    timestamp: Date;
    eTag: string;
}