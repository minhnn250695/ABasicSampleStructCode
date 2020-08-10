import { BaseComponentComponent } from "../../common/components/base-component";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { FileImportService } from '../file-import.service';
import { UnMatchedRecord, MatchedRecord } from '../models';
import { Observable } from 'rxjs';
import { ISubscription } from "rxjs/Subscription";
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: "app-manual-match-data",
    templateUrl: "./manual-match-data.component.html",
    styleUrls: ["./manual-match-data.component.css"]
})

export class ManualMatchDataComponent extends BaseComponentComponent implements OnInit, OnDestroy {

    //#region Properties
    private pageSize: number;
    matchedLength: number = 0;
    unmatchedLength: number = 0;
    newRecordLength: number = 0;
    invalidLength: number = 0

    unmatchedRecords: UnMatchedRecord[] = [];
    matchedRecords: MatchedRecord[] = [];
    newRecords: UnMatchedRecord[] = [];
    invalidRecords: UnMatchedRecord[] = [];

    unmatchedRecordsAll: UnMatchedRecord[] = [];
    matchedRecordsAll: MatchedRecord[] = [];
    newRecordsAll: UnMatchedRecord[] = [];
    invalidRecordsAll: UnMatchedRecord[] = [];
    initDone: boolean = false;

    private loadPageSubscription: ISubscription;
    private reloadResourceSubscription: ISubscription;
    private iSub: ISubscription;
    executionId: string;
    fileName: string;
    entityName: string;
    //#endregion

    //#region Contructors
    constructor(
        private fileImportService: FileImportService,
        private confirmationDialogService: ConfirmationDialogService,
        private router: Router) {
        super();

        this.pageSize = this.fileImportService.pageSize;

        // reload request
        this.reloadResourceSubscription = this.fileImportService.handleReloadDataRequest().subscribe(response => {

            switch (response) {
                case 1: {//reload matched
                    this.matchedRecords = [];
                    this.getDataImportSources(true, false, false, false, 0, this.pageSize); break;
                }
                case 2: {//reload new records
                    this.newRecords = [];
                    this.getDataImportSources(false, false, true, false, 0, this.pageSize); break;
                }
                case 3: {//reload matched and unmatched records
                    this.matchedRecords = [];
                    this.unmatchedRecords = [];
                    this.getDataImportSources(true, true, false, false, 0, this.pageSize); break;
                }
                case 4: {//reload new and unmatched records
                    this.newRecords = [];
                    this.unmatchedRecords = [];
                    this.getDataImportSources(false, true, true, false, 0, this.pageSize); break;
                }

            }
        });

        // load page request
        this.loadPageSubscription = this.fileImportService.handleLoadPageRequest().subscribe(response => {
            switch (response.matchType) {
                case 1: {//reload matched 
                    this.getDataImportSources(true, false, false, false, response.pageIndex, this.pageSize); break;
                }
                case 2: {//reload new records
                    this.getDataImportSources(false, false, true, false, response.pageIndex, this.pageSize); break;
                }
                case 3: {//reload unmatched records
                    this.getDataImportSources(false, true, false, false, response.pageIndex, this.pageSize); break;
                }
                case 4: {//reload invalid records
                    this.getDataImportSources(false, false, false, true, response.pageIndex, this.pageSize); break;
                }

            }
        });

        // show error message request
        this.fileImportService.handleShowErrorDialog().subscribe(message => {
            this.confirmationDialogService.showModal({
                title: "Warning",
                message: message,
                btnOkText: "OK"
            });
        });
    }

    ngOnInit() {
        this.showLoading(true);
        // set executionId and entityName
        this.fileImportService.entityName = sessionStorage.getItem('entityName');
        this.entityName = this.fileImportService.entityName;
        // this.executionId = sessionStorage.getItem('executionId');
        let file = JSON.parse(sessionStorage.getItem('importFile'));
        if (file && file.id && file.name) {
            this.executionId = file.id;
            this.fileName = file.name;
        } else {
            /* FE error */
            let subcription: ISubscription = this.confirmationDialogService.showModal({
                title: "Error",
                message: "No execution-id or file name in session storage.",
                btnOkText: "Close"
            }).subscribe(() => subcription.unsubscribe());
        }
        this.getDataImportSources(true, true, true, true, 0, this.pageSize);
    }

    ngOnDestroy() {
        this.loadPageSubscription.unsubscribe();
        this.reloadResourceSubscription.unsubscribe();
    }
    //#endregion

    //#region Actions
    handleLoading(event) {
        this.showLoading(event);
    }

    getDataImportSources(isMatched: boolean, isUnmatched: boolean, isNewRecord: boolean, isInvalid: boolean, pageIndex: number, pageSize: number) {
        // call api get matched record and update value matchedRecords
        if (!this.executionId) {
            this.showLoading(false); return;
        }

        let getDataResources: Observable<any>[] = [];
        let index = 0;
        // get matched list
        if (isMatched)
            getDataResources.push(this.fileImportService.getMatchedRecords(this.executionId, pageIndex, pageSize));

        // get unmatched list
        if (isUnmatched)
            getDataResources.push(this.fileImportService.getUnmatchedRecords(this.executionId, pageIndex, pageSize));

        // get new record list
        if (isNewRecord)
            getDataResources.push(this.fileImportService.getnewRecords(this.executionId, pageIndex, pageSize));

        // get new record list
        if (isInvalid)
            getDataResources.push(this.fileImportService.getInvalidRecords(this.executionId, pageIndex, pageSize));

        // get template following entityName
        getDataResources.push(this.fileImportService.getImportEntityTemplate(this.entityName));
        // if (!this.fileImportService.importTemplate) {
        // }

        this.fileImportService.getCrmResources();

        // if (!this.fileImportService.crmResource || this.fileImportService.crmResource.length == 0) {
        // }

        this.iSub = Observable.zip.apply(null, getDataResources).subscribe((res: any[]) => {
            if (this.iSub) {
                this.iSub.unsubscribe();
              }
            // matched
            if (res[index] && isMatched) {
                this.matchedRecords = this.matchedRecords.concat(res[index].items);
                this.matchedLength = res[index].totalCount;
                index++;
            }
            //unmatched
            if (res[index] && isUnmatched) {
                this.unmatchedRecords = this.unmatchedRecords.concat(res[index].items);
                this.unmatchedLength = res[index].totalCount;
                this.fileImportService.getUnmatchedRecords(this.executionId, 0, this.unmatchedLength).subscribe(res => {
                    this.unmatchedRecordsAll = res.items;
                });
                // this.getRelationshipErrorResource(res[index]);
                index++;
            }
            // new record
            if (res[index] && isNewRecord) {
                this.newRecords = this.newRecords.concat(res[index].items);
                this.newRecordLength = res[index].totalCount;
                index++;
            }
            // invalid record
            if (res[index] && isInvalid) {
                this.invalidRecords = this.invalidRecords.concat(res[index].items);
                this.invalidLength = res[index].totalCount;
                index++;
            }
            this.showLoading(false);
        }, err => {
            this.showLoading(false);
            /* BE doesn't handle error */
            this.confirmationDialogService.showModal({
                title: "Warning",
                message: err.message + ". Please try again.",
                btnOkText: "Back to upload"
            }).subscribe(() => {
                this.router.navigate(["/file-import/upload"])
            })
        });
    }
    //#endregion
}