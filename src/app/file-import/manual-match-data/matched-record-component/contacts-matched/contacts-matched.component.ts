import { Component, OnInit, OnDestroy } from "@angular/core";
import { FileImportService } from '../../../file-import.service';
import { MatchRecordComponent } from '../matched-record.component';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';

@Component({
    selector: "contacts-matched",
    templateUrl: "./contacts-matched.component.html",
    styleUrls: ["./contacts-matched.component.css"]
})

export class ContactsMatchedComponent extends MatchRecordComponent implements OnInit, OnDestroy { 
    constructor(
        fileImportService: FileImportService, 
        confimationDialogService: ConfirmationDialogService, 
        router: Router) {
        super(fileImportService, confimationDialogService, router);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
