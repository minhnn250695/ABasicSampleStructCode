import { Component, OnInit } from '@angular/core';
import { HouseHoldResponse } from '../../client-view/models';
import { OnBoardingService } from '../on-boarding.service';
import { OnBoardingCommonComponent } from '../on-boarding-common.component';

@Component({
  selector: 'app-completed-on-boarding',
  templateUrl: './completed-on-boarding.component.html',
  styleUrls: ['./completed-on-boarding.component.css']
})
export class CompletedOnBoardingComponent extends OnBoardingCommonComponent implements OnInit {

  private houseHold: HouseHoldResponse;
  onLoadComponent: boolean = true;

  constructor(private onBoardingService: OnBoardingService) {
    super();
  }

  ngOnInit() {
    this.myLoadingSpinner.closeImmediate();

    super.scrollTop();
    this.initTooltip();
    this.onBoardingService.updateCurrentStep(6);

    this.onBoardingService.getHouseHold().subscribe(res => {
      this.onLoadComponent = false;
      this.houseHold = res;
    });
  }

  updateFactFindStatus() {
    if (!this.houseHold && !this.houseHold.id) { return; }

    this.onBoardingService.updateStatusClientOnboardingComplete(this.houseHold.id).subscribe(res => {
    }, error => {
      console.log(error);
    });
  }
}
