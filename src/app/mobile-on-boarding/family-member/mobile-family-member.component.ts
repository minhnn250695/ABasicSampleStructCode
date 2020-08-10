import { Component, OnInit, ViewChild } from "@angular/core";
import { FamilyMemberComponent } from '../../on-boarding/family-member/family-member.component';
import { OnBoardingService } from '../../on-boarding/on-boarding.service';
import { Router } from '@angular/router';
import { ConfigService } from '../../common/services/config-service';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';

declare var $: any;
@Component({
  selector: "app-mobile-family-member",
  templateUrl: "./mobile-family-member.component.html",
  styleUrls: ["./mobile-family-member.component.css"]
})
export class MobileFamilyMemberComponent extends FamilyMemberComponent implements OnInit {

  constructor(
    onboardingService: OnBoardingService,
    confirmationDialogService: ConfirmationDialogService,
    router: Router,
    configService: ConfigService) {
    super(onboardingService, confirmationDialogService, router, configService);
  }

  // initial data
  ngOnInit(): any {
    super.ngOnInit();
    this.initMobileEditMember();
  }

  initMobileEditMember() {
    $('#new-family-member').on('hidden.bs.modal', () => {
      // check new member
      if (this.isNewMember) {
        this.getMemberInfo();
      }

      // show change warning
      if (this.selectedMember && !this.isSaveOrAddNewClick) {
        if (this.changeInformationDetection() || this.changeImageDetection()) {
          $('#error-dialog').modal({
            backdrop: 'static'
          });
        }
      }

      // change event btn "Save" or "Add new" click to false
      if (this.isSaveOrAddNewClick) {
        this.isSaveOrAddNewClick = false;
      }
    });
  }

  ngOnDestroy(): any {
    super.ngOnDestroy();
  }
}
