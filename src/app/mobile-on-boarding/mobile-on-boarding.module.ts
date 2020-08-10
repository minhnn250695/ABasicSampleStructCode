import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { MobileOnBoardingComponent } from "./mobile-on-boarding.component";
import { MobileOnBoardingRoutingModule } from "./mobile-on-boarding-routing.module";
import { CommonViewModule } from "../common-view.module";
import { TooltipModule } from "ngx-tooltip";

import { MobileHouseholdLandingComponent } from "./mobile-household-landing/mobile-household-landing.component";
import { MobilePersonalInformationComponent } from "./personal-information/mobile-personal-information.component";
import { OnBoardingService } from '../on-boarding/on-boarding.service';
import { MobileFamilyMemberComponent } from './family-member/mobile-family-member.component';
import { MobileFinancialSituationComponent } from './financial-situation/mobile-financial-situation.component';
import { HandleFinancialSituationService } from '../on-boarding/financial-situation/handle-financial-situation.service';
import { MobileYourGoalComponent } from './your-goal/mobile-your-goal.component';
import { YourGoalService } from '../on-boarding/your-goal/your-goal.service';
import { MobileCompletedOnBoardingComponent } from './completed-on-boarding/mobile-completed-on-boarding.component';
import { MobileHouseholdSpendingComponent } from './financial-situation/family-cashflow/expense/household-spending/mobile-household-spending.component';
import { MobileTaxComponent } from './financial-situation/family-cashflow/expense/tax/mobile-tax.component';
import { MobileExpenseComponent } from './financial-situation/family-cashflow/expense/mobile-expense.component';
import { MobileIncomeComponent } from './financial-situation/family-cashflow/income/mobile-income.component';
import { MobileFamilyCashFlowComponent } from './financial-situation/family-cashflow/mobile-family-cashflow.component';
import { MobileInsuranceBenefitsComponent } from './financial-situation/insurance-type/insurance-benefits/mobile-insurance-benefits.component';
import { MobileInsuranceTypeComponent } from './financial-situation/insurance-type/mobile-insurance-type.component';
import { MobileDebtTypeComponent } from './financial-situation/debt-type/mobile-debt-type.component';
import { MobileAssetTypeComponent } from './financial-situation/asset-type/mobile-asset-type.component';
import { WaitingComponent } from './waiting/waiting.component';

@NgModule({
  imports: [
    CommonModule,
    CommonViewModule,
    MobileOnBoardingRoutingModule,
    TooltipModule,
    FormsModule,
    ReactiveFormsModule,
    
  ],
  exports: [],
  declarations: [
    MobileOnBoardingComponent,
    MobileHouseholdLandingComponent,
    MobilePersonalInformationComponent,
    MobileFamilyMemberComponent,
    MobileFinancialSituationComponent,
    MobileYourGoalComponent,
    MobileCompletedOnBoardingComponent,
    MobileHouseholdSpendingComponent,
    MobileTaxComponent,
    MobileExpenseComponent,
    MobileIncomeComponent,
    MobileFamilyCashFlowComponent,
    MobileInsuranceBenefitsComponent,
    MobileInsuranceTypeComponent,
    MobileDebtTypeComponent,
    MobileAssetTypeComponent,
    WaitingComponent
  ],
  providers: [
    OnBoardingService, 
    HandleFinancialSituationService, 
    YourGoalService, 
  ]
})
export class MobileOnBoardingModule { }
