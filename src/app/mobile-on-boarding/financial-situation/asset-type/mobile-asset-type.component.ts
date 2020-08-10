import { Component, OnInit, OnDestroy } from '@angular/core';
import { OnBoardingService } from '../../../on-boarding/on-boarding.service';
import { HandleFinancialSituationService } from '../../../on-boarding/financial-situation/handle-financial-situation.service';
import { AssetTypeComponent } from '../../../on-boarding/financial-situation/asset-type/asset-type.component';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';

declare var $: any;
@Component({
  selector: 'app-mobile-asset-type',
  templateUrl: './mobile-asset-type.component.html',
  styleUrls: ['./mobile-asset-type.component.css']
})
export class MobileAssetTypeComponent extends AssetTypeComponent implements OnInit, OnDestroy {

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