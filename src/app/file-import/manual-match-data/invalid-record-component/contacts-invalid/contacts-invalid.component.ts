import { Component, OnInit, OnDestroy } from "@angular/core";
import { FileImportService } from '../../../file-import.service';
import { InvalidRecordComponent } from '../invalid-record.component';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: "contacts-invalid",
    templateUrl: "./contacts-invalid.component.html",
    styleUrls: ["./contacts-invalid.component.css"]
})

export class ContactsInvalidComponent extends InvalidRecordComponent implements OnInit, OnDestroy {
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
