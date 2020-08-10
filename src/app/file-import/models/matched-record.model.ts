import { CRMData } from './crm-data.model';

export class MatchedRecord {
    sourceData: any;
    crmData: CRMData;
    isSelected: boolean;
    canNotSetNew: boolean;
    entityKey: string;
    errors: {
        data: {
            RelatedEntity: string;
        };
        error: {
            errorCode: number;
            errorMessage: string;
        }
        propertyName: string;
    }[];
}