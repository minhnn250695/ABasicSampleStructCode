import { Router } from "@angular/router";
import { BaseComponentComponent } from "../../common/components/base-component";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { FileImportService } from '../file-import.service';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ISubscription } from 'rxjs/Subscription';
@Component({
    selector: "app-auto-match-data",
    templateUrl: "./auto-match-data.component.html",
    styleUrls: ["./auto-match-data.component.css"]
})
export class AutoMatchDataComponent extends BaseComponentComponent implements OnInit, OnDestroy {

    //#region Constructor
    constructor(private router: Router,
        private confirmationDialogService: ConfirmationDialogService,
        private fileImportService: FileImportService) {
        super();
    }

    ngOnInit() {
        let executionID = this.fileImportService.uploadResponse && this.fileImportService.uploadResponse.entityImportExecutionId;
        if (!executionID || this.fileImportService.entityName == "") {
            this.router.navigate(['/file-import/upload']);
            return;
        }
        this.fileImportService.startImportDataFeed(executionID)
            .subscribe(res => {
                if (res && res.data) {
                    if (res.data.success) {
                        this.router.navigate(['/file-import/manual-match-data']);
                        // just tempory way to handle show invalid message 
                        //-> will remove when api getInvalidRecord return invalid message
                        // this.fileImportService.invalidRecords = res.data.invalidRecords;
                    }
                    else if (!res.data.success) {
                        let message = res.error ? res.error.errorMessage : res.errorMessage ? res.errorMessage : res.data.error;
                        let subcription: ISubscription = this.confirmationDialogService.showModal({
                            title: "Error #" + res.error.errorCode,
                            message: message + ". Please try again.",
                            btnOkText: "Back to upload"
                        }).subscribe(() => {
                            subcription.unsubscribe();
                            this.router.navigate(["/file-import/upload"])
                        });
                    }
                }
            }, err => {
                console.log(err);
                /* BE doesn't handle error */
                let subcription: ISubscription = this.confirmationDialogService.showModal({
                    title: "Error",
                    message: err.message,
                    btnOkText: "OK"
                }).subscribe(() => {
                    subcription.unsubscribe();
                    this.router.navigate(["/file-import/upload"]);
                });
            });
    }

    ngOnDestroy() {

    }
    //#endregion

    //#region Navigation
    /**
     * auto matched => import data manual
     */
    gotoMatchCompletedPage() {
        this.router.navigate(["/file-import/import-data-manual"]);
    }

    //#endregion
}