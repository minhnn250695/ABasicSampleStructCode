import { Component, OnInit } from '@angular/core';
import { BaseEventComponent } from '../../../common/components/base-component/index';
import { Observable } from 'rxjs/Observable';
import { Result, UiEvent } from '../../../common/models/index';
import { ForgotPasswordService } from '../forgot-password.service';
import { Router } from '@angular/router';
import { ConfigService } from '../../../common/services/config-service';
import { SecurityService } from '../../security.service';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';

enum ResetSuccess {
  LOG_OUT
}

@Component({
  selector: 'app-reset-sucess',
  templateUrl: './reset-sucess.component.html',
  styleUrls: ['./reset-sucess.component.css'],
  providers: [ForgotPasswordService, SecurityService]
})

export class ResetSucessComponent extends BaseEventComponent implements OnInit {
  companyLogoUrl: string;

  constructor(
    private forgotPassService: ForgotPasswordService,
    private securityService: SecurityService,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router,
    configService: ConfigService) {
    super(configService);
  }


  ngOnInit() {
    super.onBaseInit();
    if (!this.forgotPassService.companyLogoUrl) {
      const companyId = sessionStorage.getItem("resetCompany");
      this.forgotPassService.getCompanyLogo(companyId).subscribe(logo => {
        this.companyLogoUrl = logo.url;
      });
    } else
      this.companyLogoUrl = this.forgotPassService.companyLogoUrl;
  }

  btnSignInClick() {
    if (localStorage.getItem('token'))
      this.proceedEvent(ResetSuccess.LOG_OUT);
    else
      this.router.navigate(["/login"]);
  }

  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();

    if (event.event == ResetSuccess.LOG_OUT)
      return this.securityService.logout();
  }

  handleEventResult(result: Result) {
    if (result) {
      this.router.navigate(["/login"]);
    }
  }

  handleError(error: any) {
    console.log("Error", error);
    /* BE doesn't handle error */
    this.confirmationDialogService.showModal({
      title: "Error",
      message: "Reset password failed",
      btnOkText: "Back to login"
    }).subscribe(() => this.router.navigate(["/login"]));
  }
}
