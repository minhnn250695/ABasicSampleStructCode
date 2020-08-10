import { Component, OnInit, Output, EventEmitter, OnDestroy } from "@angular/core";
import { DebtTypeComponent } from '../../../on-boarding/financial-situation/debt-type/debt-type.component';
import { OnBoardingService } from '../../../on-boarding/on-boarding.service';
import { HandleFinancialSituationService } from '../../../on-boarding/financial-situation/handle-financial-situation.service';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';


declare var $: any;
@Component({
  selector: "app-mobile-debt-type",
  templateUrl: "./mobile-debt-type.component.html",
  styleUrls: ["./mobile-debt-type.component.css"]
})
export class MobileDebtTypeComponent extends DebtTypeComponent implements OnInit, OnDestroy {

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