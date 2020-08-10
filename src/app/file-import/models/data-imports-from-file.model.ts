import { UnmappedFields } from './unmappedFields.model';
export class DataImportFromFile {
    entityImportExecutionId: string;
    isValid: boolean;
    unmappedFields: UnmappedFields[];
    unmappedColumns: string[];
    autoMappedFields: UnmappedFields[];
    autoMappedColumns: any;
    manualMappedFields: any;
    manualMappedColumns: any;
    sourceColumns: string[];
    entityFields: any;
}