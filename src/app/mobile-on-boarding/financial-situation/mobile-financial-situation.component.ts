import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { OnBoardingService } from '../../on-boarding/on-boarding.service';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { HandleFinancialSituationService } from '../../on-boarding/financial-situation/handle-financial-situation.service';
import { FinancialSituationComponent } from '../../on-boarding/financial-situation/financial-situation.component';
import { HandleErrorMessageService } from '../../common/services/handle-error.service';

declare var $: any;
@Component({
  selector: "app-mobile-financial-situation",
  templateUrl: "./mobile-financial-situation.component.html",
  styleUrls: ["./mobile-financial-situation.component.css"]
})
export class MobileFinancialSituationComponent extends FinancialSituationComponent implements OnInit {

  constructor(
    confirmationDialogService: ConfirmationDialogService,
    router: Router,
    onboardingService: OnBoardingService,
    _financialService: HandleFinancialSituationService,
    handleErrorMessageService: HandleErrorMessageService) {
    super(confirmationDialogService, router, onboardingService, _financialService, handleErrorMessageService);

  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  changeAssetArrow() {
    let assetsArrow = document.getElementById('assetArrow');
    assetsArrow.classList.toggle('active');
  }

  changeDebtsArrow() {
    let debtArrow = document.getElementById('debtArrow');
    debtArrow.classList.toggle('active');
  }

  changeIncomeExpensesArrow() {
    let incomeExpensesArrow = document.getElementById('incomeExpensesArrow');
    incomeExpensesArrow.classList.toggle('active');
  }

  changeInsuranceArrow() {
    let insuranceArrow = document.getElementById('insuranceArrow');
    insuranceArrow.classList.toggle('active');
  }

}
