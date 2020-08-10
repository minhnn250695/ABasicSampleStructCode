import { Component, OnInit, OnDestroy } from "@angular/core";
import { FileImportService } from '../../../file-import.service';
import { UnmatchedRecordComponent } from '../unmatched-record.component';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';

@Component({
    selector: "client-debts-unmatched",
    templateUrl: "./client-debts.component.html",
    styleUrls: ["./client-debts.component.css"]
})

export class ClientDebtsUnmatchedComponent extends UnmatchedRecordComponent implements OnInit, OnDestroy {
    constructor(
        fileImportService: FileImportService,
        confirmationDialogService: ConfirmationDialogService,
        router: Router) {
        super(fileImportService, confirmationDialogService, router);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
