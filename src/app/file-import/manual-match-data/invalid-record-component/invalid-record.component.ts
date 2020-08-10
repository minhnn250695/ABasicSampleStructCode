import { BaseComponentComponent } from "../../../common/components/base-component";
import { OnInit, OnDestroy, EventEmitter, Output, Input, SimpleChanges } from "@angular/core";
import { FileImportService } from '../../file-import.service';
import { InvalidRecord } from '../../models';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
declare var $: any;

export class InvalidRecordComponent extends BaseComponentComponent implements OnInit, OnDestroy {
    //#region Properties
    selectedId: string;
    isSelectValue: boolean;
    executionId: string;
    displayNames: string[] = [];
    targetNames: string[] = [];

    columns: number[] = [];
    isSelected: boolean = false;
    entityKeys: string[] = [];
    isSearching: boolean = false;
    isValidData: boolean = false;
    selectedRecord: InvalidRecord = new InvalidRecord();
    isSelectAll: boolean = false;

    // using for Infinite scroll
    pageIndex: number = 0;
    lastIndex: number = 0;
    scrollDistance = 2;
    scrollUpDistance = 2;
    scrollThrottle = 100;

    // search by name
    searchedEntity: any;
    entityName: string;
    entityFields: any;


    canSetAsNew: boolean = false;

    @Output() loading: EventEmitter<boolean> = new EventEmitter();
    @Input("invalidList") invalidList: InvalidRecord[] = [];
    @Input("invalidLength") invalidLength: number = 0;
    //#endregion

    //#region Constructor
    constructor(
        private fileImportService: FileImportService,
        private confirmationDialogService: ConfirmationDialogService,
        private router: Router) {
        super();
    }

    ngOnInit() {
        this.executionId = JSON.parse(sessionStorage.getItem("importFile")).id;
    }

    ngOnDestroy() {
        /**purpose remove css prevent user click on screen */
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        $('body').removeAttr("style");
    }

    /**catch event every time one of the component input properties changes */
    ngOnChanges(changes: SimpleChanges) {
        this.entityName = sessionStorage.getItem('entityName');
        this.pageIndex = this.fileImportService.getPageIndex(this.invalidList);
        if (changes.invalidList && changes.invalidList.currentValue) {

            //change property name using for show error message                        
            this.fileImportService.getEntityFields(this.entityName).subscribe(res => {
                if (res.success) {
                    this.entityFields = res.data.data;
                    this.fileImportService.entityFields = res.data.data;
                    // change friendly error message with end user
                    this.invalidList = this.invalidList.map(record => {
                        record.errors.forEach(element => {
                            switch (element.error.errorCode) {
                                case InvalidErrorCode.InvalidFormat: element.error.errorMessage = "invalid formatting in one of the fields"; break;
                                case InvalidErrorCode.InvalidMaxValue: element.error.errorMessage = "field value exceeds maximum allowed value"; break;
                                case InvalidErrorCode.InvalidMinValue: element.error.errorMessage = "field value is lower than minimum allowed value"; break;
                                case InvalidErrorCode.InvalidMaxLength: element.error.errorMessage = "field string length exceeds maximum allowed value"; break;
                                case InvalidErrorCode.InvalidMinLength: element.error.errorMessage = "field string length is less than minimum allowed value"; break;
                                case InvalidErrorCode.ValueCannotBeNull: element.error.errorMessage = "field value cannot be null"; break;
                                case InvalidErrorCode.InvalidMaxDate: element.error.errorMessage = "date is outside of allowed date range"; break;
                                case InvalidErrorCode.InvalidMinDate: element.error.errorMessage = "date is outside of allowed date range"; break;
                                case InvalidErrorCode.RelationshipCouldNotbeMatched: element.error.errorMessage = "the relationship could not be matched to an entity in the target CRM"; break;
                                case InvalidErrorCode.OptionSetValueCouldNotbeMatched: element.error.errorMessage = "the field value is not a valid option in the CRM field"; break;
                                case InvalidErrorCode.DuplicatedRecord: element.error.errorMessage = "is duplicated"; break;
                                default: element.error.errorMessage = "unknown error.";
                            }
                            this.convertFriendlyPropertyName(element);
                        });
                        return record;
                    })
                } else if (!res.success && res.error) {
                    let subcription: ISubscription = this.confirmationDialogService.showModal({
                        title: "Error #" + res.error.errorCode,
                        message: res.error.errorMessage,
                        btnOkText: "Close",
                    }).subscribe(() => {
                        subcription.unsubscribe();
                        this.router.navigate(['/file-import/upload']);
                    })
                }
            });

        }

        if (this.isSelectAll && (this.lastIndex < this.pageIndex)) {
            this.isSelectAll = false;
            this.onRecordSelectAll();
        }
    }


