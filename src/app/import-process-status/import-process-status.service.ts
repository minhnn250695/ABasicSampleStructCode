import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EntityImportExecution } from '../file-import/models';

@Injectable()
export class ImportProcessStatusService {

    constructor(private httpClient: HttpClient) {

    }

    /**
     * delete import process record
     */
    deleteImportExecution(executionId: string): Observable<any> {
        if (!executionId || executionId === "") return Observable.of(null);
        let apiUrl = `api/DataFeedsEntityImportExecutions/${executionId}`;
        return this.httpClient.delete(apiUrl, {});
    }

    //#region convert showing format
    /**
     * - Receive a date with a format "YYYY-MM-DD"
     * - Convert the string to format "DD/MM/YYYY"
     * @param date - "YYYY-MM-DD"
     */
    getImportDate(date: string) {
        if (date) {
            let d = date.split("T")[0];
            return d.split("-").reverse().join("/");
        }
    }

    getStatusClass(record: EntityImportExecution) {
        switch (record.showingStatus) {
            case "In progress": return "fa-cog fa-spin medium-gray";
            case "Validation pending": return "fa-cog fa-spin medium-gray";
            case "Completed": return "fa-check-circle green-color";
            case "Failed": return "fa-exclamation-triangle red";
            case "Validation failed": return "fa-exclamation-triangle red";
            case "Attention needed": return "fa-user-edit light-orange";
            case "Importing data": return "fa-cog fa-spin medium-gray";
            default: return "";
        }
    }

    getDataImportStatusTitle(record: EntityImportExecution): string {
        return record.showingStatus;
    }

    summarizeDataMigrationStatus(record: EntityImportExecution): EntityImportExecution {
        // If any status (of newEntityStatus or updateEntityStatus or processDataStatus)
        //is inprogress then status is inprogress 
        if (record.status == "DataProcessInProgress" || record.status == "ImportDataInProgress") {
            record.showingStatus = "In progress";
        }
        else if (record.status == "ImportDataPending") {
            record.showingStatus = "Importing data";
        }
        else if (record.status == "FileValidationPending" || record.status == "FileValidationInProgress") {
            record.showingStatus = "Validation pending";
        }
        else if (record.status == "FileValidationFailed") {
            record.showingStatus = "Validation failed";
        }
        // any status of three progress is error then showing Failed
        else if (record.status == "ImportDataFailed" || record.status == "DataProcessFailed") {
            record.showingStatus = "Failed";

        } else if (record.status == "DataProcessedWithSuccess" || record.status == "FileValidationSuccess") {
            record.showingStatus = "Attention needed";
        }
        else if (record.status == "DataImportedWithSuccess") {
            record.showingStatus = "Completed";
        }
        return record;
    }
}
