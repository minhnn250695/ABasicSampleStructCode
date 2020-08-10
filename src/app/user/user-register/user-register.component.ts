import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';
// components
import { BaseEventComponent, BaseComponentComponent } from '../../common/components/base-component/index';
// models
import { Result, UiEvent } from '../../common/models/index';
import { ActivateUserRequest } from '../models';

// services
import { UserService } from '../user.service';

// utils
import { ValidateUtils } from '../../common/utils'
import { HttpClient, HttpRequest } from '@angular/common/http';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ISubscription } from 'rxjs/Subscription';

declare var $: any;

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css'],
})
export class UserRegisterComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  @ViewChild('loadingSpinner') loadingSpinner: any;

  private validate: ValidateUtils = new ValidateUtils();

  private token: string;
  private companyId: string;
  private email: string;
  private newPass: string;
  private rePass: string;

  // false
  private isNotValid: boolean = false;
  private isNotMatch: boolean = false;
  private isEmailNotValid: boolean = false;

  companyLogoUrl: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private confirmationDialogService: ConfirmationDialogService,
    private httpClient: HttpClient) {
    super();
  }

  ngOnInit() {
    super.onBaseInit();
    $('body').addClass('full');
    this.token = this.route.snapshot.paramMap.get('token');
    this.companyId = this.route.snapshot.paramMap.get('companyId');
    sessionStorage.setItem('registerCompany', this.companyId);

    this.userService.getEmailAddress(this.token, this.companyId).subscribe(res => {
      this.loadingSpinner.closeImmediate();
      if (!res.success && res.data) {
        let modalSubscription: ISubscription = this.confirmationDialogService.showModal({
          title: "Error #" + res.data.code,
          message: res.data.message,
          btnOkText: "Back to login"
        }).subscribe(() => {
          modalSubscription.unsubscribe();
          this.router.navigate(['/']);
        });
      } else
        this.email = res.data.data;
    });
    this.userService.getCompanyLogo(this.companyId).subscribe(company => {
      this.companyLogoUrl = company.url;
    })
  }
  ngOnDestroy() {
    $('body').removeClass('full');
  }

  onRePassChange() {
    this.isNotValid = false;
    this.isNotMatch = false;
    this.isEmailNotValid = false;
  }

  btnSetPassClick() {
    if (!this.validate.validateEmail(this.email)) {
      this.isEmailNotValid = true;
      this.showMessageThenRedirectToHome("Email is not valid.");
      return;
    }
    if (!this.newPass) {
      let subcription = this.confirmationDialogService.showModal({
        title: "Warning",
        message: "Please enter new password.",
        btnOkText: "Close"
      }).subscribe(() => subcription.unsubscribe());
      return;
    }
    else if (!this.checkPassword(this.newPass)) {
      this.isNotValid = true;
      let subcription = this.confirmationDialogService.showModal({
        title: "Warning",
        message: "Your password must be at least 8 characters long and include one uppercase character.",
        btnOkText: "Close"
      }).subscribe(() => subcription.unsubscribe());
      return;
    }
    if (this.rePass == "") {
      let subcription = this.confirmationDialogService.showModal({
        title: "Warning",
        message: "Please confirm your password.",
        btnOkText: "OK"
      }).subscribe(() => subcription.unsubscribe());
      return;
    }
    else if (this.newPass != this.rePass) {
      this.isNotMatch = true;
      let subcription = this.confirmationDialogService.showModal({
        title: "Warning",
        message: "Confirmation password does not match new password.",
        btnOkText: "Close"
      }).subscribe(() => subcription.unsubscribe());
      return;
    }

    this.loadingSpinner.openSpinner();
    this.userService.activateUser(this.getRequest()).subscribe(res => {
      this.loadingSpinner.closeImmediate();
      this.gotoSuccessPage();
    }, err => {
      this.loadingSpinner.closeImmediate();
      // this.showError(err.errorCode);
      this.showMessageThenRedirectToHome(err);
    });
  }

  private gotoSuccessPage() {
    this.router.navigate(['users/register-success']);
  }

  private getRequest() {
    let request = new ActivateUserRequest();
    request.Password = this.newPass;
    request.Token = this.token && this.token.trim();
    request.Username = this.email;
    return request;
  }


  private checkPassword(str: string) {
    // at least one number, one lowercase and one uppercase letter, special character and minimum 8 characters
    var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[\w~@#$%^&*+=`|{}:;!.?\"()\[\]-]{8,}$/;
    return re.test(str);
  }

  private showMessageThenRedirectToHome(error: any) {
    let title = error.errorCode ? "Error #" + error.errorCode : "Error";
    let message = error.Message ? error.Message : this.getErrorMessage(error.errorCode);
    let subcription = this.confirmationDialogService.showModal({
      title: title,
      message: message,
      btnOkText: "Back to login"
    }).subscribe(() => {
      subcription.unsubscribe();
      this.router.navigate(["/"]);
    });
  }

  private getErrorMessage(errorCode) {
    switch (errorCode) {
      case ActiveAccountErrorCode.EMAIL_NOT_FOUND:
        return "Email not found.";
      case ActiveAccountErrorCode.ACCOUNT_ALREADY_ACTIVE:
        return "Account already active.";
      case ActiveAccountErrorCode.ACCOUNT_LOCKED:
        return "Account locked.";
      case ActiveAccountErrorCode.INVALID_CREDENTIALS:
        return "Invalid credentials.";
      case ActiveAccountErrorCode.INVALID_TOKEN:
        return "Invalid token.";
      case ActiveAccountErrorCode.TOKEN_IS_EXPIRED:
        return "Activation email is expired.";
      case ActiveAccountErrorCode.PARAMETERS_REQUIRED:
        return "Missing parameters.";
      default:
        return "Unknown error. Cannot change password.";
    }
  }

  private showError(errorCode) {
    if (errorCode) {
      switch (errorCode) {
        case ActiveAccountErrorCode.EMAIL_NOT_FOUND:
          this.showMessageThenRedirectToHome("Email not found.");
          break;
        case ActiveAccountErrorCode.ACCOUNT_ALREADY_ACTIVE:
          this.showMessageThenRedirectToHome("Account already active.");
          break;
        case ActiveAccountErrorCode.ACCOUNT_LOCKED:
          this.showMessageThenRedirectToHome("Account locked.");
          break;
        case ActiveAccountErrorCode.INVALID_CREDENTIALS:
          this.showMessageThenRedirectToHome("Invalid credentials.");
          break;
        case ActiveAccountErrorCode.INVALID_TOKEN:
          this.showMessageThenRedirectToHome("Invalid token.");
          break;
        case ActiveAccountErrorCode.TOKEN_IS_EXPIRED:
          this.showMessageThenRedirectToHome("Activation email is expired.");
          break;
        case ActiveAccountErrorCode.PARAMETERS_REQUIRED:
          this.showMessageThenRedirectToHome("Missing parameters.");
          break;
        default:
          this.showMessageThenRedirectToHome("Unknown error. Cannot change password.");
          break;
      }
    } else {
      this.showMessageThenRedirectToHome("Unknown error. Cannot change password.");
    }
  }
}

enum ActiveAccountErrorCode {
  EMAIL_NOT_FOUND = 140,
  ACCOUNT_ALREADY_ACTIVE = 141,
  ACCOUNT_LOCKED = 142,
  INVALID_CREDENTIALS = 143,
  TOKEN_IS_EXPIRED = 144,
  INVALID_TOKEN = 145,
  PARAMETERS_REQUIRED = 4039,
}
