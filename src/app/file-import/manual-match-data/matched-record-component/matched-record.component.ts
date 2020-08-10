import { BaseComponentComponent } from "../../../common/components/base-component";
import { OnInit, OnDestroy, Output, EventEmitter, Input, SimpleChanges } from "@angular/core";
import { FileImportService } from '../../file-import.service';
import { MatchedRecord } from '../../models';
import { Pairs } from '../../../revenue-import/models';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
declare var $: any;

export class MatchRecordComponent extends BaseComponentComponent implements OnInit, OnDestroy {

    //#region Properties
    selectedId: string;
    isSelectValue: boolean;
    executionId: string;
    displayNames: string[] = [];
    targetNames: string[] = [];
    isSelected: boolean = false;
    entityKeys: string[] = [];
    rowKeys: string[] = [];
    isSearching: boolean = false;
    isValidData: boolean = false;
    @Output() loading: EventEmitter<boolean> = new EventEmitter();
    @Input("matchedList") matchedList: MatchedRecord[] = [];
    @Input("matchedLength") matchedLength: number = 0;

    selectedRecord: MatchedRecord;
    isSelectAll: boolean = false;
    isImporting: boolean = false;
    // using for Infinite scroll
    pageIndex: number = 0;
    lastIndex: number = 0;
    scrollDistance = 2;
    scrollUpDistance = 2;
    scrollThrottle = 100;

