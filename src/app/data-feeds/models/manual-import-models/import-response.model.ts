
import { ImportRecord } from './import-record.model';

export class ImportResponse {
    batchId: string;
    matchedRecords: ImportRecord[];
    unmatchedRecords: ImportRecord[];
}