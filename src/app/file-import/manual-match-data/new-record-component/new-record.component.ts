import { BaseComponentComponent } from "../../../common/components/base-component";
import { OnInit, OnDestroy, Input, Output, SimpleChanges } from "@angular/core";
import { FileImportService } from '../../file-import.service';
import { UnMatchedRecord } from '../../models';
import { EventEmitter } from '@angular/core';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
declare var $: any;

export class NewRecordComponent extends BaseComponentComponent implements OnInit, OnDestroy {
    //#region Properties
    @Input("newRecordList") newRecordList: UnMatchedRecord[] = [];
    @Input("newRecordLength") newRecordLength: number = 0;
    @Output() loading: EventEmitter<boolean> = new EventEmitter();

    executionId: string = "";
    displayNames: string[] = [];
    targetNames: string[] = [];

    // using for Infinite scroll
    pageIndex: number = 0;
    lastIndex: number = 0;
    scrollDistance = 2;
    scrollUpDistance = 2;
    scrollThrottle = 100;

    entityKeys: string[] = [];
    isSelectAll: boolean = false;
    canSetAsNew: boolean = false;
    isImporting: boolean = false;
    //#endregion

    //#region Contructors
    constructor(
        protected fileImportService: FileImportService,
        protected confirmationService: ConfirmationDialogService,
        protected router: Router
    ) {
        super();
    }

    ngOnInit() {
        this.executionId = JSON.parse(sessionStorage.getItem("importFile")).id;
        this.isImporting = sessionStorage.getItem("importStatus") == "ImportDataPending" ? true : false;
    }

    ngOnDestroy() {
        /**purpose remove css prevent user click on screen */
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        $('body').removeAttr("style");
    }

    /**catch event every time one of the component input properties changes */
    ngOnChanges(changes: SimpleChanges) {
        this.pageIndex = this.fileImportService.getPageIndex(this.newRecordList);
        if (this.isSelectAll && (this.lastIndex < this.pageIndex)) {
            this.isSelectAll = false;
            this.onRecordSelectAll();
        }
    }

    //#endregion

    //#region Actions
    /**
    * scroll down then show more records
    */
    onScrollDown() {
        // get more record to show in table    
        let loadedRecordsCount = this.fileImportService.pageSize * (this.pageIndex + 1);
        if (loadedRecordsCount < this.newRecordLength) {
            this.pageIndex++;
            this.fileImportService.loadNewRecordsPage(this.pageIndex);
        }
    }

    confirmImportToCRM() {
        // show modal for user cho continue import or cancel
        $("#new-import-confirm").modal("show");
    }

    // import new records to CRM
    importToCRM() {
        // this.loading.emit(true);
        this.fileImportService.createNewEntitiesInCRM(this.executionId).subscribe(res => {
            // this.loading.emit(false);
            if (!res.success) {
                // this.fileImportService.reloadNewRecords();            
                let message = res.error ? res.error.errorMessage : res.errorMessage;
                this.fileImportService.showErrorDialog(message);
            }
        }, error => {
            console.log(error);
            this.fileImportService.showErrorDialog(error.message);
            // this.loading.emit(false);
        });

        let iSub: ISubscription = this.confirmationService.showModal({
            title: "Notice",
            message: "Importing of records has begun. You can view the status via Import Status menu.",
            btnOkText: "OK"
        }).subscribe(() => {
            this.router.navigate(["/"]);
            iSub.unsubscribe();
        });
    }

    onRecordSelectAll() {
        this.entityKeys = []; // reset keys
        // flag
        this.isSelectAll = !this.isSelectAll;
        if (this.isSelectAll) {
            this.lastIndex = this.pageIndex;
        }
        if (this.newRecordList && this.newRecordList.length > 0) {
            this.newRecordList = this.newRecordList.map(record => {
                return this.checkRecordCantSetNew(record);
            })
            this.newRecordList = this.newRecordList.map(item => {
                if (!item.canNotSetNew) {// can set to new records
                    item.isSelected = this.isSelectAll;
                    if (this.isSelectAll) this.entityKeys.push(item.entityKey);
                    else this.entityKeys = [];
                }
                return item;
            });
        }
    }

    onRecordSelect(record: UnMatchedRecord) {
        record.isSelected = !record.isSelected;
        this.entityKeys = [];// reset keys list 
        let selectedRecords = this.newRecordList.filter(record => record.isSelected == true);
        selectedRecords.forEach(selectedRecord => {
            this.entityKeys.push(selectedRecord.entityKey);
        });
        this.canSetAsNew = this.entityKeys.length == 0 ? false : true;

        // if all record is selected then check on select all 
        if (selectedRecords.length == this.newRecordList.length) {
            this.isSelectAll = true;
            this.newRecordList = this.newRecordList.map(item => {
                item.isSelected = true;
                return item;
            })
        } else this.isSelectAll = false;
    }


    // if data is valid then show save button
    checkRecordCantSetNew(record: UnMatchedRecord) {
        record.canNotSetNew = false;
        if (record) {
            record.errors.forEach(object => {
                if (object.error.errorCode == 208) {
                    record.canNotSetNew = true;
                }
            });
        }
        return record;
    }

    //#endregion
}