    // search by name
    searchText: string;
    searchedEntity: any;
    showSearchValue: boolean;
    canSetAsNew: boolean = false;
    unlinkModal: string = "null";
    editModal: string = "null";
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
        this.pageIndex = this.fileImportService.getPageIndex(this.matchedList);
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
        if (loadedRecordsCount < this.matchedLength) {
            this.pageIndex++;
            this.fileImportService.loadMatchedRecordsPage(this.pageIndex);
        }
    }

    onRecordSelectAll() {
        this.entityKeys = []; // reset keys
        // flag
        this.isSelectAll = !this.isSelectAll;
        if (this.isSelectAll) {
            this.lastIndex = this.pageIndex;
        }
        if (this.matchedList && this.matchedList.length > 0) {
            this.matchedList = this.matchedList.map(record => {
                return this.checkRecordCantSetNew(record);
            })
            this.matchedList = this.matchedList.map(item => {
                if (!item.canNotSetNew) {
                    item.isSelected = this.isSelectAll;
                    if (this.isSelectAll) this.entityKeys.push(item.entityKey);
                    else this.entityKeys = [];
                }
                return item;
            });
        }
    }

    onRecordSelect(record: MatchedRecord) {
        record.isSelected = !record.isSelected;
        this.entityKeys = [];// reset keys list 
        let selectedRecords = this.matchedList.filter(record => record.isSelected == true);
        selectedRecords.forEach(selectedRecord => {
            this.entityKeys.push(selectedRecord.entityKey);
        });
        this.canSetAsNew = this.entityKeys.length == 0 ? false : true;

        // if all record is selected then check on select all 
        if (selectedRecords.length == this.matchedList.length) {
            this.isSelectAll = true;
            this.matchedList = this.matchedList.map(item => {
                item.isSelected = true;
                return item;
            })
        } else this.isSelectAll = false;
    }


    // if data is valid then show save button
    checkRecordCantSetNew(record: MatchedRecord) {
        record.canNotSetNew = false;
        // if (record) {
        //     record.errors.forEach(object => {
        //         if (object.error.errorCode == 208) {
        //             record.canNotSetNew = true;
        //         }
        //     });
        // }
        return record;
    }

    /**init data for search box */
    private setAutocompleteData() {
        let source: Pairs[] = [];
        if (this.fileImportService.crmResource)
            source = this.fileImportService.crmResource;
        this.initAutoComplete(source);
    }

    /**init search box- auto complete when you typing */
    private initAutoComplete(records: Pairs[]) {
        if (records.length == 0 || records == undefined) {
            console.log("No source found!!")
            return;
        }
        let self = this;
        $("#match-tags").autocomplete({
            source: function (request, response) {
                var results = $.ui.autocomplete.filter(records, request.term);
                response(results.slice(0, 50));
            },
            select: function (e, ui) {
                self.selectedId = ui.item.id;
                self.isSelectValue = true;
                self.checkValidData(ui.item.label);
                self.getCRMInfoByName(ui.item.id);
            }
        });
        $("#match-tags").autocomplete("option", "appendTo", "#match-group");
    }

    confirmImportToCRM() {
        // show modal for user cho continue import or cancel
        $("#import-confirm").modal("show");
    }

    // import matched record to crm
    importToCRM() {
        // this.loading.emit(true);
        this.fileImportService.updateEntitiesIntoCRM(this.executionId).subscribe(res => {
            if (res && res.success) {
                this.fileImportService.reloadMatchedRecords();
            } else {
                // this.loading.emit(false);
                let message = res.error ? res.error.errorMessage : res.errorMessage;
                this.fileImportService.showErrorDialog(message);
            }
        }, error => {
            console.log(error);
            this.fileImportService.showErrorDialog(error.message);
            // this.loading.emit(false);
        });

        this.confirmationService.showModal({
            title: "Notice",
            message: "Importing of records has begun. You can view the status via Import Status menu.",
            btnOkText: "OK"
        }).subscribe(() => this.router.navigate(["/"]));
    }

    /** show searching result into lookup */
    txtSeachKeyUp(event) {
        // check isSearching and disable btn Save
        let text = event.target.value.trim();
        this.checkValidData(text);
    }



    /** edit selected matched record */
    editMatchRecord() {
        $('#edit-modal').modal('hide');
        this.loading.emit(true);
        this.fileImportService.manualMatchRecord(this.executionId, this.entityKeys[0], this.selectedId).subscribe(res => {
            if (res.success) {
                this.fileImportService.reloadMatchedRecords();
            }
            else {
                this.loading.emit(false);
                let message = res.error ? res.error.errorMessage : res.errorMessage;
                this.fileImportService.showErrorDialog(message);
            }
        }, error => {
            console.log(error);
            this.fileImportService.showErrorDialog(error.message);
            this.loading.emit(false);

        })
    }

    /**
     * get rowkey and entitykey of selected record
     * @param row 
     */
    setSelectedRowKey(row: MatchedRecord) {
        this.entityKeys = [];
        this.entityKeys.push(row.crmData.entityKey);
        // row using in unlink matched record
        this.rowKeys = [];
        this.rowKeys.push(row.crmData.rowKey);
        this.selectedRecord = row;
    }

    setDisplayNamesForMatching() {
        this.displayNames = this.fileImportService.templateFields;
        this.targetNames = this.fileImportService.targetNames;
    }

    /**
     * init search box following entity type
     */
    btnMatchingClick(row: MatchedRecord) {
        if (!row.crmData) {
            this.editModal = "null";
            this.checkMissingData();
        } else {
            this.editModal = "edit-modal";
            this.searchText = this.fileImportService.crmResource.filter(crm => crm.id == row.crmData.matchedEntityId)[0].value;
            this.resetMatchingModal();
            this.setSelectedRowKey(row);
            this.setAutocompleteData();
            this.setDisplayNamesForMatching();
        }

    }

    // move selected row to unmatched record
    btnUnlinkClick(row: MatchedRecord) {
        if (!row.crmData) {
            this.unlinkModal = "null"
            this.checkMissingData();
        } else {
            this.unlinkModal = "unlink-modal"
            this.resetMatchingModal();
            this.setSelectedRowKey(row);
            this.setDisplayNamesForMatching();
        }
    }

    /**unlink selected record is choosen when open unlink modal*/
    btnYesToAgreeUnlink() {
        $('#unlink-modal').modal('hide');
        this.loading.emit(true);
        this.fileImportService.unlinkMatchedRecord(this.executionId, this.rowKeys[0], this.selectedRecord.crmData.matchedEntityId).subscribe(res => {
            if (res.success) {
                this.fileImportService.reloadMatchedAndUnmatched();
            } else {
                this.loading.emit(false);
                let message = res.error ? res.error.errorMessage : res.errorMessage;
                this.fileImportService.showErrorDialog(message);
            }
        }, error => {
            this.fileImportService.showErrorDialog(error.message);
            this.loading.emit(false);

        })
    }

    /**return CRM columns value following targetName */
    getCRMColumnsValue(targetName) {
        let targetValue = this.selectedRecord.crmData.entityData[targetName];
        targetValue = targetValue ? targetValue.toString() : "";
        if (this.selectedRecord && !this.showSearchValue) {
            switch (targetName) {
                case "finpal_benefittype": return this.fileImportService.mapInsuranceBenefitType(targetValue);
                case "finpal_premiumtype": return this.fileImportService.mapInsurancePremiumType(targetValue);
                default: return targetValue;
            }
        }
        else if (this.searchedEntity && this.searchedEntity.length > 0) return this.searchedEntity[0][targetName];
    }

    /**return File columns value following targetName */
    getFileColumnsValue(targetName) {
        if (this.selectedRecord)
            return this.selectedRecord.sourceData[targetName];
    }

    getCRMInfoByName(id: string) {
        this.isSearching = true;
        this.fileImportService.getCRMInfoByName(this.fileImportService.entityName, id).subscribe(res => {

            this.showSearchValue = true;
            this.isSearching = false;
            if (res) {
                if (this.fileImportService.entityName == "contacts") {
                    this.searchedEntity = res.filter(record => record.contactid == this.selectedId);
                }
                if (this.fileImportService.entityName == "finpal_households") {
                    this.searchedEntity = res.filter(record => record.finpal_householdid == this.selectedId);
                }
                if (this.fileImportService.entityName == "accounts") {
                    this.searchedEntity = res.filter(record => record.accountid == this.selectedId);
                }
                if (this.fileImportService.entityName == "finpal_clientassets") {
                    this.searchedEntity = res.filter(record => record.finpal_clientassetid == this.selectedId);
                }
                if (this.fileImportService.entityName == "finpal_clientdebts") {
                    this.searchedEntity = res.filter(record => record.finpal_clientdebtid == this.selectedId);
                }
                if (this.fileImportService.entityName == "finpal_personalinsurances") {
                    this.searchedEntity = res.filter(record => record.finpal_personalinsuranceid == this.selectedId);
                }
                if (this.fileImportService.entityName == "finpal_insurancebenefits") {
                    this.searchedEntity = res.filter(record => record.finpal_insurancebenefitid == this.selectedId);
                }
            }
        }, error => {
            this.fileImportService.showErrorDialog(error.message);
        })
    }
    //#endregion

    //#region Helpers
    // reset some variable before match new record
    resetMatchingModal() {
        this.selectedId = undefined;
        this.isSelectValue = false;
        this.isValidData = false;
        this.isSearching = false;
        this.selectedRecord = undefined;
        this.searchedEntity = undefined;
        this.showSearchValue = false;
        $('#match-tags').val("");
    }

    // if data is valid then show save button
    checkValidData(text) {
        if (text == '') {
            if (this.selectedId == undefined) {
                this.isValidData = false;
                this.isSearching = false;
                this.selectedId = undefined;
                this.isSelectValue = false;
            } else this.isValidData = true;
        } else if (this.selectedId && this.isSelectValue) {
            this.isValidData = true;
        }
        else {
            this.isSearching = true;
            this.isValidData = false;
        }
    }

    checkMissingData() {
        let iSub: ISubscription = this.confirmationService.showModal({
            title: "Error #404",
            message: "Missing data.",
            btnOkText: "Ok"
        }).subscribe(() => { iSub.unsubscribe() })
    }


    //#endregion
}