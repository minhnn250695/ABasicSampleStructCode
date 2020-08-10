import { ImportRecord } from './import-record.model'

export class UpdateClientAsset {
    ProviderName: string;
    EntityName: string;
    ExternalId: string;
    CrmId: string;
    OverwriteOption: number;
    Information: any;
    PlatFormData: any;
    LocalId: string;
    EntityData: ImportRecord;
}