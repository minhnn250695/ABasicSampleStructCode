import { Component, OnInit, OnDestroy } from "@angular/core";
import { FileImportService } from '../../../file-import.service';
import { NewRecordComponent } from '../new-record.component';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';

@Component({
    selector: "insurance-policies-new",
    templateUrl: "./insurance-policies.component.html",
    styleUrls: ["./insurance-policies.component.css"]
})

export class InsurancePoliciesNewComponent extends NewRecordComponent implements OnInit, OnDestroy { 
    constructor(fileImportService: FileImportService,
        confirmationDialogService: ConfirmationDialogService,
        router: Router
    ) {
        super(fileImportService, confirmationDialogService, router);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
