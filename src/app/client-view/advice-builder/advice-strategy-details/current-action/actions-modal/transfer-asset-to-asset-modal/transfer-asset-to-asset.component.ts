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
  selector: 'transfer-asset-to-asset-modal',
  templateUrl: './transfer-asset-to-asset.component.html',
  styleUrls: ['./transfer-asset-to-asset.component.css'],
})
export class TransferAssetToAssetComponent implements OnInit {

  @Input() updateTwoAsset: TransferAssetToAssetModel = new TransferAssetToAssetModel();
  @Input() activeAssetList: any[] = [];

  private selectOnYearTyping = false;
  private typingYear: number;
  private assetToAsset: TransferAssetToAssetModel = new TransferAssetToAssetModel();
  private amount: string = "";
  private iSub: ISubscription;
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router,
  ) { }


  ngOnInit() {
    $('#transfer-asset-to-asset').on('hidden.bs.modal', () => {
      this.resetInputValue();
      $('#transfer-two-asset-details').click();
    });

    // if create new action we clear old input data
    $('#transfer-asset-to-asset').on('shown.bs.modal', () => {
      if (!this.adviceBuilderService.isUpdateAction) {
        this.assetToAsset = new TransferAssetToAssetModel();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.updateTwoAsset && changes.updateTwoAsset.currentValue) {
      this.assetToAsset = JSON.parse(JSON.stringify(this.updateTwoAsset));

      if (this.assetToAsset.amount || this.assetToAsset.amount == 0) {
        this.amount = this.returnCurrenyFormat(this.assetToAsset.amount.toString());
      }
      // check "year" close asset is current year check or input
      this.selectOnYearTyping = this.isSelectingOnYearTyping();
      if (this.selectOnYearTyping) { this.typingYear = this.assetToAsset.year; }
      else { this.typingYear = undefined }
    }
  }

  ngOnDestroy() {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }

  private getAssetName(assetId: string) {
    if (!this.activeAssetList) return;
    let sourceAsset = this.activeAssetList.filter(source => source.id == assetId);
    return sourceAsset && sourceAsset.length > 0 ? sourceAsset[0].name : 'undefined asset'
  }

  private onAmountFocus(value) {
    if (value && value != "") {
      this.amount = value.replace(/[^0-9.`-]+/g, "");
    }
  }

  private onAmountFocusOut(value) {
    if (value && value != "") {
      this.amount = this.returnCurrenyFormat(value);
    }
  }

  private onAmountKeyup(event) {
    let value = event.target && event.target.value;
    if (value && value != "") {
      this.assetToAsset.amount = value.replace(/[^0-9.`-]+/g, "");
    }
  }

  private returnCurrenyFormat(number: string) {
    return '$' + number.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  private onYearClick(type: number) {
    if (type == 1) { // select year currently
      this.selectOnYearTyping = false;
      // reset value of typing year on view
      this.typingYear = undefined;
    } else {
      this.selectOnYearTyping = true;
    }
  }

  private viewDetectChange() {
    let viewChange = false;
    // only detect when update action
    if (this.adviceBuilderService.updateAssetAction) {
      if (this.selectOnYearTyping != this.isSelectingOnYearTyping() ||
        this.assetToAsset.amount != this.updateTwoAsset.amount ||
        (this.selectOnYearTyping == true && this.typingYear != this.updateTwoAsset.year) ||
        this.assetToAsset.sourceId != this.updateTwoAsset.sourceId ||
        this.assetToAsset.targetId != this.updateTwoAsset.targetId ||
        this.checkUndefinedValue(this.assetToAsset.details) != this.checkUndefinedValue(this.updateTwoAsset.details) ||
        this.checkUndefinedValue(this.assetToAsset.reason) != this.checkUndefinedValue(this.updateTwoAsset.reason) ||
        this.checkUndefinedValue(this.assetToAsset.result) != this.checkUndefinedValue(this.updateTwoAsset.result)
      ) {
        viewChange = true;
      }
    }
    return viewChange;
  }

  private checkUndefinedValue(value) {
    return !value ? "" : value;
  }

  private isSelectingOnYearTyping() {
    if (this.assetToAsset.year == new Date().getFullYear() && this.adviceBuilderService.isUpdateAction) {
      return false;
    } else if (this.assetToAsset.year) {
      return true;
    }
    return false;
  }

  private saveChangesAssetToAsset() {
    let houseHoldId = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldId || !selectedStrategyID) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      // update value of year if user choose typing for year
      if (this.selectOnYearTyping) { this.assetToAsset.year = this.typingYear; }
      else { this.assetToAsset.year = new Date().getFullYear(); }

      let sourceAsset = this.activeAssetList.filter(source => source.id == this.assetToAsset.sourceId);
      this.assetToAsset.actionTitle = sourceAsset[0].name;
      // current balance asset > amount
      if (this.checkAvailableCurrentBalance(sourceAsset[0])) {
        this.transferTwoAsset(houseHoldId, selectedStrategyID);

      } else { //can't create draw fund
        let ISub: ISubscription = this.confirmationDialogService.showModal({
          title: "Validation error",
          message: "Amount to transfer can't greater than current source asset amount ($" + sourceAsset[0].accountBalance + ')',
          btnOkText: "Ok"
        }).subscribe(res => {
          ISub.unsubscribe();
        });
      }
    }
  }

  private transferTwoAsset(houseHoldId, selectedStrategyID) {
    this.adviceBuilderService.showLoading()
    $('#transfer-asset-to-asset').modal('hide');
    let observable: Observable<any>[] = [];
    if (this.adviceBuilderService.isUpdateAction) {
      observable.push(this.adviceBuilderService.updateTransferBetweenTwoAsset(houseHoldId, selectedStrategyID, this.assetToAsset));
    } else {
      observable.push(this.adviceBuilderService.createTransferFundTwoAssets(houseHoldId, selectedStrategyID, this.assetToAsset));
    }
    this.iSub = Observable.zip.apply(null, observable).subscribe(res => {
      this.adviceBuilderService.hideLoading();
      if (this.iSub) {
        this.iSub.unsubscribe();
      }
      if (res && res.length > 0) {
        if (res[0].success) {
          //update current strategy actions
          this.adviceBuilderService.reloadActionsAndAsset();
        } else {
          this.handleErrorMessageService.handleErrorResponse(res[0]);
        }
      }
    })
  }

  private checkAvailableCurrentBalance(asset: any) {
    if (asset && asset.accountBalance < this.assetToAsset.amount) {
      return false;
    }
    return true;
  }

  private resetInputValue() {
    this.assetToAsset = new TransferAssetToAssetModel();
    this.selectOnYearTyping = false;
    this.adviceBuilderService.isUpdateAction = false; // mean create new
    this.typingYear = undefined;
    this.amount = undefined;
  }

}
