import { ClientAssetInstitution } from './client-asset-institution.model';
import { ClientAssetService } from './client-asset-service.model';

export class ClientAsset {
    matches: boolean;

    financialAccountId: number;
    financialInstitution: ClientAssetInstitution;
    financialService: ClientAssetService;
    accountStatus: number;
    name: string;
    accountHolder: string;
    currentBalance: number;
    assetType: number;
    accountType: number;
    assetCategory: number;
    balanceOnly: boolean;
    nickname: string;
    financialAccountUse: number;
    houseHoldId: string;
    houseHoldName: string;
    number: string;
    crmId: string;
}