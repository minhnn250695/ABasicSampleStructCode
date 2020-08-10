export class UnMatchedRecord {
    executionId: string;
    entityKey: string;
    entityType: string;
    matchedEntityId: string;
    entityData: any;
    entityDataJson: any;
    imported: boolean;
    isValid: boolean;
    isSelected: boolean;
    canNotSetNew: boolean;
    isNew: boolean = false;
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
