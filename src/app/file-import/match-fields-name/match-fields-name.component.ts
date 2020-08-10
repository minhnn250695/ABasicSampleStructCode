import { Router } from "@angular/router";
import { BaseComponentComponent } from "../../common/components/base-component";
import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import { UnmappedFields, DataImportsEntityManualMap } from '../models';
import { FileImportService } from '../file-import.service';
import { FieldMapResource } from '../models/field-map-resource.model';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ISubscription } from 'rxjs/Subscription';

declare var $: any;
@Component({
    selector: "app-match-fields-name",
    templateUrl: "./match-fields-name.component.html",
    styleUrls: ["./match-fields-name.component.css"]
})
export class MatchFieldsNameComponent extends BaseComponentComponent implements OnInit, OnDestroy, AfterViewInit {

    //#region Properties
    targetNameFromRequiredCRM: string[] = [];
    allRequiredCRM: UnmappedFields[] = [];
    nonRequiredCrm: UnmappedFields[] = [];

    // optional fields
    optionalFileList: string[] = [];
    optionalCrmList: UnmappedFields[] = [];

    // require fields
    requiredFileList: string[];
    requireCrmList: UnmappedFields[] = [];
    fieldMappings: FieldMapResource[] = [];
    //#endregion

    //#region Contructors
    constructor(private router: Router,
        private fileImportService: FileImportService,
        private confirmationDialogService: ConfirmationDialogService) {
        super();
    }

    ngOnInit() {
        let executionID = sessionStorage.getItem("executionId");
        let entityName = sessionStorage.getItem("entityName");
        if (executionID && (entityName === "xplan_contacts" || entityName === "validation_failed")) {
            this.fileImportService.getXPlanMatchFieldNameData(executionID).subscribe(response => {
                this.showLoading(false);
                if (response.success) {
                    let res = response.data.data;
                    this.fileImportService.uploadResponse = { ...res };
                    this.initOptReqFields();
                } else {
                    let iSub: ISubscription = this.confirmationDialogService.showModal({
                        title: "Error #" + response.error && response.error.errorCode,
                        message: "" + response.error && response.error.errorMessage,
                        btnOkText: "Ok"
                    }).subscribe(() => { iSub.unsubscribe() })
                }
            }, error => {
                this.showLoading(false);
            });
        }

        else if (executionID && entityName && this.fileImportService.uploadResponse) {
            this.initOptReqFields();
            this.showLoading(false);
        }

        // redirect to upload page if no files need to match field name with CRM.
        else {
            this.router.navigate(['/file-import/upload']);
            this.showLoading(false);
        }
    }

    ngOnDestroy() {
    }

    ngAfterViewInit() {
        //#region Init mapped fields
        // Required
        let rMapped = this.fileImportService.uploadResponse && this.fileImportService.uploadResponse.autoMappedFields;
        if (rMapped && rMapped.length > 0) {
            rMapped.forEach(field => {
                $("#" + field.targetName).val(field.displayName);
            });
        }
        // Optional
        let oMapped = this.fileImportService.uploadResponse && this.fileImportService.uploadResponse.autoMappedColumns.filter(f => f.isRequired == false);
        if (oMapped && oMapped.length > 0) {
            for (let i = 0; i < oMapped.length; i++) {
                if (this.optionalFileList[i] == oMapped[i].displayName) {
                    $("#optionField" + i).val(oMapped[i].targetName);
                    this.handleDisableOptionalCrm(oMapped[i].targetName);
                }
            }
        }
        //#endregion
    }

    //#endregion contructor

    //#region Actions
    initOptReqFields() {
        this.targetNameFromRequiredCRM = this.getAllRequiredCRM().map(field => field.targetName);
        this.allRequiredCRM = this.getAllRequiredCRM();
        this.nonRequiredCrm = this.getNonRequiredCRM(this.targetNameFromRequiredCRM);

        this.requireCrmList = [...this.allRequiredCRM];
        this.optionalCrmList = [...this.nonRequiredCrm];
        this.requiredFileList = this.getRequiredFileList();
        this.optionalFileList = this.getOptionalFileList();

        this.initFieldMapping();
        this.showLoading(false);
    }

    initFieldMapping() {
        // add all mapped record to fieldMappings
        this.fieldMappings =
            [
                ...this.fileImportService.uploadResponse.autoMappedFields,
                ...this.fileImportService.uploadResponse.autoMappedColumns.filter(field => field.isRequired == false)
            ].map(field => { return { columnName: field.displayName, fieldName: field.targetName } });
    }

    checkAllRecordsMatched(): boolean {
        return this.fileImportService.uploadResponse
            && this.fileImportService.uploadResponse.entityImportExecutionId
            && this.fileImportService.uploadResponse.unmappedColumns.length == 0
            && this.fileImportService.uploadResponse.unmappedFields.length == 0;
    }

