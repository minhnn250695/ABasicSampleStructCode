import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ErrorDialog } from '../common/dialog/error-dialog/error-dialog.component';
import { UploadCompletedDialog } from '../common/dialog/upload-completed-dialog/upload-completed-dialog.component';
import { Entity, Insurance } from './models';

declare var $: any;

@Component({
    selector: 'app-data-feeds-base-component',
    templateUrl: './data-feeds.component.html',
    styleUrls: ['./data-feeds.component.css']
})
export class DataFeedsBaseComponent {
    @ViewChild("myErrorDialog") myErrorDialog: ErrorDialog;
    @ViewChild("uploadCompleted") uploadCompletedDialog: UploadCompletedDialog;

    @Output("updateClick") updateClick: EventEmitter<boolean> = new EventEmitter();
    @Output("runLoading") runLoading: EventEmitter<boolean> = new EventEmitter();
    @Output("uploadAll") uploadAll: EventEmitter<boolean> = new EventEmitter();

    isMobile: boolean;
    isSelectAll: boolean = false;

    checkUsingMobile() {
        if (navigator.userAgent.includes("Mobile")) {
            this.isMobile = true;
            $('body').css('padding-top', '0');
        }
        else this.isMobile = false;
    }

    showErrorDialog(title?: string, message?: string, subMess?: string, showBtn: boolean = false, goToPage?: string) {
        if (!this.myErrorDialog) return;

        // create new error dialog
        this.myErrorDialog.showErrorDialog(title, message, subMess, showBtn, goToPage);
    }

    showUploadSuccess() {
        this.uploadCompletedDialog.showUCDialog();
    }

    reloadData(event: boolean) {
        this.updateClick.emit(event);
    }

    // Update Benefits of TAL to CRM
    updateInsuranceProvider(selectedEntity, informationOfSelectedEntity, compareInsuranceFromCRM, benefitsOfSelectedEntity): Entity<Insurance> {

        if (informationOfSelectedEntity && compareInsuranceFromCRM && benefitsOfSelectedEntity) {
            selectedEntity.crmId = compareInsuranceFromCRM.id;
        }

        return selectedEntity;
    }
}