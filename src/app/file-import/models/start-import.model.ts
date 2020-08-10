import { MatchedRecord } from './matched-record.model';
import { UnMatchedRecord } from './unmatched-record.model';
import { InvalidRecord } from './invalid-record.model';

export class StartImport {
    executionId: string;
    matchedRecords: MatchedRecord[] = [];
    unmatchedRecords: UnMatchedRecord[] = [];
    invalidRecords: InvalidRecord[] = [];
}