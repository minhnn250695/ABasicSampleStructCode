import { OnInit, Component, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { EntityImportExecution } from '../../file-import/models';
import { Router } from '@angular/router';
import { ImportProcessStatusService } from '../import-process-status.service';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: "app-data-migration-status",
    templateUrl: "./data-migration-status.component.html",
    styleUrls: ["./data-migration-status.component.css"]
})
export class DataMigrationStatusComponent implements OnInit, OnDestroy {
    @Output() loading: EventEmitter<boolean> = new EventEmitter();
    @Output() reloadImportStatus: EventEmitter<boolean> = new EventEmitter();
    @Input() dataMigrationList: EntityImportExecution[];

    selectedRecord: EntityImportExecution;
    constructor(private router: Router,
        private importProcessService: ImportProcessStatusService,
        private confirmationDialogService: ConfirmationDialogService) {
    }

    ngOnInit() { }

    ngOnDestroy() { }

   
    getTemplateName(templateId: string): string {
        if (templateId == "finpal_households")
            return "Household";
        if (templateId == "contacts")
            return "Contact";
        if (templateId == "accounts")
            return "Companies";
        if (templateId == "finpal_clientassets")
            return "Client assets";
        if (templateId == "finpal_clientdebts")
            return "Client debts";
        if (templateId == "finpal_personalinsurances")
            return "Insurance policies";
        if (templateId == "finpal_insurancebenefits")
            return "Insurance benefits";
        return "";
    }

    selectThisRecord(record: EntityImportExecution) {
        this.selectedRecord = record;
    }

    /** there are 7 general status, now Aug 21st 2019:
     * In progress, Importing data, Validation pending, 
     * Validation failed, Failed, Attention needed, Completed
    */
    getSelectedRecordTitle() {
        if (this.selectedRecord) {
            let generalStatus = this.importProcessService.summarizeDataMigrationStatus(this.selectedRecord).showingStatus.toLowerCase();
            return generalStatus;
        }
    }

    getSelectedRecordStatus(){
        return "This record is " + this.getSelectedRecordTitle();
    }

    gotoManualMatch() {
        if (!this.selectedRecord) return;
        // id === executionID
        let file = JSON.stringify({ id: this.selectedRecord.id, name: this.selectedRecord.sourceFileName });
        sessionStorage.setItem('importFile', file);
        sessionStorage.setItem('executionId', this.selectedRecord.id);
        sessionStorage.setItem("importStatus", this.selectedRecord.status);
        if (this.selectedRecord.showingStatus != "Validation pending" && this.selectedRecord.showingStatus != "Validation failed") {
            sessionStorage.setItem('entityName', this.selectedRecord.entityTemplateName);
            this.router.navigate(["/file-import/manual-match-data"]); // for data migration
        } else if (this.selectedRecord.showingStatus == "Validation failed") {
            sessionStorage.setItem('entityName', "validation_failed");
            this.router.navigate(['/file-import/match-fields-name']);
        }
        else {
            sessionStorage.setItem('entityName', 'xplan_contacts');
            this.router.navigate(['/file-import/match-fields-name']);
        }
    }

    deleteSelectedRecord() {
        if (!this.selectedRecord) return;
        this.loading.emit(true);
        this.importProcessService.deleteImportExecution(this.selectedRecord.id).subscribe(res => {
            this.loading.emit(false);
            if (res && res.success) {
                // reload page - update data migrations list
                this.reloadImportStatus.emit(true);
            } else {
                let errorCode = res && res.error && res.error.errorCode || 5000;
                let errorMessage = res && res.error && res.error.errorMessage || "Unknown";
                // show modal error popup
                let iSub: ISubscription = this.confirmationDialogService.showModal({
                    title: "Error #" + errorCode,
                    message: "" + errorMessage.substring(0, 200),
                    btnOkText: "Ok"
                }).subscribe(() => {
                    iSub.unsubscribe()
                });
            }
        });
    }

    checkDisabledViewDetail(record: any) {
        let status = record.showingStatus;
        if (status == "In progress" || status == "Validation pending" || status == "Failed" || status == "Validation failed" || status == "Importing data") {
            return true;
        }
        else return false;
    }

    //#endregion convert showing format
}