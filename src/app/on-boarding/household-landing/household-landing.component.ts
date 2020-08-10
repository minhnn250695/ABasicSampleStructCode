import { Component, OnInit } from "@angular/core";
import { OnBoardingService } from "../on-boarding.service";
import { Router } from '@angular/router';
import { HouseHoldResponse } from '../../client-view/models';
import { OnBoardingCommonComponent } from '../on-boarding-common.component';
@Component({
  selector: "app-household-landing",
  templateUrl: "./household-landing.component.html",
  styleUrls: ["./household-landing.component.css"]
})
export class HouseholdLandingComponent extends OnBoardingCommonComponent implements OnInit {

  householdJoint: string;
  step: number;
  household: any;

  constructor(protected onboardingService: OnBoardingService, protected router: Router) {
    super();
  }

  ngOnInit(): void {
    super.scrollTop();
    super.initTooltip();
    super.checkUsingMobile();
    this.onboardingService.getHouseHold().subscribe(response => {
      this.household = response;
      // store house hold to service
      this.onboardingService.storeHouseHold(response);
      // route to current step depends on returned field from getHouseHold api
      this.routeToCurrentStep(response);
    });
  }

  /**
   * get current step and navigate to that step
   * @param household
   */
  routeToCurrentStep(household: HouseHoldResponse) {
    if (!household.factFind) {
      this.router.navigate(["./client-view"])
    }
    let step = household.clientOnboardingStep;

    switch (step) {
      case 1:
        break;
      case 2:
        if (this.isMobile)
          this.router.navigate(["mobile-on-boarding/personal-information"]);
        else
          this.router.navigate(["on-boarding/personal-information"]);
        break;
      case 3:
        if (this.isMobile)
          this.router.navigate(["mobile-on-boarding/family-member"]);
        else
          this.router.navigate(["on-boarding/family-member"]);
        break;
      case 4:
        if (this.isMobile)
          this.router.navigate(["mobile-on-boarding/financial-situation"]);
        else
          this.router.navigate(["on-boarding/financial-situation"]);
        break;
      case 5:
        if (this.isMobile)
          this.router.navigate(["mobile-on-boarding/your-goal"]);
        else
          this.router.navigate(["on-boarding/your-goal"]);
        break;
      case 6:
        if (this.isMobile)
          this.router.navigate(["mobile-on-boarding/completed"]);
        else
          this.router.navigate(["on-boarding/completed"]);
        break;
    }
  }

  private navigateToStep(url: string) {
    this.router.navigate([url]);
  }
}
