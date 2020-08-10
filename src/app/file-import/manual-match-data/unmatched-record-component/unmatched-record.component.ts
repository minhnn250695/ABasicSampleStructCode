import { BaseComponentComponent } from "../../../common/components/base-component";
import { OnInit, OnDestroy, EventEmitter, Output, Input, SimpleChanges } from "@angular/core";
import { FileImportService } from '../../file-import.service';
import { UnMatchedRecord } from '../../models';
import { Pairs } from '../../../revenue-import/models';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
declare var $: any;

export class UnmatchedRecordComponent extends BaseComponentComponent implements OnInit, OnDestroy {
    //#region Properties
    selectedId: string;
    executionId: string;
    displayNames: string[] = [];
    targetNames: string[] = [];

    columns: number[] = [];
    entityKeys: string[] = [];
    searchDatas: any[] = []; // list of {entity: name of search entity; data: search data}
    matchedRelationshipEntities: any[] = []; // list of { executionId, RelationshipName, RelationshipValue, RelatedEntityId }

    isSelectValue: boolean;
    isSelected: boolean = false;
    isSearching: boolean = false;
    isValidData: boolean = false;
    selectedRecord: UnMatchedRecord = new UnMatchedRecord();
    selectedRowKey: string;
    // using for Infinite scroll
    pageIndex: number = 0;
    lastIndex: number = 0;
    scrollDistance = 2;
    scrollUpDistance = 2;
    scrollThrottle = 100;

    // search by name
    searchedEntity: any;
    isSelectAll: boolean = false;
    canSetAsNew: boolean = false;
    private iSub: ISubscription;
    @Output() loading: EventEmitter<boolean> = new EventEmitter();
    @Input("unmatchedList") unmatchedList: UnMatchedRecord[] = [];
    @Input("unmatchedListAll") unmatchedListAll: UnMatchedRecord[] = [];
    @Input("unmatchedLength") unmatchedLength: number = 0;
    //#endregion

    //#region Contructors
    constructor(
        protected fileImportService: FileImportService,
        protected confirmationDialogService: ConfirmationDialogService,
        protected router: Router) {
        super();
    }

    ngOnInit() {
        this.executionId = JSON.parse(sessionStorage.getItem("importFile")).id;
        this.entityKeys = [];
    }

    ngOnDestroy() {
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        $('body').removeAttr("style");
        this.resetValues();
    }

    /**catch event every time one of the component input properties changes */
    ngOnChanges(changes: SimpleChanges) {
        this.pageIndex = this.fileImportService.getPageIndex(this.unmatchedList);
        if (this.isSelectAll && (this.lastIndex < this.pageIndex)) {
            this.isSelectAll = false;
            this.onRecordSelectAll();
        }
        if (changes.unmatchedList && changes.unmatchedList.currentValue) {
            if (this.unmatchedListAll.length > 0) {
                this.unmatchedListAll = this.unmatchedListAll.map((record, index) => {
                    return this.checkRecordCantSetNew(record, index);
                })
            }

            if (this.unmatchedList.length > 0) {
                this.unmatchedList = this.unmatchedList.map((record, index) => {
                    return this.checkRecordCantSetNew(record, index);
                })

                // get resources to search for incorrect relationships
                let observables: Observable<any>[] = [];
                let errorColumnList: string[] = [];
                // find list of error columns
                this.unmatchedList.forEach(record => {
                    record.errors.forEach(error => {
                        if (errorColumnList.findIndex(item => item === error.data.RelatedEntity) === -1) {
                            errorColumnList.push(error.data.RelatedEntity);
                        }
                    });
                });
                // push all search data observables into 1 variable.
                errorColumnList.forEach(relatedEntity => {
                    observables.push(this.fileImportService.getResourceOfIncorrectRelationships(relatedEntity));
                });

                this.iSub = Observable.zip.apply(null, observables).subscribe(responses => {
                    if (this.iSub) {
                        this.iSub.unsubscribe();
                      }
                    let index = 0;
                    responses.forEach(r => {
                        if (responses[index])
                            this.searchDatas.push({ entity: errorColumnList[index], data: [...responses[index]] });
                        index++;
                    });
                })


            }
        }
    }
    //#endregion

