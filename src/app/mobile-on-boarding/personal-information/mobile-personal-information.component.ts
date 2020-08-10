import { Component, OnInit, ViewChild } from "@angular/core";

import { PersonalInformationComponent } from '../../on-boarding/personal-information/personal-information.component';
import { OnBoardingService } from '../../on-boarding/on-boarding.service';
import { Router } from '@angular/router';
import { ConfigService } from '../../common/services/config-service';

declare var $: any;
@Component({
  selector: "app-mobile-personal-information",
  templateUrl: "./mobile-personal-information.component.html",
  styleUrls: ["./mobile-personal-information.component.css"],
  providers: []
})
export class MobilePersonalInformationComponent extends PersonalInformationComponent implements OnInit {

  constructor(onboardingService: OnBoardingService, router: Router, configService: ConfigService) {
    super(onboardingService, router, configService);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  btnProfileImgClick() {
    $('#profile-img').click()
  }
}