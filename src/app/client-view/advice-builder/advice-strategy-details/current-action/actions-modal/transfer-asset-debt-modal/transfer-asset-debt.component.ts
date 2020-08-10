import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Router } from '@angular/router';
import { TransferAssetToDebtActionModel } from '../../../../../models';
import { OptionModel } from '../../../../../../on-boarding/models';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
declare var $: any;

@Component({
  selector: 'transfer-asset-debt',
  templateUrl: './transfer-asset-debt.component.html',
  styleUrls: ['./transfer-asset-debt.component.css'],
})
export class TransferAssetDebtModalComponent implements OnInit {

  @Input() updateAssetToDebt: TransferAssetToDebtActionModel = new TransferAssetToDebtActionModel();
  @Input() activeAssetList: any[] = [];
  @Input() activeDebtList: any[] = [];

  private selectOnYearTyping = false;
  private typingYear: number;
  private amount: string = "";
  private iSub: ISubscription;
  private assetToDebt: TransferAssetToDebtActionModel = new TransferAssetToDebtActionModel();
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router,
  ) { }


  ngOnInit() {
    $('#transfer-asset-debt').on('hidden.bs.modal', () => {
      this.resetInputValue();
      $('#transfer-asset-debt-details').click();
    });

    // if create new action we clear old input data
    $('#transfer-asset-debt').on('shown.bs.modal', () => {
      if (!this.adviceBuilderService.isUpdateAction) {
        this.assetToDebt = new TransferAssetToDebtActionModel();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.updateAssetToDebt && changes.updateAssetToDebt.currentValue) {
      this.assetToDebt = JSON.parse(JSON.stringify(this.updateAssetToDebt));

      if (this.assetToDebt.amount || this.assetToDebt.amount == 0) {
        this.amount = this.returnCurrenyFormat(this.assetToDebt.amount.toString());
      }
      // check "year" close asset is current year check or input
      this.selectOnYearTyping = this.isSelectingOnYearTyping();
      if (this.selectOnYearTyping) { this.typingYear = this.assetToDebt.year; }
      else { this.typingYear = undefined }
    }
  }


  ngOnDestroy() {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }

  private onYearClick(type: number) {
    if (type == 1) { // select year currently
      this.selectOnYearTyping = false;
      // reset value of typing year on view
      this.typingYear = undefined;
    } else {
      this.selectOnYearTyping = true;
      this.typingYear = undefined;
    }
  }

  private saveChangesAssetToDebt() {
    let houseHoldId = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldId || !selectedStrategyID) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      // update value of year if user choose typing for year
      if (this.selectOnYearTyping) { this.assetToDebt.year = this.typingYear; }
      else { this.assetToDebt.year = new Date().getFullYear(); }

      let selectedAsset = this.activeAssetList.filter(asset => asset.id == this.assetToDebt.assetId);
      let assetName = selectedAsset[0].name;
      let debtName = this.activeDebtList.filter(debt => debt.id == this.assetToDebt.debtId)[0].name;
      this.assetToDebt.actionTitle = assetName;
      // current balance asset > amount
      if (this.checkAvailableCurrentBalance(selectedAsset[0])) {
        this.transferAssetToDebt(houseHoldId, selectedStrategyID);
      } else { //can't create draw fund
        let ISub: ISubscription = this.confirmationDialogService.showModal({
          title: "Validation error",
          message: "Amount to transfer can't greater than current asset amount ($" + selectedAsset[0].accountBalance + ')',
          btnOkText: "Ok"
        }).subscribe(res => {
          ISub.unsubscribe();
        })
      }
    }
  }

  private transferAssetToDebt(houseHoldId, selectedStrategyID) {
    this.adviceBuilderService.showLoading()
    $('#transfer-asset-debt').modal('hide');
    let observable: Observable<any>[] = [];
    if (this.adviceBuilderService.isUpdateAction) {
      observable.push(this.adviceBuilderService.updateTransferAssetDebt(houseHoldId, selectedStrategyID, this.assetToDebt));
    } else {
      observable.push(this.adviceBuilderService.createTransferFundAssetToDebt(houseHoldId, selectedStrategyID, this.assetToDebt));
    }
    this.iSub = Observable.zip.apply(null, observable).subscribe(response => {
      if (this.iSub) {
        this.iSub.unsubscribe();
      }
      this.adviceBuilderService.hideLoading();
      if (response && response.length > 0) {
        if (response[0].success) {
          //update current strategy actions
          this.adviceBuilderService.reloadActionsAndAsset();
        } else {
          this.handleErrorMessageService.handleErrorResponse(response[0]);
        }
      }
    });
  }

  private checkAvailableCurrentBalance(asset: any) {
    if (asset && asset.accountBalance < this.assetToDebt.amount) {
      return false;
    }
    return true;
  }

  private getAssetName(assetId: string) {
    if (!this.activeAssetList) return;
    let sourceAsset = this.activeAssetList.filter(source => source.id == assetId);
    return sourceAsset && sourceAsset.length > 0 ? sourceAsset[0].name : 'undefined asset'
  }

  private getDebtName(debtId: string) {
    if (!this.activeDebtList) return;
    let sourceDebt = this.activeDebtList.filter(source => source.id == debtId);
    return sourceDebt && sourceDebt.length > 0 ? sourceDebt[0].name : 'undefined debt'
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
      this.assetToDebt.amount = value.replace(/[^0-9.`-]+/g, "");
    }
  }

  private returnCurrenyFormat(number: string) {
    return '$' + number.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  private viewDetectChange() {
    let viewChange = false;
    // only detect when update action
    if (this.adviceBuilderService.updateAssetAction) {
      if (this.selectOnYearTyping != this.isSelectingOnYearTyping() ||
        this.assetToDebt.amount != this.updateAssetToDebt.amount ||
        (this.selectOnYearTyping == true && this.typingYear != this.updateAssetToDebt.year) ||
        this.assetToDebt.assetId != this.updateAssetToDebt.assetId ||
        this.assetToDebt.debtId != this.updateAssetToDebt.debtId ||
        this.checkUndefinedValue(this.assetToDebt.details) != this.checkUndefinedValue(this.updateAssetToDebt.details) ||
        this.checkUndefinedValue(this.assetToDebt.reason) != this.checkUndefinedValue(this.updateAssetToDebt.reason) ||
        this.checkUndefinedValue(this.assetToDebt.result) != this.checkUndefinedValue(this.updateAssetToDebt.result)
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
    if (this.assetToDebt.year == new Date().getFullYear() && this.adviceBuilderService.isUpdateAction) {
      return false;
    } else if (this.assetToDebt.year) {
      return true;
    }
    return false;
  }


  private resetInputValue() {
    this.assetToDebt = new TransferAssetToDebtActionModel();
    this.selectOnYearTyping = false;
    this.adviceBuilderService.isUpdateAction = false; // mean create new
    this.typingYear = undefined;
    this.amount = undefined;
  }

}
