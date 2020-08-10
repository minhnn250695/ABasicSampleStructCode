import { Component, OnInit, OnDestroy } from "@angular/core";
import { FileImportService } from '../../../file-import.service';
import { InvalidRecordComponent } from '../invalid-record.component';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: "insurance-policies-invalid",
    templateUrl: "./insurance-policies-invalid.component.html",
    styleUrls: ["./insurance-policies-invalid.component.css"]
})

export class InsurancePoliciesInvalidComponent extends InvalidRecordComponent implements OnInit, OnDestroy { 
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