    //#endregion

    //#region Actions

    /** get selected record value*/
    selectRecordClick(index) {
        this.selectedRecord = this.invalidList[index];
    }

    // edit property name as display name in entityfield
    convertFriendlyPropertyName(element) {
        this.entityFields.filter(field => {
            if (field.targetName == element.propertyName) {
                element.propertyName = field.displayName;
            }
        });
    }

    /**
    * scroll down then show more records
    */
    onScrollDown() {
        // get more record to show in table    
        let loadedRecordsCount = this.fileImportService.pageSize * (this.pageIndex + 1);
        if (loadedRecordsCount < this.invalidLength) {
            this.pageIndex++;
            this.fileImportService.loadInvalidRecordsPage(this.pageIndex);
        }
    }

    onRecordSelectAll() {
        this.entityKeys = []; // reset keys
        // flag
        this.isSelectAll = !this.isSelectAll;
        if (this.isSelectAll) {
            this.lastIndex = this.pageIndex;
        }
        if (this.invalidList && this.invalidList.length > 0) {
            this.invalidList = this.invalidList.map(record => {
                return this.checkRecordCantSetNew(record);
            })
            this.invalidList = this.invalidList.map(item => {
                if (!item.canNotSetNew) {// can set to new records
                    item.isSelected = this.isSelectAll;
                    if (this.isSelectAll) this.entityKeys.push(item.entityKey);
                    else this.entityKeys = [];
                }
                return item;
            });
        }
    }

    onRecordSelect(record: InvalidRecord) {
        record.isSelected = !record.isSelected;
        this.entityKeys = [];// reset keys list 
        let selectedRecords = this.invalidList.filter(record => record.isSelected == true);
        selectedRecords.forEach(selectedRecord => {
            this.entityKeys.push(selectedRecord.entityKey);
        });
        this.canSetAsNew = this.entityKeys.length == 0 ? false : true;

        // if all record is selected then check on select all 
        if (selectedRecords.length == this.invalidList.length) {
            this.isSelectAll = true;
            this.invalidList = this.invalidList.map(item => {
                item.isSelected = true;
                return item;
            })
        } else this.isSelectAll = false;
    }


    // if data is valid then show save button
    checkRecordCantSetNew(record: InvalidRecord) {
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
    //#region Helpers
    private resetEntityKey() {
        this.entityKeys = [];
    }

    private resetValues() {
        this.displayNames = [];
        this.targetNames = [];
        this.executionId = null;
        this.selectedId = null;
        this.selectedRecord = new InvalidRecord();
        this.invalidList = [];
    }

    // reset some variable before match new record
    private resetMatchingModal() {
        this.selectedId = undefined;
        this.isSelectValue = false;
        this.isValidData = false;
        this.isSearching = false;
        this.searchedEntity = undefined;
        $('#invalid-records-detail').val("");
    }  
    //#endregion
}

//#endregion


//#region Helpers

/**error message */
enum InvalidErrorCode {
    InvalidFormat = 200,
    InvalidMaxValue = 201,
    InvalidMinValue = 202,
    InvalidMaxLength = 203,
    InvalidMinLength = 204,
    ValueCannotBeNull = 205,
    InvalidMaxDate = 206,
    InvalidMinDate = 207,
    RelationshipCouldNotbeMatched = 208,
    OptionSetValueCouldNotbeMatched = 209,
    DuplicatedRecord = 210
}
//#endregion