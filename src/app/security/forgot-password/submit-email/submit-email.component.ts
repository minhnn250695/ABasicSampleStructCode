import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { BaseEventComponent } from '../../../common/components/base-component/index';
import { ConfigService } from '../../../common/services/config-service';
import { Observable } from 'rxjs/Observable';
import { UiEvent } from '../../../common/models/ui-event.model';
import { Result } from '../../../common/models/result.model';
import { ForgotPasswordService } from '../forgot-password.service';
import { Router } from '@angular/router';
import { LoadingDialog } from '../../../common/dialog/loading-dialog/loading-dialog.component';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';

declare var $: any;

enum SubmitEmailEvent {
  SUBMIT_EMAIL
}

@Component({
  selector: 'app-submit-email',
  templateUrl: './submit-email.component.html',
  styleUrls: ['./submit-email.component.css'],
  providers: [ForgotPasswordService]
})

export class SubmitEmailComponent extends BaseEventComponent implements OnInit {

  confirmEmail: string;

  constructor(
    private forgotPassService: ForgotPasswordService,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef)
  }

  ngOnInit() {
    super.onBaseInit();
    this.showLoading(false)
  }

  btnSubmitClick() {
    if (this.confirmEmail) {
      this.proceedEvent(SubmitEmailEvent.SUBMIT_EMAIL, this.confirmEmail);
    }
  }

  /**
   * ========================================================================================
   * HANDLE ACTIONS 
   * ========================================================================================
   */

  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();

    this.showLoading(true);
    if (event.event == SubmitEmailEvent.SUBMIT_EMAIL) {
      return this.forgotPassService.submitForgotPassEmail(event.payload);
    }
  }


  /**
   * ========================================================================================
   * HANDLE RESULTS 
   * ========================================================================================
   */

  handleEventResult(result: Result) {
    if (!result) return Observable.empty();

    if (result.event == SubmitEmailEvent.SUBMIT_EMAIL) {
      this.showLoading(false);
      if (result.payload.success)
        this.router.navigate(["forgot-password/send-reset-link"]);
      else if (!result.payload.success && result.payload.error) {
        console.log("request error")
        let subcription = this.confirmationDialogService.showModal({
          title: "Error #" + result.payload.error.errorCode,
          message: result.payload.error.errorMessage,
          btnOkText: "Close"
        }).subscribe(() => subcription.unsubscribe());
      }
    }
  }

  handleError(error: any) {
    console.log("error", error);
    this.showLoading(false);
    let subcription = this.confirmationDialogService.showModal({
      title: "Error",
      message: error.statusText,
      btnOkText: "Close"
    }).subscribe(() => subcription.unsubscribe());
  }

}
