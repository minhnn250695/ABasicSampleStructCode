import { Component, OnInit, OnDestroy } from "@angular/core";
import { FileImportService } from '../../../file-import.service';
import { NewRecordComponent } from '../new-record.component';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';

@Component({
    selector: "insurance-benefits-new",
    templateUrl: "./insurance-benefits.component.html",
    styleUrls: ["./insurance-benefits.component.css"]
})

export class InsuranceBenefitsNewComponent extends NewRecordComponent implements OnInit, OnDestroy {
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