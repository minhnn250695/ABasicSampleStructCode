import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TaxComponent } from '../../../../../on-boarding/financial-situation/family-cashflow/expense/tax/tax.component';
import { OnBoardingService } from '../../../../../on-boarding/on-boarding.service';
import { HandleFinancialSituationService } from '../../../../../on-boarding/financial-situation/handle-financial-situation.service';


@Component({
  selector: 'app-mobile-tax',
  templateUrl: './mobile-tax.component.html',
  styleUrls: ['./mobile-tax.component.css']
})
export class MobileTaxComponent extends TaxComponent implements OnInit {

  constructor(onboardingService: OnBoardingService, _financialService: HandleFinancialSituationService) {
    super(onboardingService, _financialService);
  }

  ngOnInit() {
    super.ngOnInit()
  }

}
