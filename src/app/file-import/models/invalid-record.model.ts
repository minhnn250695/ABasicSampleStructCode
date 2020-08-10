export class InvalidRecord {
    recordData: any;
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