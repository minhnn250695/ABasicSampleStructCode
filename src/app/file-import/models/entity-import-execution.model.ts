export class EntityImportExecution {
    createdDate: string;
    entityTemplateName: string;
    id: string;
    importNewEntitesStatus: EntityStatus;
    importUpdatedEntitiesStatus: EntityStatus;
    processDataStatus: EntityStatus;
    sourceFileName: string;
    status: string;
    showingStatus: string;
    processType: string;
}

class EntityStatus {
    progress: number;
    status: string;
}