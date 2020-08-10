import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// services
import { CommonViewModule } from '../../common-view.module';
import { MaterialDefModule } from '../../common/modules/material.module';
import { ClientViewSharedModule } from '../client-view-shared.module';
import { AdviceBuilderRoutingModule } from './advice-builder-routing.module';
import { OnBoardingService } from '../../on-boarding/on-boarding.service';

import { AdviceBuilderComponent } from './advice-builder.component';
import { AdviceStrategyDetailsComponent } from "./advice-strategy-details/advice-strategy-details.component";
import { CurrentActionComponent } from './advice-strategy-details/current-action/current-action.component';
import { FormsModule } from '@angular/forms';
import { AdviceBuilderService } from './advice-builder.service';
import { StrategyGeneralInformationComponent } from './advice-strategy-details/strategy-general-information/strategy-general-information.component';
import { LandingService } from '../../landing/landing.service';

// actions modal for edit
import { AssetModalComponent } from './advice-strategy-details/current-action/actions-modal/asset-modal/asset-modal.component';
import { DebtModalComponent } from './advice-strategy-details/current-action/actions-modal/debt-modal/debt-modal.component';
import { InsuranceModalComponent } from './advice-strategy-details/current-action/actions-modal/insurance-modal/insurance-modal.component';
import { CancelInsuranceModalComponent } from './advice-strategy-details/current-action/actions-modal/cancel-insurance-modal/cancel-insurance.component';
import { CloseAssetModalComponent } from './advice-strategy-details/current-action/actions-modal/close-asset-modal/close-asset-modal.component';
import { TransferAssetDebtModalComponent } from './advice-strategy-details/current-action/actions-modal/transfer-asset-debt-modal/transfer-asset-debt.component';
import { TransferAssetToAssetComponent } from './advice-strategy-details/current-action/actions-modal/transfer-asset-to-asset-modal/transfer-asset-to-asset.component';
import { InsuranceBenefitComponent } from './advice-strategy-details/current-action/actions-modal/insurance-modal/insurance-benefit/insurance-benefit.component';
import { ActionTrashModalComponent } from './advice-strategy-details/current-action/actions-modal/action-trash-modal/action-trash-modal.component';
import { ContributeFundsToDebtModalComponent } from './advice-strategy-details/current-action/actions-modal/contribute-funds-to-debt-modal/contribute-funds-to-debt-modal.component';
import { ContributeFundsToAssetModalComponent } from './advice-strategy-details/current-action/actions-modal/contribute-funds-to-asset-modal/contribute-funds-to-asset-modal.component';
import { DrawFundsFromDebtModalComponent } from './advice-strategy-details/current-action/actions-modal/draw-funds-from-debt-modal/draw-funds-from-debt-modal.component';
import { DrawFundsFromAssetModalComponent } from './advice-strategy-details/current-action/actions-modal/draw-funds-from-asset-modal/draw-funds-from-asset-modal.component';

// all actions modal for view
import { AssetViewModalComponent } from './advice-strategy-details/current-action/actions-modal-view/asset-modal/asset-modal.component';
import { DebtViewModalComponent } from './advice-strategy-details/current-action/actions-modal-view/debt-modal/debt-modal.component';
import { InsuranceViewModalComponent } from './advice-strategy-details/current-action/actions-modal-view/insurance-modal/insurance-modal.component';
import { CancelInsuranceViewModalComponent } from './advice-strategy-details/current-action/actions-modal-view/cancel-insurance-modal/cancel-insurance.component';
import { CloseAssetViewModalComponent } from './advice-strategy-details/current-action/actions-modal-view/close-asset-modal/close-asset-modal.component';
import { TransferAssetDebtViewModalComponent } from './advice-strategy-details/current-action/actions-modal-view/transfer-asset-debt-modal/transfer-asset-debt.component';
import { TransferAssetToAssetViewComponent } from './advice-strategy-details/current-action/actions-modal-view/transfer-asset-to-asset-modal/transfer-asset-to-asset.component';
import { InsuranceBenefitViewComponent } from './advice-strategy-details/current-action/actions-modal-view/insurance-modal/insurance-benefit/insurance-benefit.component';
import { ContributeFundsToDebtViewModalComponent } from './advice-strategy-details/current-action/actions-modal-view/contribute-funds-to-debt-modal/contribute-funds-to-debt-modal.component';
import { ContributeFundsToAssetViewModalComponent } from './advice-strategy-details/current-action/actions-modal-view/contribute-funds-to-asset-modal/contribute-funds-to-asset-modal.component';
import { DrawFundsFromDebtViewModalComponent } from './advice-strategy-details/current-action/actions-modal-view/draw-funds-from-debt-modal/draw-funds-from-debt-modal.component';
import { DrawFundsFromAssetViewModalComponent } from './advice-strategy-details/current-action/actions-modal-view/draw-funds-from-asset-modal/draw-funds-from-asset-modal.component';

import { CompareStrategiesComponent } from './compare-strategies/compare-strategies.component';

@NgModule({
  imports: [
    CommonModule,
    CommonViewModule,
    AdviceBuilderRoutingModule,
    MaterialDefModule,
    ClientViewSharedModule,
    FormsModule,

  ],
  declarations: [
    AdviceBuilderComponent,
    AdviceStrategyDetailsComponent,
    CurrentActionComponent,
    StrategyGeneralInformationComponent,

    // action modal for edit
    AssetModalComponent,
    DebtModalComponent,
    InsuranceModalComponent,
    CancelInsuranceModalComponent,
    CloseAssetModalComponent,
    TransferAssetDebtModalComponent,
    TransferAssetToAssetComponent,    
    InsuranceBenefitComponent,
    ActionTrashModalComponent,
    ContributeFundsToDebtModalComponent,
    ContributeFundsToAssetModalComponent,
    DrawFundsFromDebtModalComponent,
    DrawFundsFromAssetModalComponent,

    // action modal for view
    AssetViewModalComponent,
    DebtViewModalComponent,
    InsuranceViewModalComponent,
    CancelInsuranceViewModalComponent,
    CloseAssetViewModalComponent,
    TransferAssetDebtViewModalComponent,
    TransferAssetToAssetViewComponent,    
    InsuranceBenefitViewComponent,
    ContributeFundsToDebtViewModalComponent,
    ContributeFundsToAssetViewModalComponent,
    DrawFundsFromDebtViewModalComponent,
    DrawFundsFromAssetViewModalComponent,
    
    CompareStrategiesComponent,
  ],
  providers: [
    AdviceBuilderService,
    OnBoardingService,
    LandingService
  ]
})
export class AdviceBuilderModule { }
