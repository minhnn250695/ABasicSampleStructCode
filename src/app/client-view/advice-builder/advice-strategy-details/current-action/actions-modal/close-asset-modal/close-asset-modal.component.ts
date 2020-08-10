import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CloseAssetActionModel } from '../../../../../models';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
import { ISubscription } from 'rxjs/Subscription';
import { ClientViewService } from '../../../../../client-view.service';

declare var $: any;

@Component({
  selector: 'close-asset-modal',
  templateUrl: './close-asset-modal.component.html',
  styleUrls: ['./close-asset-modal.component.css'],
})
export class CloseAssetModalComponent implements OnInit {

  @Input() updateCloseAsset: CloseAssetActionModel = new CloseAssetActionModel();
  @Input() activeAssetNotClosedList: any[] = [];
  @Input() closedAssetList: any[] = [];

  private selectOnYearTyping: boolean = false;
  private typingYear: number;
  private selectedAsset = { id: "", name: "", accountBalance: 0 };
  private closeAsset: CloseAssetActionModel = new CloseAssetActionModel();

  private assetListToUpdate: any[] = [];
  private assetListToClose: any[] = [];
  private iSub: ISubscription;

  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private clientService: ClientViewService,
    private router: Router,
  ) { }


  ngOnInit() {
    // this.selectOnYearTyping = false;
    $('#close-asset').on('hidden.bs.modal', () => {
      this.resetInputValue();
      $('#close-asset-details').click();
    });
  }

  ngOnDestroy() {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
    if (this.iSub) {
      this.iSub.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.updateCloseAsset && changes.updateCloseAsset.currentValue) {
      this.closeAsset = JSON.parse(JSON.stringify(this.updateCloseAsset));

      // check "year" close asset is current year check or input
      this.selectOnYearTyping = this.isSelectingOnYearTyping();
      if (this.selectOnYearTyping) { this.typingYear = this.closeAsset.year; }

      // check if closed asset need to show destination
      let cloneActiveAsset = [];
      if (this.closeAsset.year > new Date().getFullYear()) { // year in future then get asset from not close list
        cloneActiveAsset = JSON.parse(JSON.stringify(this.activeAssetNotClosedList));
      } { // year is current or in the past then get asset from close list
        cloneActiveAsset = JSON.parse(JSON.stringify(this.closedAssetList));
      }
      let updateAction = cloneActiveAsset.filter(asset => asset.id == this.closeAsset.assetId);
      this.selectedAsset = updateAction.length > 0 ? updateAction[0] : {};
    }
    if ((changes.activeAssetNotClosedList && changes.activeAssetNotClosedList.currentValue)
      || (changes.updateCloseAsset && changes.updateCloseAsset.currentValue)) {
      this.assetListToClose = this.activeAssetNotClosedList;
      this.assetListToUpdate = this.getAssetsForUpdate();
    }
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

  private viewDetectChange() {
    let viewChange = false;
    // check selecting on year change?
    if (!this.adviceBuilderService.isUpdateAction || // create new action always set change
      this.selectOnYearTyping != this.isSelectingOnYearTyping() ||
      (this.selectOnYearTyping == true && this.typingYear != this.updateCloseAsset.year) ||
      this.closeAsset.assetId != this.updateCloseAsset.assetId ||
      this.checkUndefinedValue(this.closeAsset.details) != this.checkUndefinedValue(this.updateCloseAsset.details) ||
      this.checkUndefinedValue(this.closeAsset.reason) != this.checkUndefinedValue(this.updateCloseAsset.reason) ||
      this.checkUndefinedValue(this.closeAsset.result) != this.checkUndefinedValue(this.updateCloseAsset.result) ||
      this.closeAsset.destinationId != this.updateCloseAsset.destinationId
    ) {
      viewChange = true;
    }
    return viewChange;
  }

  private checkUndefinedValue(value) {
    return !value ? "" : value;
  }

  private isSelectingOnYearTyping() {
    if (this.closeAsset.year == new Date().getFullYear() && this.adviceBuilderService.isUpdateAction) {
      return false;
    } else if (this.closeAsset.year) {
      return true;
    }
    return false;
  }

  private selectedAssetChange(event) {
    let value = event.target && event.target.value;
    if (value) {
      this.closeAsset.destinationId = undefined;
      let cloneActiveAsset = [];
      if (this.adviceBuilderService.isUpdateAction) {
        cloneActiveAsset = JSON.parse(JSON.stringify(this.assetListToUpdate));
      } else {
        cloneActiveAsset = JSON.parse(JSON.stringify(this.assetListToClose));
      }
      this.selectedAsset = cloneActiveAsset.filter(asset => asset.id == this.closeAsset.assetId)[0];
    }
  }

  private saveChangeCloseAsset() {
    let houseHoldId = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldId || !selectedStrategyID) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      let minYear = new Date().getFullYear();
      let maxYear = this.clientService.currentScenario.retirementProjections.lifeExpectencyYear;
      if (this.updateCloseAsset.year < minYear)
        minYear = this.updateCloseAsset.year;

      if (this.adviceBuilderService.validateYearField(this.typingYear, minYear, maxYear)) {
        this.adviceBuilderService.showLoading()
        // update value of year if user choose typing for year
        if (this.selectOnYearTyping) { this.closeAsset.year = this.typingYear; }
        else { this.closeAsset.year = new Date().getFullYear(); }

        let currentAsset = this.defineInsuranceList().filter(asset => asset.id == this.closeAsset.assetId);
        this.closeAsset.actionTitle = (currentAsset.length > 0 ? currentAsset[0].name : 'N/A');
        let observable: Observable<any>[] = [];
        if (!this.adviceBuilderService.isUpdateAction) {
          observable.push(this.adviceBuilderService.createCloseAsset(houseHoldId, selectedStrategyID, this.closeAsset));
        } else {
          observable.push(this.adviceBuilderService.updateClosedAssetAction(houseHoldId, selectedStrategyID, this.closeAsset));
        }
        $('#close-asset').modal('hide');
        this.iSub = Observable.zip.apply(null, observable).subscribe(res => {
          if (this.iSub) {
            this.iSub.unsubscribe();
          }
          this.adviceBuilderService.hideLoading();

          if (res[0].success) {
            //update current strategy actions
            this.adviceBuilderService.reloadActionsAssetListCloseAndNot();
          } else {
            this.handleErrorMessageService.handleErrorResponse(res[0]);
          }
        });
      }
      else
        this.adviceBuilderService.showInvalidEndYearMessage(minYear, maxYear);
    }
  }

  private getAssetsForUpdate() {
    let assets = [];
    if (this.closedAssetList.length >= 0 && this.closeAsset.assetId) {
      assets = JSON.parse(JSON.stringify(this.activeAssetNotClosedList));
      this.closedAssetList.forEach(item => {
        if (item.id === this.closeAsset.assetId) {
          assets.push(item);
        }
      });
    }

    return assets;
  }

  private defineInsuranceList() {
    let closeYear = 0;
    if (!this.adviceBuilderService.isUpdateAction) { // create action
      closeYear = this.closeAsset.year
    } else { closeYear = this.updateCloseAsset.year }

    if (!this.adviceBuilderService.isUpdateAction) {
      return this.activeAssetNotClosedList;
    } else {
      // case 1 : it's a close insurance in current year or in the past
      if (closeYear <= new Date().getFullYear()) {
        return this.closedAssetList;
      } // case 2: close insurance in the future
      else { return this.activeAssetNotClosedList }
    }
  }

  private resetInputValue() {
    this.closeAsset = new CloseAssetActionModel();
    this.selectOnYearTyping = false;
    this.adviceBuilderService.isUpdateAction = false; // mean create new
    this.typingYear = undefined;
    this.selectedAsset = { id: "", name: "", accountBalance: 0 };
  }
}
