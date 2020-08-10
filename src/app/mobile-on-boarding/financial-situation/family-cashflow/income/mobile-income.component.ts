import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { IncomeComponent } from '../../../../on-boarding/financial-situation/family-cashflow/income/income.component';
import { OnBoardingService } from '../../../../on-boarding/on-boarding.service';
import { HandleFinancialSituationService } from '../../../../on-boarding/financial-situation/handle-financial-situation.service';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';


declare var $: any;
@Component({
  selector: 'app-mobile-income',
  templateUrl: './mobile-income.component.html',
  styleUrls: ['./mobile-income.component.css']
})

export class MobileIncomeComponent extends IncomeComponent implements OnInit {

  constructor(onboardingService: OnBoardingService, _financialService: HandleFinancialSituationService, confirmationDialogService: ConfirmationDialogService) {
    super(onboardingService, _financialService, confirmationDialogService);

  }

  /**
   * Init view and data
   */
  ngOnInit() {
    super.ngOnInit();
  }
}