    getAllRequiredCRM(): UnmappedFields[] {
        return [
            ...this.fileImportService.uploadResponse.autoMappedFields,
            ...this.fileImportService.uploadResponse.unmappedFields];
    }

    getNonRequiredCRM(targetNameFromRequiredCRM: string[] = []): UnmappedFields[] {
        return [...this.fileImportService.uploadResponse.entityFields].filter(field => {
            // find the indexes of required fields
            let index = targetNameFromRequiredCRM.findIndex(name => { return name == field.targetName; });
            // return if not required field
            if (index == -1)
                return field;
        });
    }

    getRequiredFileList(): string[] {
        return [...this.fileImportService.uploadResponse.sourceColumns];
    }

    getOptionalFileList(): string[] {
        return [
            ...this.fileImportService.uploadResponse.autoMappedColumns
                .filter((f: UnmappedFields) => f.isRequired == false)
                .map((f: UnmappedFields) => f.displayName),
            ...this.fileImportService.uploadResponse.unmappedColumns
        ]
    }

    //#region Handle user select
    /**
     * Handle event when a field in `Required fields` selected.
     * 
     * - If selected field is already existed in `fieldMappings` list:
     * ``` 
     * Remove connection of last mapped field.
     * Remove that existed pair from fieldMappings.```
     * 
     * - Update `fieldMappings` and `optionalFileList` list.
     * 
     * @param event - current seleted file value.
     * @param index - current position of selected required field.
     */
    selectedRequireField(event, index) {
        let selectedFile = event && event.target && event.target.value;
        let oldPosOfRequiredFileInFieldMapping = this.findItemInFieldMappings("columnName", selectedFile);
        let curPosOfRequiredCrmInFieldMapping = this.findItemInFieldMappings("fieldName", this.requireCrmList[index].targetName);

        // Already exist in fieldMappings
        if (oldPosOfRequiredFileInFieldMapping != -1) {
            $("#" + this.fieldMappings[oldPosOfRequiredFileInFieldMapping].fieldName).val(''); // remove value of old field
            this.fieldMappings.splice(oldPosOfRequiredFileInFieldMapping, 1);  // remove exist item from fieldMappings
        }

        // Update fieldMapping
        if (curPosOfRequiredCrmInFieldMapping != -1)
            // Already in FieldMapping
            this.fieldMappings[curPosOfRequiredCrmInFieldMapping].columnName = selectedFile;
        else
            // Not in FieldMapping
            this.fieldMappings
                .push({ columnName: selectedFile, fieldName: this.requireCrmList[index].targetName });

        // Update optionalFileList
        this.optionalFileList = this.getOptionalFileList().filter(field => {
            let indexInFieldMappings = this.fieldMappings // find the indexes of columnNames of fieldMappings in optionalFieldList
                .findIndex(name => { return name.columnName == field; });
            let indexInRequireCRM = indexInFieldMappings != -1 // check if the fieldName of fieldsMappings is required
                ? this.requireCrmList.findIndex(name => {
                    return name.targetName == this.fieldMappings[indexInFieldMappings].fieldName
                }) : -1;

            if (indexInFieldMappings == -1 || indexInRequireCRM == -1) return field; // return item if not in fieldMappings or not required.
        });
    }

    /**
     * Handle event when a field in `Optional fields` selected.
     * 
     * - If selected field is already existed in `fieldMappings` list:
     * ``` 
     * Remove connection of last mapped field.
     * Remove that existed pair from fieldMappings.```
     * 
     * - Update `fieldMappings` list.
     * 
     * @param event - current seleted crm value.
     * @param index - current position of selected optional field.
     */
    seletedOptionalField(event, index) {
        let selectedCrm = event && event.target && event.target.value;
        let oldPosOfOptCrmInFieldMapping = this.findItemInFieldMappings("fieldName", selectedCrm);
        let curPosOfOptFileInFieldMapping = this.findItemInFieldMappings("columnName", this.optionalFileList[index]);

        // When user select blank
        // remove selected item from fieldMappings
        if (selectedCrm == "") {
            this.handleDisableOptionalCrm(this.fieldMappings[curPosOfOptFileInFieldMapping].fieldName, false); // remove disabled option
            if (curPosOfOptFileInFieldMapping != -1)
                this.fieldMappings.splice(curPosOfOptFileInFieldMapping, 1);
            return;
        }

        // When user already selected the current OptionalCrm
        if (oldPosOfOptCrmInFieldMapping != -1) {
            let position = this.optionalFileList.findIndex(x => x == this.fieldMappings[oldPosOfOptCrmInFieldMapping].columnName);
            $(`#optionField${position}`).val(''); // reset value of old record
            this.fieldMappings.splice(oldPosOfOptCrmInFieldMapping, 1);
        }

        if (curPosOfOptFileInFieldMapping != -1)
            this.fieldMappings[curPosOfOptFileInFieldMapping].fieldName = selectedCrm;
        else
            this.fieldMappings.push({ columnName: this.optionalFileList[index], fieldName: selectedCrm }); // update fieldMappings list

        // Disable selected value
        this.handleDisableOptionalCrm(selectedCrm);
    }

