import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StateService, TargetState } from '@uirouter/angular';
import { Observable } from 'rxjs';
import { LoadingDialog } from '../../../common/dialog/loading-dialog/loading-dialog.component';
import { FpStorageService } from '../../../local-storage.service';
import { SecurityService } from '../../security.service';

// components
import { BaseEventComponent } from '../../../common/components/base-component/base-event.component';
import { LoadingSpinnerService } from '../../../common/components/loading-spinner/loading-spinner.service';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
// models
import { Result, RoleAccess, UiEvent } from '../../../common/models';
import { ConfigService } from '../../../common/services/config-service';
import { UserAccount } from '../../user-account.model';
import { LoginComponent } from '../login-desk/login.component';
declare var $: any;


@Component({
  selector: 'app-login-mobile',
  templateUrl: './login-mobile.component.html',
  styleUrls: ['./login-mobile.component.css']
})
export class LoginMobileComponent extends LoginComponent implements OnInit, OnDestroy {

  constructor(securityService: SecurityService,
    router: Router,
    localStorage: FpStorageService,
    portalConfigService: ConfigService,
    loadingService: LoadingSpinnerService,
    confirmationDialogService: ConfirmationDialogService) {
    super(securityService, router, localStorage, portalConfigService, loadingService, confirmationDialogService);
  }

  ngOnInit() {
    // this.onBaseInit();
    super.ngOnInit();
  }

  ngOnDestroy() {
    this.onBaseDestroy();
  }

}
