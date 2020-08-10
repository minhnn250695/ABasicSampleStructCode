import { Component, OnInit } from '@angular/core';
import { Router } from '../../../../node_modules/@angular/router';
import { YourGoalComponent } from '../../on-boarding/your-goal/your-goal.component';
import { YourGoalService } from '../../on-boarding/your-goal/your-goal.service';
import { OnBoardingService } from '../../on-boarding/on-boarding.service';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';

declare var $: any;
@Component({
  selector: 'app-mobile-your-goal',
  templateUrl: './mobile-your-goal.component.html',
  styleUrls: ['./mobile-your-goal.component.css']
})
export class MobileYourGoalComponent extends YourGoalComponent implements OnInit {

  constructor(
    clientGoalService: YourGoalService,
    onBoardingService: OnBoardingService,
    route: Router,
    confirmationDialogService: ConfirmationDialogService) {
    super(clientGoalService, onBoardingService, route, confirmationDialogService);

  }

  ngOnInit() {
    super.ngOnInit();
  }
}
