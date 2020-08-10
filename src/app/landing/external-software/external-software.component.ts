import { Component, OnInit } from "@angular/core";
import { ExternalSoftwareService } from './external-software.service';
import { BaseComponentComponent } from '../../common/components/base-component';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: "app-external-software",
  templateUrl: "./external-software.component.html",
  styleUrls: ["./external-software.component.css"]
})
export class ExternalSoftwareComponent extends BaseComponentComponent implements OnInit {

  constructor(
    private externalSoftwareService: ExternalSoftwareService,
    private confirmationDialogService: ConfirmationDialogService) {
    super();
    // show error message request
    
    this.externalSoftwareService.handleShowErrorDialog().subscribe(message => {
        let subcription: ISubscription = this.confirmationDialogService.showModal({
        title: "Warning",
        message: message,
        btnOkText: "OK"
      }).subscribe(() => subcription.unsubscribe());
    });
  }

  ngOnInit() {

  }
}
