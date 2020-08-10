import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { BaseEventComponent } from '../../../common/components/base-component/index';
import { Observable } from 'rxjs/Observable';
import { Result, UiEvent } from '../../../common/models/index';
import { ForgotPasswordService } from '../forgot-password.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ConfigService } from '../../../common/services/config-service';
import { LocalStorageService } from 'ngx-webstorage';
import { LoadingDialog } from '../../../common/dialog/loading-dialog/loading-dialog.component';
import { HttpClient } from '@angular/common/http';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
declare var $: any;

enum ResetPassEvent {
  SUBMIT_NEW_PASS
}

enum ForgotPassErrorCode {
  USER_NOT_FOUND = 150,
  INVALID_USER_STATUS = 151,
  INVALID_CREDENTIALS = 152,
  INVALID_TOKEN = 153
}

@Component({
  selector: 'app-reset-new-pass',
  templateUrl: './reset-new-pass.component.html',
  styleUrls: ['./reset-new-pass.component.css'],
  providers: [ForgotPasswordService]
})
export class ResetNewPassComponent extends BaseEventComponent implements OnInit {
  token: string;
  companyId: string;
  newPass: string;
  rePass: string;
  email: string;
  companylogo: string;

  errorMessage: string;
  isNotMatch: boolean = false;
  isNotValid: boolean = false;

  constructor(
    private forgotPasswordService: ForgotPasswordService, private router: Router,
    private localStorage: LocalStorageService,
    private confirmationDialogService: ConfirmationDialogService,
    private route: ActivatedRoute,
    configService: ConfigService,
    private httpClient: HttpClient) {
    super(configService)
  }

  ngOnInit() {
    super.onBaseInit();
    this.token = this.route.snapshot.paramMap.get('token');
    this.companyId = this.route.snapshot.paramMap.get('companyId');
    sessionStorage.setItem('resetCompany', this.companyId);

    this.forgotPasswordService.getEmailAddress(this.token, this.companyId).subscribe(res => {
      if (!res.success && res.data) {
        console.log("Account expired");
        let subcription = this.confirmationDialogService.showModal({
          title: "Error #" + res.data.code,
          message: res.data.message,
          btnOkText: "Back to login"
        }).subscribe(() => {
          subcription.unsubscribe();
          this.router.navigate(["/"]);
        })
      }
      this.showLoading(false);
      this.email = res.data.data;
    });

    this.forgotPasswordService.getCompanyLogo(this.companyId).subscribe((companyUrl) => {
      this.companylogo = companyUrl && companyUrl.url;
    })
  }

  ngOnDestroy() { }


  onRePassChange() {
    if (this.newPass || this.rePass) {
      this.isNotValid = false;
    }

    if (this.newPass == "" || this.rePass == "" || this.newPass == this.rePass) {
      this.isNotMatch = false;
    }

  }

  btnResetPassClick() {
    if (!this.newPass || !this.rePass || !this.email) {
      this.isNotValid = true;
      return;
    }

    if (this.newPass != this.rePass) {
      this.isNotMatch = true;
      return;
    }

    if (this.email && this.newPass == this.rePass && this.newPass.trim() != "" && this.rePass.trim() != "") {
      if (this.checkPassword(this.newPass)) {
        this.proceedEvent(ResetPassEvent.SUBMIT_NEW_PASS, this.newPass)
      }
      else
        this.isNotValid = true;
    }
  }

  gotoHome() {
    this.router.navigate(["/login"])
  }
  /**
   * ========================================================================================
   * HANDLE ACTIONS 
   * ========================================================================================
   */

  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();

    if (event.event == ResetPassEvent.SUBMIT_NEW_PASS) {
      this.showLoading(true);
      return this.forgotPasswordService.resetNewPass(event.payload, this.token.trim(), this.email.trim());
    }
  }

  /**
  * ========================================================================================
  * HANDLE RESULTS 
  * ========================================================================================
  */


  handleEventResult(result: Result) {
    if (!result) return Observable.empty();

    if (result.event == ResetPassEvent.SUBMIT_NEW_PASS) {
      this.showLoading(false);
      if (result.payload && result.payload.success)
        this.router.navigate(["forgot-password/reset-successed"]);
      else {
        if (result.payload.error) {
          this.handleError(result.payload.error);
          // switch (result.payload.error.errorCode) {
          //   case ForgotPassErrorCode.USER_NOT_FOUND:
          //     this.handleError(result.payload.error);
          //     break;
          //   case ForgotPassErrorCode.INVALID_CREDENTIALS:
          //     this.handleError(result.payload.error.errorCode, "Invalid credentials");
          //     break;
          //   case ForgotPassErrorCode.INVALID_TOKEN:
          //     this.handleError(result.payload.error.errorCode, "Activation expired");
          //     break;
          //   case ForgotPassErrorCode.INVALID_USER_STATUS:
          //     this.handleError(result.payload.error.errorCode, "Invalid user status");
          //     break;
          //   default:
          //     this.handleError(result.payload.error.errorCode, "Cannot change password");
          //     break;
          // }
        }
        else {
          this.handleError({});
        }
      }
    }
  }

  handleError(error: any) {
    let title = error.errorCode ? "Error #" + error.errorCode : "Error";
    let message = error.errorMessage ? error.errorMessage : "Reset password failed";
    let subcription = this.confirmationDialogService.showModal({
      title: title,
      message: message,
      btnOkText: "Close"
    }).subscribe(() => subcription.unsubscribe());
  }

  private checkPassword(str: string) {
    // at least one number, one lowercase and one uppercase letter, special character and minimum 8 characters
    var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[\w~@#$%^&*+=`|{}:;!.?\"()\[\]-]{8,}$/;
    return re.test(str);
  }
}

enum ActiveAccountErrorCode {
  EMAIL_NOT_FOUND = 140,
  ACCOUNT_ALREADY_ACTIVE = 141,
  ACCOUNT_LOCKED = 142,
  INVALID_CREDENTIALS = 143,
  TOKEN_IS_EXPIRED = 144,
  INVALID_TOKEN = 145,
}
