import { Component, OnInit } from "@angular/core";
import { OnBoardingService } from '../../../../on-boarding/on-boarding.service';
import { InsuranceBenefitsComponent } from '../../../../on-boarding/financial-situation/insurance-type/insurance-benefits/insurance-benefits.component';
import { HandleFinancialSituationService } from '../../../../on-boarding/financial-situation/handle-financial-situation.service';

@Component({
    selector: "app-mobile-insurance-benefits",
    templateUrl: "./mobile-insurance-benefits.component.html",
    styleUrls: ["./mobile-insurance-benefits.component.css"]
})

export class MobileInsuranceBenefitsComponent extends InsuranceBenefitsComponent implements OnInit {
    constructor(onboardingService: OnBoardingService, _financialService: HandleFinancialSituationService) {
        super(onboardingService, _financialService);
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
