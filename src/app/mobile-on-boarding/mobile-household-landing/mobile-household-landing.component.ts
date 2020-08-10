import { Component, OnInit } from "@angular/core";
import { HouseholdLandingComponent } from '../../on-boarding/household-landing/household-landing.component';
import { Router } from '@angular/router';
import { OnBoardingService } from '../../on-boarding/on-boarding.service';

declare var $: any;
@Component({
    selector: "app-mobile-landing",
    templateUrl: "./mobile-household-landing.component.html",
    styleUrls: ["./mobile-household-landing.component.css"]
})
export class MobileHouseholdLandingComponent extends HouseholdLandingComponent implements OnInit {
    constructor(onboardingService: OnBoardingService, router: Router) {
        super(onboardingService, router);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    onSwipeLeft(evt) {
        $("#myCarousel").carousel("next");
    }

    onSwipeRight(evt) {
        $("#myCarousel").carousel("prev");
    };
}  