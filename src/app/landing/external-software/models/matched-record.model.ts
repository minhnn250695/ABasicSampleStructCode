import { CRMData } from './crm-data.model';

export class MatchedRecord {
    sourceData: any;
    crmData: CRMData;
    canNotSetNew: boolean;
    isSelected: boolean;
    entityKey: string;
}