import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NguUtilityModule } from 'ngu-utility';
import { CommonViewModule } from '../common-view.module';
import {
  PopoverComponent,
  CashflowDetailsComponent,
  ClientViewHeaderComponent,
  FpCirleImgComponent,
  SlideItemComponent,
  NewGoalButtonComponent,
  NewActionButtonComponent,
  ClientAssetsDebtsComponent,
  ClientCashFlowComponent,
  PersonalProtectionComponent,
  AssetProjectionOverlayComponent,
  DebtsProjectionsOverlayComponent,
  DebtProjectionDetailsComponent,
  InsuranceProjectionDetailsComponent,
  AssetProjectionsDetailComponent,
  MemberCardComponent,
  GoalModalComponent,
  SpendingGoalTypeComponent,
  NonSpendingGoalTypeComponent,
  IncomeGoalTypeComponent,
  SpendingGoalTypeViewComponent,
  NonSpendingGoalTypeViewComponent,
  IncomeGoalTypeViewComponent,
  TimelineV2Component,
  TimelineMobileComponent,
  RetirementGoalTypeComponent,
  RetirementGoalTypeViewComponent,
  SideBarMenuComponent,
  TotalBannerComponent,
} from './common';
import { AdviceBuilderService } from './advice-builder/advice-builder.service';
import { TimelineV2Service } from './common/timeline_v2/timeline_v2.service';

@NgModule({
  imports: [
    CommonModule,
    CommonViewModule,
    NguUtilityModule,
    FormsModule,
  ],
  declarations: [
    ClientViewHeaderComponent,
    SlideItemComponent,
    FpCirleImgComponent,
    NewActionButtonComponent,
    GoalModalComponent,
    SpendingGoalTypeComponent,
    NonSpendingGoalTypeComponent,
    IncomeGoalTypeComponent,
    SpendingGoalTypeViewComponent,
    NonSpendingGoalTypeViewComponent,
    IncomeGoalTypeViewComponent,
    RetirementGoalTypeComponent,
    RetirementGoalTypeViewComponent,

    TimelineMobileComponent,
    TimelineV2Component,
    PopoverComponent,
    ClientAssetsDebtsComponent,
    ClientCashFlowComponent,
    PersonalProtectionComponent,
    MemberCardComponent,
    AssetProjectionsDetailComponent,
    AssetProjectionOverlayComponent,
    DebtsProjectionsOverlayComponent,
    DebtProjectionDetailsComponent,
    InsuranceProjectionDetailsComponent,
    CashflowDetailsComponent,
    NewGoalButtonComponent,
    SideBarMenuComponent,
    TotalBannerComponent,
    
  ],
  exports: [
    ClientViewHeaderComponent,
    SlideItemComponent,
    FpCirleImgComponent,
    GoalModalComponent,
    SpendingGoalTypeComponent,
    NonSpendingGoalTypeComponent,
    IncomeGoalTypeComponent,
    SpendingGoalTypeViewComponent,
    NonSpendingGoalTypeViewComponent,
    IncomeGoalTypeViewComponent,
    RetirementGoalTypeComponent,
    RetirementGoalTypeViewComponent,

    TimelineMobileComponent,
    TimelineV2Component,
    PopoverComponent,
    NguUtilityModule,
    ClientAssetsDebtsComponent,
    ClientCashFlowComponent,
    PersonalProtectionComponent,
    MemberCardComponent,
    AssetProjectionsDetailComponent,
    AssetProjectionOverlayComponent,
    DebtsProjectionsOverlayComponent,
    DebtProjectionDetailsComponent,
    InsuranceProjectionDetailsComponent,
    CashflowDetailsComponent,
    NewGoalButtonComponent,
    NewActionButtonComponent,
    SideBarMenuComponent,
    TotalBannerComponent,

  ],
  providers: [
    AdviceBuilderService,
    TimelineV2Service
  ]
})
export class ClientViewSharedModule { }
