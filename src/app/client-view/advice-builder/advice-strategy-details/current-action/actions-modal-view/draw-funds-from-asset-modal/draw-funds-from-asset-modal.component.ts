import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DebtActionModel, DebtCategoryType, DebtType, DebtTypeAction, DrawFundFromAssetModel } from '../../../../../models';
import { OptionModel } from '../../../../../../on-boarding/models';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Router } from '@angular/router';
import { OnBoardingService } from '../../../../../../on-boarding/on-boarding.service';
import { OnBoardingCommonComponent } from '../../../../../../on-boarding/on-boarding-common.component';
import { Pairs } from '../../../../../../revenue-import/models';
import { ConfirmationDialogService } from '../../../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
declare var $: any;

@Component({
  selector: 'draw-funds-from-asset-view-modal',
  templateUrl: './draw-funds-from-asset-modal.component.html',
  styleUrls: ['./draw-funds-from-asset-modal.component.css']
})
export class DrawFundsFromAssetViewModalComponent implements OnInit {


  // #region Properties
  @Input() notClosedAssetList: any[];
  @Input() drawAsset: DrawFundFromAssetModel = new DrawFundFromAssetModel();

  // #endregion Properties

  // #region Contructor
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private router: Router,
    private onBoardingService: OnBoardingService,
    private confirmationDialogService: ConfirmationDialogService
  ) { }

  ngOnInit() {

    $('#draw-asset-view').on('hidden.bs.modal', () => {
      $('#draw-fund-asset-details-view').click();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
  }


  ngOnDestroy() {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }
  // #endregion
  
  private getDrawAssetName() {
    let assetName = '';
    if (this.notClosedAssetList && this.notClosedAssetList.length > 0) {
      const assetList = JSON.parse(JSON.stringify(this.notClosedAssetList));
      const assetRecord = assetList.filter(asset => asset.id == this.drawAsset.assetId);
      assetName = (assetRecord && assetRecord.length > 0) ? assetRecord[0].name : '';
    }
    return assetName || 'N/A';
  }

}
