import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { OnBoardingComponent } from "./on-boarding.component";
import { OnBoardingRoutingModule } from "./on-boarding-routing.module";
import { CommonViewModule } from "../common-view.module";
import { TooltipModule } from "ngx-tooltip";
import { PersonalInformationComponent } from "./personal-information/personal-information.component";
import { FamilyMemberComponent } from "./family-member/family-member.component";

import { HouseholdLandingComponent } from "./household-landing/household-landing.component";
import { OnBoardingService } from "./on-boarding.service";
import { MaterialDefModule } from "../common/modules/material.module";
import { FinancialSituationComponent } from "./financial-situation/financial-situation.component";
import { AssetTypeComponent } from "./financial-situation/asset-type/asset-type.component";
import { DebtTypeComponent } from "./financial-situation/debt-type/debt-type.component";
import { InsuranceTypeComponent } from "./financial-situation/insurance-type/insurance-type.component";
import { InsuranceBenefitsComponent } from "./financial-situation/insurance-type/insurance-benefits/insurance-benefits.component";
import { TaxComponent } from "./financial-situation/family-cashflow/expense/tax/tax.component";
import { HouseholdSpendingComponent } from "./financial-situation/family-cashflow/expense/household-spending/household-spending.component";
import { IncomeComponent } from "./financial-situation/family-cashflow/income/income.component";
import { ExpenseComponent } from "./financial-situation/family-cashflow/expense/expense.component";
import { HandleFinancialSituationService } from './financial-situation/handle-financial-situation.service';
import { FamilyCashFlowComponent } from './financial-situation/family-cashflow/family-cashflow.component';
import { YourGoalComponent } from './your-goal/your-goal.component';
import { YourGoalService } from './your-goal/your-goal.service';
import { CompletedOnBoardingComponent } from './completed-on-boarding/completed-on-boarding.component';
import { WaitingComponent } from './waiting/waiting.component';
import { PopoverModule } from 'ngx-popover';
@NgModule({
  imports: [
    CommonModule,
    CommonViewModule,
    OnBoardingRoutingModule,
    TooltipModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialDefModule,
    PopoverModule
  ],
  exports: [],
  declarations: [
    OnBoardingComponent,
    PersonalInformationComponent,
    FamilyMemberComponent,
    HouseholdLandingComponent,
    FinancialSituationComponent,
    AssetTypeComponent,
    DebtTypeComponent,
    InsuranceTypeComponent,
    InsuranceBenefitsComponent,
    TaxComponent,
    HouseholdSpendingComponent,
    IncomeComponent,
    ExpenseComponent,
    YourGoalComponent,
    CompletedOnBoardingComponent,
    FamilyCashFlowComponent,
    WaitingComponent,
  ],
  providers: [
    OnBoardingService,
    HandleFinancialSituationService,
    YourGoalService,
  ]
})
export class OnBoardingModule { }
