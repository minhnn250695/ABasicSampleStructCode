import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FpStorageService } from '../../../local-storage.service';
import { SecurityService } from '../../security.service';

// components
import { BaseEventComponent } from '../../../common/components/base-component/base-event.component';

// models
import { LoadingSpinnerService } from '../../../common/components/loading-spinner/loading-spinner.service';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Result, UiEvent } from '../../../common/models';
import { ConfigService } from '../../../common/services/config-service';
import { UserAccount } from '../../user-account.model';

declare var $: any;

@Component({
    selector: 'login-component',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [SecurityService],
})

export class LoginComponent extends BaseEventComponent implements OnInit {

    isRememberMe: boolean = false;
    username: string;
    password: string;
    invalidCredentials: boolean;
    accountLocked: boolean;
    adminSignInUrl: string;

    constructor(private securityService: SecurityService,
        private router: Router,
        private localStorage: FpStorageService,
        private portalConfigService: ConfigService,
        private loadingService: LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService) {
        super(portalConfigService);
    }

    ngOnInit(): void {
        // if user already login, go to 'landing' page
        $('body').addClass('full');
        super.onBaseInit();
        this.proceedEvent(LoginEvent.CHECK_IF_USER_LOGGINED);
        this.adminSignInUrl = this.baseApiUrl + "adminlogin/signin-oidc?returnUrl=" + window.location.origin + "/%23/login&baseUrl=" + window.location.origin;
    }

    /* =====================================================================================================================
    *  VIEW ACTION
    * ===================================================================================================================== */
    login(): void {
        if (this.username && this.password && this.username.trim() !== "") {
            this.proceedEvent(LoginEvent.LOGIN, { username: this.username, password: this.password });
        }
    }

    /* =====================================================================================================================
   *  Event handler
   * ===================================================================================================================== */
    transformEventToObservable(event: UiEvent): Observable<any> {
        if (!event) return Observable.empty();
        this.loadingService.show();

        if (event.event === LoginEvent.CHECK_IF_USER_LOGGINED) {
            return Observable.fromPromise(this.securityService.checkAuthenticatedUser());
        }
        else if (event.event === LoginEvent.LOGIN) {
            let { username, password } = event.payload;
            return this.securityService.login(username, password);
        }

        return Observable.empty();
    }

    changeRememberMe() {
        this.isRememberMe = !this.isRememberMe;
    }

    handleEventResult(result: Result) {
        // this.showLoading(false);
        this.loadingService.hide();

        if (!result) return;

        if (result.event === LoginEvent.CHECK_IF_USER_LOGGINED || result.event === LoginEvent.LOGIN) {
            let error = result.payload && result.payload.error;
            if (error && error.errorCode) {
                if (error.errorCode === 100) {
                    this.gotoScreen(null);
                } else {
                    const subscription = this.confirmationDialogService.showModal({
                        title: "Error #" + error.errorCode,
                        message: error.errorMessage,
                        btnOkText: "Close",
                    }).subscribe(() => subscription.unsubscribe());
                }
            } else if (result.payload) {
                this.gotoScreen(result.payload);
            }

        }
    }

    handleError(err: any) {
        // this.showLoading(false);
        this.loadingService.hide();

        if (err.status !== 200) {
            console.log("Error", err);
            if (err.status === 0 && err.statusText === "Unknown Error") {
                this.showErrorDialog("Error #" + err.status, "Invalid service request.");
            } else
                this.showErrorDialog("Error #" + err.status, err.statusText);
        }
    }

    private gotoScreen(account: UserAccount) {
        if (!account)
            this.router.navigate(["/login/invalid-user"], { queryParams: { individual: true } });
        else {
            $('body').removeClass('full');

            // route to client-view page
            if (!account.roleAccess || (account.roleAccess && account.roleAccess.length === 0)) {
                this.router.navigate(["/client-view"]);
                return;
            }

            // route to on-boarding page
            if (this.securityService.isClient() && account.factFind) {
                if (!this.isMobile)
                    this.router.navigate(["/on-boarding"]);
                else
                    this.router.navigate(["/mobile-on-boarding"]);
                return;
            }

            // check if admin using mobile
            // if so route to mobile link
            // else route to landing page
            if (this.securityService.isClientAdminOrStaff()) {
                this.localStorage.saveClientId(account.id);
                this.router.navigate(["/landing"]);
            }
            else if (this.securityService.isPortalBusinessAccount()) {
                this.localStorage.saveClientId(account.id);
                this.router.navigate(["/client-view"]);
            }
            else if (this.securityService.isPortalAdmin()) {
                this.localStorage.saveClientId(account.id);
                this.router.navigate(["/admin"]);
            }
        }
    }
}

enum LoginEvent {
    CHECK_IF_USER_LOGGINED,
    LOGIN,
}