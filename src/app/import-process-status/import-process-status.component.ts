import { Router } from "@angular/router";
import { MatDialog } from "@angular/material";
import { BaseComponentComponent } from "../common/components/base-component";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ConfirmationDialogService } from '../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { EntityImportExecution } from '../file-import/models/entity-import-execution.model';
import { FileImportService } from '../file-import/file-import.service';
import { BrowserPlatformLocation } from '@angular/platform-browser/src/browser/location/browser_platform_location';
import { ImportProcessStatusService } from './import-process-status.service';

@Component({
    selector: "app-import-process-status",
    templateUrl: "./import-process-status.component.html",
    styleUrls: ["./import-process-status.component.css"]
})
export class ImportProcessStatusComponent extends BaseComponentComponent implements OnInit, OnDestroy {
    constructor(private router: Router,
        private mdDialog: MatDialog,
        private confirmationDialogService: ConfirmationDialogService,
        private importProcessService: ImportProcessStatusService,
        private fileImportService: FileImportService) {
        super();
    }
    private importExecutionResponse: EntityImportExecution[] = [];
    private dataFeedList: EntityImportExecution[] = []; // contain all data feed record
    private dataMigrationList: EntityImportExecution[] = []; // contain all data migration record

    ngOnInit() {
        this.handleReloadImportStatus(true);
    }

    ngOnDestroy() { }

    preventOpenNewTab(e, url) {
        var evt = (e == null ? event : e);
        var clickType = 'LEFT';
        var sTestEventType = 'mousedown';
        if (evt.type != sTestEventType) return true;
        if (evt.which) {
            if (evt.which == 3) clickType = 'RIGHT';
            if (evt.which == 2) clickType = 'MIDDLE';
        }
        else if (evt.button) {
            if (evt.button == 2) clickType = 'RIGHT';
            if (evt.button == 4) clickType = 'MIDDLE';
        }
        if (clickType == 'LEFT') {
            e.target.href = url;
            e.target.click();
            e.target.removeAttribute("href");
        }

        return true;
    }

    handleReloadImportStatus(event: boolean){
        if(event){
            this.showLoading(true);
            this.fileImportService.getDataFeedsEntityExecution('').subscribe(res => {
                this.importExecutionResponse = [...res];
                this.dataFeedList = [...this.importExecutionResponse].filter(r => r.processType === "datafeed");
                this.dataFeedList = this.dataFeedList.map(record => {
                    return this.importProcessService.summarizeDataMigrationStatus(record);
                });

                this.dataMigrationList = [...this.importExecutionResponse].filter(r => r.processType === "datamigration");
                this.dataMigrationList = this.dataMigrationList.map(record => {
                    return this.importProcessService.summarizeDataMigrationStatus(record);
                });
                this.showLoading(false);
            });
        }
    }

    handleShowLoading(event: boolean) {
        if (event) {
            this.showLoading(true)
        } else this.showLoading(false);
    }

    
}