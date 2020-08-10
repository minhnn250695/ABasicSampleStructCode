import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { OptionModel } from '../../../../../../on-boarding/models';
import { TransferAssetToAssetModel } from '../../../../../models';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
declare var $: any;

@Component({
  selector: 'transfer-asset-to-asset-view-modal',
  templateUrl: './transfer-asset-to-asset.component.html',
  styleUrls: ['./transfer-asset-to-asset.component.css'],
})
export class TransferAssetToAssetViewComponent implements OnInit {

  @Input() twoAsset: TransferAssetToAssetModel = new TransferAssetToAssetModel();
  @Input() activeAssetList: any[] = [];
  private selectOnYearTyping = false;
  private typingYear: number;
  private amount: string = "";

  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private router: Router,
  ) { }


  ngOnInit() {
    $('#transfer-two-asset-view').on('hidden.bs.modal', () => {
      $('#transfer-two-asset-details').click();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
   
  }

  ngOnDestroy() {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }


  private getAssetName(assetId: string) {
    if (!this.activeAssetList) return;
    let sourceAsset = this.activeAssetList.filter(source => source.id == assetId);
    return sourceAsset && sourceAsset.length > 0 ? sourceAsset[0].name : 'N/A'
  }
}
