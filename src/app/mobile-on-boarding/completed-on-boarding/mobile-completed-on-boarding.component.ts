import { Component, OnInit } from '@angular/core';
import { CompletedOnBoardingComponent } from '../../on-boarding/completed-on-boarding/completed-on-boarding.component';
import { OnBoardingService } from '../../on-boarding/on-boarding.service';


@Component({
  selector: 'app-mobile-completed-on-boarding',
  templateUrl: './mobile-completed-on-boarding.component.html',
  styleUrls: ['./mobile-completed-on-boarding.component.css']
})
export class MobileCompletedOnBoardingComponent extends CompletedOnBoardingComponent implements OnInit {

  constructor(onBoardingService: OnBoardingService) {
    super(onBoardingService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

}
