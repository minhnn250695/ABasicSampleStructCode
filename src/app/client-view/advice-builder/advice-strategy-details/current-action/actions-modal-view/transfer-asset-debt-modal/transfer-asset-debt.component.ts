import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Router } from '@angular/router';
import { TransferAssetToDebtActionModel } from '../../../../../models';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
declare var $: any;

@Component({
  selector: 'transfer-asset-debt-view-modal',
  templateUrl: './transfer-asset-debt.component.html',
  styleUrls: ['./transfer-asset-debt.component.css'],
})
export class TransferAssetDebtViewModalComponent implements OnInit {

  @Input() assetToDebt: TransferAssetToDebtActionModel = new TransferAssetToDebtActionModel();
  @Input() activeAssetList: any[] = [];
  @Input() activeDebtList: any[] = [];

  private selectOnYearTyping = false;
  private typingYear: number;
  private amount: string = "";
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router,
  ) { }


  ngOnInit() {
    $('#transfer-asset-debt-view').on('hidden.bs.modal', () => {
      $('#transfer-asset-debt-details-view').click();
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

  private getDebtName(debtId: string) {
    if (!this.activeDebtList) return;
    let sourceDebt = this.activeDebtList.filter(source => source.id == debtId);
    return sourceDebt && sourceDebt.length > 0 ? sourceDebt[0].name : 'N/A'
  }
}
