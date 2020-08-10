import { NumberValueAccessor } from '@angular/forms/src/directives';

export class AssetActionModel {
    actionId: string;
    actionTitle: string;
    sourceOfFunds: number;
    sourceId: string;
    receiveContributions: boolean = false;
    makeContributions: boolean = false;
    assetId: string;
    assetName: string;
    assetType: number;
    ownershipType: number;
    accountBalance: number;
    contributionFrequency: number;
    contributionAmount: number;
    investmentStyle: number;
    netReturns: number;
    primaryClientId: string;

    details: string;
    reason: string;
    result: string;
    
    contributionType: number;
    startYear: number;
    
}