    handleDisableOptionalCrm(value: string, disabled: boolean = true) {
        if (disabled)
            for (let i = 0; i < this.optionalFileList.length; i++)
                $(`#optionField${i} option[value="${value}"]`).attr('disabled', true);
        else
            for (let i = 0; i < this.optionalFileList.length; i++)
                $(`#optionField${i} option[value="${value}"]`).removeAttr('disabled');
    }
    //#endregion

    /**
     * Handle event when button `Continue` clicked.
     */
    btnContinue() {
        // entity to map
        let entity: DataImportsEntityManualMap = {
            entityImportExecutionId: this.fileImportService.uploadResponse.entityImportExecutionId,
            fieldMappings: this.fieldMappings
        }

        this.showLoading(true);
        this.fileImportService.matcheFieldName(entity).subscribe(res => {
            this.showLoading(false);
            if (!res.success) {
                let message = res.error ? res.error.errorMessage : res.errorMessage;
                let title = res.error ? "Error #" + res.error.errorCode : "Error";
                let showConfirmModalSubscription: ISubscription = this.confirmationDialogService.showModal({
                    title: title,
                    message: message,
                    btnOkText: "Back to upload"
                }).subscribe(() => {
                    showConfirmModalSubscription.unsubscribe();
                    this.router.navigate(['/']);
                });
            }
            if (res.success && res.data.isValid) {
                let executionID = this.fileImportService.uploadResponse && this.fileImportService.uploadResponse.entityImportExecutionId;
                if (!executionID || this.fileImportService.entityName == "") {
                    this.showLoading(false);
                    this.router.navigate(['/file-import/upload']);
                    return;
                }
                //start import
                this.fileImportService.startImportDataFeed(executionID).subscribe(res => {
                    this.showLoading(false);
                    if (res.success) {
                        let showConfirmModalSubscription: ISubscription = this.confirmationDialogService.showModal({
                            title: "Information",
                            message: "Auto matching data has begun. You can view the status via Import Status menu.",
                            btnOkText: "Ok"
                        }).subscribe(() => {
                            showConfirmModalSubscription.unsubscribe();
                            this.router.navigate(['/']);
                        });
                    } else if (!res.success && res.error) {
                        let showConfirmModalSubscription: ISubscription = this.confirmationDialogService.showModal({
                            title: "Error #" + res.error.errrorCode,
                            message: res.error.errorMessage,
                            btnOkText: "Back to upload"
                        }).subscribe(() => {
                            showConfirmModalSubscription.unsubscribe();
                            this.router.navigate(['/file-import/upload']);
                        });
                    }
                }, error => {
                    /* BE doesn't handle error */
                    this.showLoading(false);
                    let showConfirmModalSubscription: ISubscription = this.confirmationDialogService.showModal({
                        title: "Error",
                        message: "Import records failed",
                        btnOkText: "Back to upload"
                    }).subscribe(() => {
                        showConfirmModalSubscription.unsubscribe();
                        this.router.navigate(['/file-import/upload']);
                    });
                });
            }
            else if (res.success && !res.data.isValid) {
                this.showLoading(false);
                let showConfirmModalSubscription: ISubscription = this.confirmationDialogService.showModal({
                    title: "Warning",
                    message: "You missed some required fields. Please check it again.",
                    btnOkText: "Close"
                }).subscribe(() => {
                    showConfirmModalSubscription.unsubscribe();
                });
            }
        }, error => {
            console.log(error);
            this.showLoading(false);
            /* BE doesn't handle error */
            let showConfirmModalSubscription: ISubscription = this.confirmationDialogService.showModal({
                title: "Error",
                message: "Import records failed",
                btnOkText: "Back to upload"
            }).subscribe(() => {
                showConfirmModalSubscription.unsubscribe();
                this.router.navigate(["/file-import/upload"]);
            });
        });
    }

    /**
     * Find the index of search value in object `fieldMappings`.
     * 
     * Return the index of searched value or -1 if not found.
     * 
     * @param field - Search in 2 fields: `columnName` or `fieldName`
     * @param data - Search data
     */
    findItemInFieldMappings(field: 'columnName' | 'fieldName', data: string) {
        return this.fieldMappings.findIndex(x => { return x[field] == data; })
    }
    //#endregion actions

}