    //#region Actions
    /**
     * Find the suitable search data with each incorrect entity
     * @param row Incorrect entity of selected row.
     */
    getDataSourceForIncorrectEntities(row: any) {
        if (!row || !this.searchDatas) return;
        let list = this.searchDatas.find(i => (i.entity === row.data.RelatedEntity))
        return list ? list.data : [];
    }

    /**
     * Find display name for each target names.
     * @param targetName - target name of incorrect relationship entity.
     */
    getDisplayNameForMatchedRelationship(targetName: string) {
        if (this.fileImportService.entityFields.length > 0)
            return this.fileImportService.entityFields.find(i => (i.targetName === targetName)).displayName;
        return targetName;
    }

    getCRMInfoByName(id: string) {
        this.isSearching = true;
        // slice name from beginning to the first '+' symbol
        // let plusIndex = name.indexOf('+');
        // get new string from index 0 to the first index of '+' symbol
        // let searchString = name.slice(0, plusIndex);
        this.fileImportService.getCRMInfoByName(this.fileImportService.entityName, id).subscribe(res => {

            this.isSearching = false;

            if (res && this.fileImportService.entityName == "contacts") {
                this.searchedEntity = [...res].find(record => record.contactid == this.selectedId);
            }
            if (res && this.fileImportService.entityName == "finpal_households") {
                this.searchedEntity = [...res].find(record => record.finpal_householdid == this.selectedId);
            }
            if (res && this.fileImportService.entityName == "accounts") {
                this.searchedEntity = [...res].find(record => record.accountid == this.selectedId);
            }
            if (res && this.fileImportService.entityName == "finpal_clientassets") {
                this.searchedEntity = [...res].find(record => record.finpal_clientassetid == this.selectedId);
            }
            if (res && this.fileImportService.entityName == "finpal_clientdebts") {
                this.searchedEntity = [...res].find(record => record.finpal_clientdebtid == this.selectedId);
            }
            if (res && this.fileImportService.entityName == "finpal_personalinsurances") {
                this.searchedEntity = [...res].find(record => record.finpal_personalinsuranceid == this.selectedId);
            }
            if (res && this.fileImportService.entityName == "finpal_insurancebenefits") {
                this.searchedEntity = [...res].find(record => record.finpal_insurancebenefitid == this.selectedId);

            }
        }, error => {
            this.fileImportService.showErrorDialog(error.message ? error.message : "No search entity found");
        })
    }


    /**
    * scroll down then show more records
    */
    onScrollDown() {
        // get more record to show in table    
        let loadedRecordsCount = this.fileImportService.pageSize * (this.pageIndex + 1);
        if (loadedRecordsCount < this.unmatchedLength) {
            this.pageIndex++;
            this.fileImportService.loadUnmatchedRecordsPage(this.pageIndex);
        }

    }

