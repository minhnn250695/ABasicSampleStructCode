import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';

// service
import { ClientViewService } from '../../client-view.service';
import { ClientAssetService } from '../../client-asset/client-asset.service';

import { ApiDataResult } from '../../../common/api/api-data-result';
import { BaseComponentComponent } from '../../../common/components/base-component';
import { AssetProjection, ClientAsset, ClientCalculation, Contact, TotalClientAssets } from '../../models';
import { HandleErrorMessageService } from '../../../common/services/handle-error.service';

declare var $: any;
@Component({
  selector: 'common-asset-projection-overlay',
  templateUrl: './asset-projection-overlay.component.html',
  styleUrls: ['./asset-projection-overlay.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AssetProjectionOverlayComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  @Input() showIcon: boolean = false;
  // @Input() enabledEdit: boolean = false;
  @Input() buttonShape: string = 'square';
  @Input() iconWidth: number = 20;
  @Input() iconHeight: number = 20;

  assetProjection: AssetProjection = new AssetProjection();
  txtYear: string;
  private totalAssets: TotalClientAssets;
  private currentDate = new Date();
  private rateInflation = 3;
  // additional investment
  // others
  private isClose: boolean = false;
  private clientCalculation: ClientCalculation;
  private houseHoldId: string;
  private errorObject: any;

  constructor(
    private clientViewService: ClientViewService,
    changeDetectorRef: ChangeDetectorRef,
    private handleErrorMessageService: HandleErrorMessageService) {
    super(null, changeDetectorRef);
  }

  ngOnInit() {
    this.initPopover();
    this.getHouseholdId();
    this.getInitialData();
  }

  ngOnDestroy() {
    this.isClose = true;
    this.hide();
  }

  getHouseholdId() {
    this.clientViewService.houseHoldObservable.subscribe(houseHold => {
      if (!houseHold) { return; }

      this.houseHoldId = houseHold.id;
    });
  }

  getInitialData() {
    if (!this.clientViewService.currentScenario.id) {
      this.clientViewService.getCurrentScenario(this.houseHoldId).subscribe(res => {
        this.initAssetProjectionModal();
      });
    }
    else
      this.initAssetProjectionModal();
  }

  initAssetProjectionModal() {
    // modal event
    $('#investment-assets').on('hidden.bs.modal', () => {
      this.hide();
    });

    $(".close-popover").click((e) => {
      this.hide();
    });

    // save data
    $('.save-changes-popover.asset-projection').click((e) => {
      this.hide();

      let txtYearToInvest = $(".popover #txtYearToInvest").val();
      let txtAmountInvested = $(".popover #txtAmountInvested").val();
      let txtInvestmentReturns = $(".popover #txtInvestmentReturns").val();
      let assetProjectionUpdate = {
        yearsToInvest: parseFloat(txtYearToInvest) || this.clientViewService.currentScenario.assetProjections.parameters.yearsToInvest,
        amountInvested: parseFloat(txtAmountInvested) || this.clientViewService.currentScenario.assetProjections.parameters.amountInvested,
        investmentReturns: parseFloat(txtInvestmentReturns) / 100 || this.clientViewService.currentScenario.assetProjections.parameters.investmentReturns
      };

      this.clientViewService.showLoading();
      this.clientViewService.updateAssetProjections(assetProjectionUpdate, this.houseHoldId).subscribe((response: ApiDataResult<AssetProjection>) => {
        this.clientViewService.hideLoading();
        if (response.success) {
          this.assetProjection = { ...response.data };
        } else {
          this.errorObject = response.error;
          $("#asset-projection-error").modal();
        }
        this.detectChange();
      });
    });
  }

  show() {
    $('#investment-assets').modal();
    this.assetProjection = this.cloneObject(this.clientViewService.currentScenario.assetProjections);
  }

  hideAssetProjection() {
    $('#investment-assets').modal('hide');
  }

  hide() {
    $('.popover').popover('hide');
  }
}
