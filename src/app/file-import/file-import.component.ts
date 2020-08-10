import { Component, OnInit } from "@angular/core";
import { FileImportService } from './file-import.service';
import { BaseComponentComponent } from '../common/components/base-component';
import { ConfirmationDialogService } from '../common/dialog/confirmation-dialog/confirmation-dialog.service';
@Component({
  selector: "app-file-import",
  templateUrl: "./file-import.component.html",
  styleUrls: ["./file-import.component.css"]
})
export class FileImportComponent extends BaseComponentComponent implements OnInit {

  constructor(
    private fileImportService: FileImportService,
    private confirmationDialogService: ConfirmationDialogService) {
    super();
    // show error message request
    
    this.fileImportService.handleShowErrorDialog().subscribe(message => {
      this.confirmationDialogService.showModal({
        title: "Warning",
        message: message,
        btnOkText: "OK"
      });
    });
  }

  ngOnInit() {

  }
}