    /**check if record got 208 error code , then it can't set as new record-(disabled it) */
    checkRecordCantSetNew(record: UnMatchedRecord, index?: number) {
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

    /**init search box- auto complete when you typing */
    private initAutoComplete(records: Pairs[]) {
        if (records.length == 0 || records == undefined) {
            console.log("No source found!!")
            return;
        }
        // let self = this;
        $("#unmatch-tags").autocomplete({
            source: (request, response) => {
                var results = $.ui.autocomplete.filter(records, request.term);
                response(results.slice(0, 50));
            },
            select: (e, ui) => {
                this.selectedId = ui.item.id;
                this.isSelectValue = true;
                this.checkValidData(ui.item.label);
                this.getCRMInfoByName(ui.item.id);
            }
        });
        $("#unmatch-tags").autocomplete("option", "appendTo", "#unmatch-group");
    }

    /** show searching result into lookup */
    txtSeachKeyUp(event) {
        // check isSearching and disable btn Save
        let text = event.target.value.trim();
        this.checkValidData(text);
    }

    onRecordSelectAll() {
        this.entityKeys = [];
        this.isSelectAll = !this.isSelectAll;
        this.lastIndex = this.pageIndex;

        //using unmatchedList to update button can set new on view 
        if (this.unmatchedList && this.unmatchedList.length > 0) {
            this.unmatchedList = this.unmatchedList.map(record => {
                return this.checkRecordCantSetNew(record);
            })
            this.unmatchedList = this.unmatchedList.map(item => {
                if (!item.canNotSetNew) {
                    item.isSelected = this.isSelectAll;
                }
                return item;
            });
        }
        // update entityKeys using to set new records
        if (this.unmatchedListAll && this.unmatchedListAll.length > 0) {
            this.unmatchedListAll = this.unmatchedListAll.map((record, index) => {
                return this.checkRecordCantSetNew(record, index);
            })
            this.unmatchedListAll = this.unmatchedListAll.map((item, index) => {
                if (!item.canNotSetNew) {
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
        let selectedRecords = this.unmatchedList.filter(record => record.isSelected == true);
        selectedRecords.forEach(selectedRecord => {
            this.entityKeys.push(selectedRecord.entityKey);
        });
        this.canSetAsNew = this.entityKeys.length == 0 ? false : true;

        // if all record is selected then check on select all 
        if (selectedRecords.length == this.unmatchedList.length) {
            this.isSelectAll = true;
            this.unmatchedList = this.unmatchedList.map(item => {
                item.isSelected = true;
                return item;
            })
        } else this.isSelectAll = false;
    }


    // if data is valid then show save button
    checkValidData(text) {
        if (text == '') {
            if (this.selectedId == undefined) {
                this.isValidData = false;
                // this.isSearching = false;
                this.selectedId = undefined;
                this.isSelectValue = false;
            } else this.isValidData = true;
        } else if (this.selectedId && this.isSelectValue) {
            this.isValidData = true;
        }
        else {
            // this.isSearching = true;
            this.isValidData = false;
        }
    }

    /**send unmatched record is selected to match it */
    manualMatchRecord() {
        this.loading.emit(true);
        if (!this.selectedId) return;
        this.fileImportService.manualMatchRecord(this.executionId, this.selectedRowKey, this.selectedId).subscribe(res => {

            if (res.success)
                this.fileImportService.reloadMatchedAndUnmatched();
            else {
                this.loading.emit(false);
                let errorMessage = '';
                res[0].errors.forEach(error => {
                    errorMessage += error.propertyName + ' : ' + error.errorMessage + ' . <br/>';
                });

                this.fileImportService.showErrorDialog(errorMessage);
            }
        }, error => {
            this.fileImportService.showErrorDialog(error.message)
            this.loading.emit(false);
        })
    }

    /**
     * ### Get new matched relationship entity with following fields:
     * - `id`: selected entity id.
     * - `value`: value of selected entity.
     * - `row`: changed row.
     * ### Add/modify matched relationship list.
     * - Modify if new matched entity has same relationship name with entity in matched relationship list.
     * - Add new to matched relationship list.
     */
    matchedRelationship({ id, value, row }) {
        let selectedRow = this.selectedRecord.errors[row];
        let data = {
            executionId: this.executionId,
            relationShipName: selectedRow.propertyName,
            relationshipValue: this.selectedRecord.entityDataJson[selectedRow.propertyName],
            relatedEntityId: id
        }
        // find position of new selected relationship
        // if relationship name already exists in matched list => update entity at that position.
        // else add new.
        let p = this.matchedRelationshipEntities.findIndex(element => (element.relationShipName === data.relationShipName));
        if (p != -1)
            this.matchedRelationshipEntities[p] = data;
        else
            this.matchedRelationshipEntities.push(data);
    }


    btnSaveRelationships() {
        this.loading.emit(true);
        let observables: Observable<any>[] = [];
        this.matchedRelationshipEntities.forEach(entity => {
            observables.push(this.fileImportService.updateEntityImportMatchRelationship(entity))
        });
        this.iSub = Observable.zip.apply(null, observables).subscribe(responses => {
            if (this.iSub) {
                this.iSub.unsubscribe();
              }
            this.resetEntityKey();
            this.fileImportService.reloadMatchedAndUnmatched();
        }, error => {
            /* BE doesn't handle error */
            this.loading.emit(false);
            this.confirmationDialogService.showModal({
                title: "Error",
                message: error.message,
                btnOkText: "OK"
            });
        });
    }

    // init search box following entity type
    btnMatchingClick(row: UnMatchedRecord) {
        this.resetMatchingModal();
        this.setSelectedRowKey(row);
        this.setAutocompleteData(1);
        this.setDisplayNamesForMatching();
        // Find data of matched entity and bind to SearchEntity
        if (row.matchedEntityId) {
            this.setMatchedEntityForSelectedRecord(row.matchedEntityId);
        }
    }

    showNewRecordsConfirmDialog(row?: any) {

        let isSetOneRecordToNew = false; // set all record to new
        if (row) {
            this.selectedRowKey = row.entityKey;
            isSetOneRecordToNew = true; //just set one record to new
        }
        let showNewRecordsConfirmSubscription = this.confirmationDialogService.showModal({
            title: "Alert",
            message: "Do you want to change selected item(s) to new records?",
            btnOkText: "Yes",
            btnCancelText: "Cancel"
        }).subscribe(btnOkClick => {
            if (btnOkClick) {
                this.setAsNewEntities(isSetOneRecordToNew);
            } else {
                this.selectedRowKey = "";

            }
            showNewRecordsConfirmSubscription.unsubscribe();
        });
    }

    setDisplayNamesForMatching() {
        this.displayNames = this.fileImportService.templateFields;
        this.targetNames = this.fileImportService.targetNames;
    }

    setAsNewEntities(justSetOneRecordToNew: boolean = false) {
        this.loading.emit(true);
        let tempListKeys = [];
        if (this.isSelectAll && !justSetOneRecordToNew) {
            tempListKeys = this.entityKeys;
        } else {
            tempListKeys.push(this.selectedRowKey);
        }
        if (!this.executionId || !tempListKeys) {
            this.loading.emit(false);
            return;
        }
        this.fileImportService.setRecordAsNewEnties(this.executionId, tempListKeys).subscribe(res => {
            this.entityKeys = []; // reset entity key list
            tempListKeys = undefined;
            this.isSelectAll = false; // deselect check box of select all records
            if (res && res.length > 0) {
                if (res[0].success)
                    this.fileImportService.reloadNewAndUnmatched();
                else {
                    this.loading.emit(false);
                    let errorMessage = '';
                    let errorCode = (res[0].error[0] && res[0].error[0].errorCode) ? res[0].error[0].errorCode : "undefined"
                    res[0].errors.forEach(error => {
                        errorMessage += error.propertyName + ' : ' + error.errorMessage + ' . <br/>';
                    });

                    let iSub: ISubscription = this.confirmationDialogService.showModal({
                        title: 'Error #' + errorCode,
                        message: "" + errorMessage,
                        btnOkText: "Ok"
                    }).subscribe(() => { iSub.unsubscribe() });
                }
            }
        }, error => {
            this.fileImportService.showErrorDialog(error.mesage);
            this.loading.emit(false);
        });
    }

    // set selected row key
    setSelectedRowKey(row: UnMatchedRecord) {
        this.selectedRowKey = row.entityKey;
        // get selected record to show it in matched modal
        this.selectedRecord = row;
    }

    /**
     * Find matched entity of selected record and show in "Match record" modal
     * @param id - matched entity id of selected record
     */
    setMatchedEntityForSelectedRecord(id: string) {
        if (id && this.fileImportService.crmResource) {

            let e = this.fileImportService.crmResource.find(i => i.id === id);
            if (e) {
                this.selectedId = e.id;
                this.getCRMInfoByName(e.value);
            }
        }
    }

    /**init data for search box */
    private setAutocompleteData(type: number) {
        let source: Pairs[] = [];

        if (!type) return;

        if (type == 1 && this.fileImportService.crmResource)
            source = this.fileImportService.crmResource;

        this.initAutoComplete(source);
    }

    //#endregion

    //#region Helpers
    private resetEntityKey() {
        this.entityKeys = [];
        this.isSelectAll = false;
    }

    private resetValues() {
        this.displayNames = [];
        this.targetNames = [];
        this.executionId = null;
        this.selectedId = null;
        this.selectedRecord = new UnMatchedRecord();
        this.unmatchedList = [];
        this.matchedRelationshipEntities = [];
    }

    // reset some variable before match new record
    private resetMatchingModal() {
        this.selectedId = undefined;
        this.isSelectValue = false;
        this.isValidData = false;
        this.isSearching = false;
        this.searchedEntity = undefined;
        this.matchedRelationshipEntities = [];
        $('#unmatch-tags').val("");
    }

    checkVisibleButtonSave() {
        let disable: boolean = false;
        // if (!this.isValidData || this.isSearching || this.matchedRelationshipEntities.length < 1)
        //     disable = true;
        // else disable = false;
        return disable;
    }



    //#endregion
}