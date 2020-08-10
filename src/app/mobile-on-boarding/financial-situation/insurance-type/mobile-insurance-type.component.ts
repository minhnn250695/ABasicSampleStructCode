import { Component, OnInit, Output, EventEmitter, OnDestroy } from "@angular/core";
import { OnBoardingService } from '../../../on-boarding/on-boarding.service';
import { HandleFinancialSituationService } from '../../../on-boarding/financial-situation/handle-financial-situation.service';
import { InsuranceTypeComponent } from '../../../on-boarding/financial-situation/insurance-type/insurance-type.component';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: "app-mobile-insurance-type",
  templateUrl: "./mobile-insurance-type.component.html",
  styleUrls: ["./mobile-insurance-type.component.css"]
})

export class MobileInsuranceTypeComponent extends InsuranceTypeComponent implements OnInit, OnDestroy {

  constructor(
    onboardingService: OnBoardingService, 
    confirmationDialogService: ConfirmationDialogService,
    _financialService: HandleFinancialSituationService) {
    super(onboardingService, confirmationDialogService, _financialService);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

}
