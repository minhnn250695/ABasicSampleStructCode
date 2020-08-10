import { HoldingBalance } from './holding-balance.model';
export class AccountData {
    accountID: string;
    accountName: string;
    epiProductCode: string;
    taxStructure: string;
    clientIds: string[];
    holdingBalance: HoldingBalance;
    ownershipType: OwnershipType;
}
enum OwnershipType {
    Individual,
    Joint
}