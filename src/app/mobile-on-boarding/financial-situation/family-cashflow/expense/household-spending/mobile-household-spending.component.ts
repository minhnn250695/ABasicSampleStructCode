import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { HouseholdSpendingComponent } from '../../../../../on-boarding/financial-situation/family-cashflow/expense/household-spending/household-spending.component';
import { OnBoardingService } from '../../../../../on-boarding/on-boarding.service';
import { HandleFinancialSituationService } from '../../../../../on-boarding/financial-situation/handle-financial-situation.service';
import { ConfirmationDialogService } from '../../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';


declare var $: any;
@Component({
  selector: 'app-mobile-household-spending',
  templateUrl: './mobile-household-spending.component.html',
  styleUrls: ['./mobile-household-spending.component.css']
})

export class MobileHouseholdSpendingComponent extends HouseholdSpendingComponent implements OnInit {

  constructor(onboardingService: OnBoardingService, _financialService: HandleFinancialSituationService, confirmationDialogService: ConfirmationDialogService) {
    super(onboardingService, _financialService, confirmationDialogService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

}
