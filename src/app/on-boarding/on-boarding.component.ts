import { Component, OnInit, OnDestroy } from "@angular/core";
import { BaseComponentComponent } from "../common/components/base-component";
import { OnBoardingService } from './on-boarding.service';
import { Router } from '@angular/router';
import { HeaderService } from '../common/components/header/header.service';

declare var $: any;

@Component({
  selector: "app-on-boarding",
  templateUrl: "./on-boarding.component.html",
  styleUrls: ["./on-boarding.component.css"]
})
export class OnBoardingComponent extends BaseComponentComponent implements OnInit, OnDestroy {

  constructor(private onboardingService: OnBoardingService,
    private router: Router,
    private headerService: HeaderService) {
    super();
    // update header observable
    this.onboardingService.updateHeader().subscribe(() => {
      this.headerService.updateCompanyLogoRequest.next(true);
    });
    // get product provider list
    this.onboardingService.getProductProviderList().subscribe(res => {
      if (res.success) {
        this.onboardingService.productProviders = res.data.data;
      }
    }, error => {
      console.log(error);
    });
  }

  ngOnInit() {
    super.initTooltip();
    super.checkUsingMobile();
    super.scrollTop();
    // Navigate to suitable page
    if (this.isMobile) {
      this.router.navigate(["mobile-on-boarding/"]);
    } else {
      this.router.navigate(["on-boarding/"]);
    }
  }

  ngOnDestroy() {
    this.onboardingService.clear();
  }
}
