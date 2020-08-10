import { OnInit, Component, OnDestroy, Output, EventEmitter, Input, SimpleChange, SimpleChanges } from '@angular/core';
import { EntityImportExecution } from '../../file-import/models';
import { Router } from '@angular/router';
import { ImportProcessStatusService } from '../import-process-status.service';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: "app-data-feed-status",
    templateUrl: "./data-feed-status.component.html",
    styleUrls: ["./data-feed-status.component.css"]
})
export class DataFeedStatusComponent implements OnInit, OnDestroy {
    @Output() loading: EventEmitter<boolean> = new EventEmitter();
    @Output() reloadImportStatus: EventEmitter<boolean> = new EventEmitter();
    @Input() dataFeedList: EntityImportExecution[] = [];
    selectedRecord: EntityImportExecution;
    constructor(private router: Router,
        private importProcessService: ImportProcessStatusService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit() { }

    ngOnDestroy() { }

    selectThisRecord(record: EntityImportExecution) {
        this.selectedRecord = record;
    }

    gotoManualMatch(importFile: EntityImportExecution) {
        let file = JSON.stringify({ id: importFile.id, name: importFile.sourceFileName });
        sessionStorage.setItem('importFile', file);
        sessionStorage.setItem('entityName', importFile.entityTemplateName);
        this.router.navigate(["/file-import/manual-match-data"]);
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
}