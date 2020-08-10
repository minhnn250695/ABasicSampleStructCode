import { ClientAsset } from '../client-asset-models/client-asset-info.model';

export class Entity<TInfo> {
    providerName: string;
    entityName: string;
    externalId: any;
    information: TInfo;
    platformData: TInfo;
    classFundData: TInfo;
    member: TInfo;
    inImportProgress: boolean;
    entityData: ClientAsset;
    crmId: string;
    isSelected: boolean;
    overwriteOption: number;
}