import { Component, OnInit, OnDestroy } from "@angular/core";
import { OnBoardingService } from '../on-boarding/on-boarding.service';
import { Router } from '@angular/router';
import { OnBoardingComponent } from '../on-boarding/on-boarding.component';
import { HeaderService } from '../common/components/header/header.service';

declare var $: any;

@Component({
  selector: "app-on-boarding",
  templateUrl: "./mobile-on-boarding.component.html",
  styleUrls: ["./mobile-on-boarding.component.css"]
})
export class MobileOnBoardingComponent extends OnBoardingComponent implements OnInit, OnDestroy {
  constructor(onboardingService: OnBoardingService, router: Router, headerService: HeaderService) {
    super(onboardingService, router, headerService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
