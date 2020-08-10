import { Component, OnInit, OnDestroy } from "@angular/core";
import { FileImportService } from '../../../file-import.service';
import { InvalidRecordComponent } from '../invalid-record.component';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: "client-debts-invalid",
    templateUrl: "./client-debts-invalid.component.html",
    styleUrls: ["./client-debts-invalid.component.css"]
})

export class ClientDebtsInvalidComponent extends InvalidRecordComponent implements OnInit, OnDestroy { 
    constructor( fileImportService: FileImportService, confirmationDialogService : ConfirmationDialogService,
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
