import { AccountData } from './account-data.model';
import { ClientData } from './client-data.model';
import { HoldingBalance } from './holding-balance.model';
import { AccountCrm } from './account-crm.model';

export class PlatFormData {
    accountCRM: AccountCrm;
    accountCRMID: string;
    accountData: AccountData;
    adviserCRMID: string;
    adviserName: string;
    clientData: ClientData[];
    contactCRMID: string;
    contactCRMFullName: string;
    eTag: string;
    fundCode: string;
    fundName: string;
    fundStatus: string;
    investmentHoldingData: HoldingBalance;
    isMatched: boolean;
    isSharedEntity: boolean;
    partitionKey: string;
    providerName: string;
    rowKey: string;
    timestamp: string;
}