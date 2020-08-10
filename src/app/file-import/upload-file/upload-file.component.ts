import { BaseComponentComponent } from "../../common/components/base-component";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { FileImportService } from "./../file-import.service";
import { DataImportFromFile } from '../models';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';

declare var $: any;
@Component({
    selector: "app-file-import-upload",
    templateUrl: "./upload-file.component.html",
    styleUrls: ["./upload-file.component.css"]
})
export class UploadFileComponent extends BaseComponentComponent implements OnInit, OnDestroy {

    //#region Properties
    isSelectedEntity: boolean;
    isFileSelected: boolean;
    isProcessing: boolean = false; // isProcessing: "true" then show proccess bar; "false" show select file to upload
    columnNamesWarning: string[] = [];
    //#endregion

    //#region Properties
    constructor(private router: Router,
        private fileImportService: FileImportService,
        private confirmationDialogService: ConfirmationDialogService) {
        super();
    }

    ngOnInit() {
        super.initTooltip();
        this.isFileSelected = false;
        // set a temp entity type is Contact
    }

    ngOnDestroy() {
        this.isFileSelected = false;
    }
    //#endregion

    //#region Actions
    onFileSelected(event: File) {
        this.isFileSelected = true;
        this.fileImportService.file = event;
    }

    selectedEntity(type) {
        this.fileImportService.entityName = type;
        this.isSelectedEntity = true;
    }

    onBtnUploadClick() {
        // this.router.navigate(['/file-import/upload-progress']);
        // showing process bar
        this.isProcessing = true;
        this.isSelectedEntity = false;
        // temporary run for xplan
        if (this.fileImportService.entityName === "xplan_contacts") {
            this.fileImportService.upLoadFileImportXPlanData(this.fileImportService.file, this.fileImportService.entityName)
                .subscribe(res => {
                    if (res.success) {
                        let uploadResponse = res && res.data.data as DataImportFromFile;
                        if (!uploadResponse) return;
                        // save fields info to show this in match field name component
                        this.fileImportService.uploadResponse = uploadResponse;
                        // store executionId and entityName to session storage
                        sessionStorage.setItem('executionId', uploadResponse.entityImportExecutionId);
                        sessionStorage.setItem('entityName', this.fileImportService.entityName);
                        // get crm resources to search
                        this.fileImportService.getCrmResources();
                        if (res.data.data.warnings && res.data.data.warnings.length > 0) {
                            // get column names in warning
                            this.columnNamesWarning = [...res.data.data.warnings.map(c => c.split(' ')[2])];
                            $("#upload-file-warnings").modal({
                                backdrop: 'static'
                            });
                        } else
                            this.router.navigate(['/file-import/match-fields-name']);
                    } else if (!res.success) {
                        let message = res.error ? res.error.errorMessage : res.errorMessage;
                        let title = res.error ? "Error #" + res.error.errorCode : "Error";
                        if (res.error.errorCode == 189)
                            message = "Your import file contains multiple sheets. Only one sheet for file is supported";
                        let subcription = this.confirmationDialogService.showModal({
                            title: title,
                            message: message + ". Please try again later.",
                            btnOkText: "Close"
                        }).subscribe(() => {
                            subcription.unsubscribe();
                            this.isProcessing = false
                        });
                    }
                }, error => {
                    /* BE doesn't handle error */
                    let IConfirmationDialog = this.confirmationDialogService.showModal({
                        title: "Error",
                        message: error.message + ". Please try again later.",
                        btnOkText: "OK"
                    }).subscribe(() => {
                        IConfirmationDialog.unsubscribe();
                        this.isProcessing = false
                    });
                });
        }
        else {
            this.fileImportService.upLoadFileImportData(this.fileImportService.file, this.fileImportService.entityName)
                .subscribe(res => {
                    if (res.success) {
                        let uploadResponse = res && res.data.data as DataImportFromFile;
                        if (!uploadResponse) return;
                        // save fields info to show this in match field name component
                        this.fileImportService.uploadResponse = uploadResponse;
                        // store executionId and entityName to session storage
                        sessionStorage.setItem('executionId', uploadResponse.entityImportExecutionId);
                        sessionStorage.setItem('entityName', this.fileImportService.entityName);
                        // get crm resources to search
                        this.fileImportService.getCrmResources();
                        if (res.data.data.warnings && res.data.data.warnings.length > 0) {
                            // get column names in warning
                            this.columnNamesWarning = [...res.data.data.warnings.map(c => c.split(' ')[2])];
                            $("#upload-file-warnings").modal({
                                backdrop: 'static'
                            });
                        } else
                            this.router.navigate(['/file-import/match-fields-name']);
                    } else if (!res.success) {
                        let message = res.error ? res.error.errorMessage : res.errorMessage;
                        let title = res.error ? "Error #" + res.error.errorCode : "Error";
                        if (res.error.errorCode == 189)
                            message = "Your import file contains multiple sheets. Only one sheet for file is supported";
                        let subcription = this.confirmationDialogService.showModal({
                            title: title,
                            message: message + ". Please try again later.",
                            btnOkText: "Close"
                        }).subscribe(() => {
                            subcription.unsubscribe();
                            this.isProcessing = false
                        });
                    }
                }, error => {
                    let IConfirmationDialog = this.confirmationDialogService.showModal({
                        title: "Error",
                        message: error.message + ". Please try again later.",
                        btnOkText: "OK"
                    }).subscribe(() => {
                        IConfirmationDialog.unsubscribe();
                        this.isProcessing = false
                    });
                });
        }
    }

    //#endregion

    //#region Navigations
    warningModalConfirmClick() {
        this.router.navigate(['/file-import/match-fields-name']);
    }
    //#endregion
}

