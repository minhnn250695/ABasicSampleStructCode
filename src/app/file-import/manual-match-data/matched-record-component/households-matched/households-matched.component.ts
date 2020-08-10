import { Component, OnInit, OnDestroy } from "@angular/core";
import { FileImportService } from '../../../file-import.service';
import { MatchRecordComponent } from '../matched-record.component';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';

@Component({
    selector: "households-matched",
    templateUrl: "./households-matched.component.html",
    styleUrls: ["./households-matched.component.css"]
})

export class HouseHoldsMatchedComponent extends MatchRecordComponent implements OnInit, OnDestroy {
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
