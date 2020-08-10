import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ClientViewService } from '../client-view/client-view.service';
import { FpStorageService } from '../local-storage.service';
import { SecurityService } from '../security/security.service';

import { FindClientComponent } from '../landing/admin-view/card-find-client/find-client.component';
import { OnBoardingService } from '../on-boarding/on-boarding.service';
import { ConfirmationDialogService } from '../common/dialog/confirmation-dialog/confirmation-dialog.service';

declare var $: any;
@Component({
  selector: 'app-mobile-landing',
  templateUrl: './mobile-landing.component.html',
  styleUrls: ['./mobile-landing.component.css'],
  providers: [ClientViewService, OnBoardingService],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class MobileLandingComponent extends FindClientComponent implements OnInit, OnDestroy {
  constructor(
    router: Router, clientService: ClientViewService, localStorage: FpStorageService,
    securityService: SecurityService, changeDetectorRef: ChangeDetectorRef,
    onboardingService: OnBoardingService, confirmationDialogService: ConfirmationDialogService
  ) {
    super(router, clientService, localStorage, securityService, onboardingService, confirmationDialogService, changeDetectorRef);
  }

  ngOnInit() {
    $("body").css("padding-top", "0px");

    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
