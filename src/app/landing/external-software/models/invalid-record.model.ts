export class InvalidRecord {
    recordData: any;
    canNotSetNew: boolean;
    isSelected: boolean;
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