import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DebtActionModel, DebtCategoryType, DebtType, DebtTypeAction, ContributeAssetActionModel } from '../../../../../models';
import { OptionModel } from '../../../../../../on-boarding/models';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Router } from '@angular/router';
import { OnBoardingService } from '../../../../../../on-boarding/on-boarding.service';
import { OnBoardingCommonComponent } from '../../../../../../on-boarding/on-boarding-common.component';
import { Pairs } from '../../../../../../revenue-import/models';
import { ConfirmationDialogService } from '../../../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Observable } from 'rxjs';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
declare var $: any;


@Component({
  selector: 'contribute-funds-to-asset-view-modal',
  templateUrl: './contribute-funds-to-asset-modal.component.html',
  styleUrls: ['./contribute-funds-to-asset-modal.component.css']
})
export class ContributeFundsToAssetViewModalComponent implements OnInit {

  // #region Properties
  @Input() notClosedAssetList: any[];
  @Input() contributeAsset: ContributeAssetActionModel = new ContributeAssetActionModel();
  private contributeTypeIsPreTax: boolean = false;

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
    $('#contribute-asset-view').on('hidden.bs.modal', () => {
      $('#contribute-funds-asset-details-view').click();
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

  private getContributeAssetName() {
    let assetName = '';
    if (this.notClosedAssetList && this.notClosedAssetList.length > 0) {
      const assetList = JSON.parse(JSON.stringify(this.notClosedAssetList));
      const assetRecord = assetList.filter(asset => asset.id == this.contributeAsset.assetId);
      assetName = (assetRecord && assetRecord.length > 0) ? assetRecord[0].name : '';
    }
    return assetName || 'N/A';
  }

  private getContributeTypeText() {
    if (this.contributeAsset.contributionType == 1) { //pre tax
      return "Pre-tax";
    } else {
      return "Post-tax";
    }
  }
}
