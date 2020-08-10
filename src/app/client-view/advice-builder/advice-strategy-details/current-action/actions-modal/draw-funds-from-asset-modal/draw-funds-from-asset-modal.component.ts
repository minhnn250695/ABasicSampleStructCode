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
  selector: 'draw-funds-from-asset-modal',
  templateUrl: './draw-funds-from-asset-modal.component.html',
  styleUrls: ['./draw-funds-from-asset-modal.component.css']
})
export class DrawFundsFromAssetModalComponent implements OnInit {


  // #region Properties
  @Input() notClosedAssetList: any[];
  @Input() updateDrawAsset: DrawFundFromAssetModel = new DrawFundFromAssetModel();
  private drawAsset: DrawFundFromAssetModel = new DrawFundFromAssetModel();
  private annualAmount: string = "";
  private iSub: ISubscription;

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

    $('#draw-funds-from-asset').on('hidden.bs.modal', () => {
      this.resetInputValue();
      $('#draw-fund-asset-details').click();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.updateDrawAsset && changes.updateDrawAsset.currentValue) {
      this.drawAsset = JSON.parse(JSON.stringify(this.updateDrawAsset));
      // convert AnnualAmount to currency format      
      if (this.drawAsset.annualAmount || this.drawAsset.annualAmount == 0) {
        this.annualAmount = this.returnCurrenyFormat(this.drawAsset.annualAmount.toString());
      }
    }
  }


  ngOnDestroy() {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
    if (this.iSub) {
      this.iSub.unsubscribe();
    }
  }

  // #endregion


  //#region Actions
  private saveChangeDrawFunds() {
    let houseHoldID = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldID || !selectedStrategyID) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      let assets = JSON.parse(JSON.stringify(this.notClosedAssetList));
      let selectedAsset = assets.filter(asset => asset.id == this.drawAsset.assetId);
      let assetName = (selectedAsset && selectedAsset.length > 0) ? selectedAsset[0].name : "";
      this.drawAsset.actionTitle = assetName;


      if (this.validateYearCreate(this.drawAsset.startYear)
        && this.validateYearCreate(this.drawAsset.endYear)
        && this.validateEndYearGeaterStartYear(this.drawAsset.startYear, this.drawAsset.endYear)) {        
          this.drawFundFromAsset(houseHoldID, selectedStrategyID);
      } else { // invalid year
        let currentYear = new Date().getFullYear().toString();
        if (!this.validateYearCreate(this.drawAsset.startYear)) {
          this.showInvalidYear('Starting year', currentYear);
        } else if (!this.validateYearCreate(this.drawAsset.endYear)) {
          this.showInvalidYear('End year', currentYear);
        } else if (!this.validateEndYearGeaterStartYear(this.drawAsset.startYear, this.drawAsset.endYear)) {
          this.showInvalidYear('End year', 'Start year');
        }
      }
    }
  }

  private drawFundFromAsset(houseHoldID: string, selectedStrategyID: string) {
    this.adviceBuilderService.showLoading()
    
    let observable: Observable<any>[] = [];
    if (this.adviceBuilderService.isUpdateAction) {
      observable.push(this.adviceBuilderService.updateDrawFundFromAsset(houseHoldID, selectedStrategyID, this.drawAsset));
    } else {
      observable.push(this.adviceBuilderService.createDrawFundFromAsset(houseHoldID, selectedStrategyID, this.drawAsset));
    };
    this.iSub = Observable.zip.apply(null, observable).subscribe(res => {
      if (this.iSub) {
        this.iSub.unsubscribe();
      }
      this.adviceBuilderService.hideLoading()
      if (res && res.length > 0) {
        if (res[0].success) {
          // close modal
          $('#draw-funds-from-asset').modal('hide');  
          //reload all data
          // => new to optimize - just reload which api needed
          this.adviceBuilderService.reloadAllData();
        } else {
          this.handleErrorMessageService.handleErrorResponse(res[0]);
        }
      }
    });
  }
  //#endregion

  //#region Private
  private checkAvailableCurrentBalance(asset: any) {
    if (asset && asset.accountBalance < this.drawAsset.annualAmount) {
      return false;
    }
    return true;
  }

  private getDrawAssetName() {
    let assetName = '';
    if (this.notClosedAssetList && this.notClosedAssetList.length > 0) {
      const assetList = JSON.parse(JSON.stringify(this.notClosedAssetList));
      const assetRecord = assetList.filter(asset => asset.id == this.drawAsset.assetId);
      assetName = (assetRecord && assetRecord.length > 0) ? assetRecord[0].name : '';
    }
    return assetName;
  }

  private onAmountFocus(value) {
    if (value && value != "") {
      this.annualAmount = value.replace(/[^0-9.`-]+/g, "");
    }
  }

  private onAmountFocusOut(value) {
    if (value && value != "") {
      this.annualAmount = this.returnCurrenyFormat(value);
    }
  }

  private onAmountKeyup(event) {
    let value = event.target && event.target.value;
    if (value && value != "")
      this.drawAsset.annualAmount = value.replace(/[^0-9.`-]+/g, "");
  }

  private returnCurrenyFormat(number: string) {
    return '$' + number.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  private viewDetectChange() {
    let viewChange = false;
    if (this.adviceBuilderService.isUpdateAction) {
      if (this.drawAsset.assetId != this.updateDrawAsset.assetId ||
        this.drawAsset.startYear != this.updateDrawAsset.startYear ||
        this.drawAsset.endYear != this.updateDrawAsset.endYear ||
        this.drawAsset.annualAmount != this.updateDrawAsset.annualAmount ||
        // check advice comment
        this.checkUndefinedValue(this.drawAsset.details) != this.checkUndefinedValue(this.updateDrawAsset.details) ||
        this.checkUndefinedValue(this.drawAsset.reason) != this.checkUndefinedValue(this.updateDrawAsset.reason) ||
        this.checkUndefinedValue(this.drawAsset.result) != this.checkUndefinedValue(this.updateDrawAsset.result)
      ) {
        viewChange = true;
      }
    } else { // create action
      viewChange = true;
    };
    // create new action or not change
    return viewChange;
  }

  private checkUndefinedValue(value) {
    return !value ? "" : value;
  }

  private validateYearCreate(createYear: number) {
    let currentYear = new Date().getFullYear();
    if (currentYear > createYear)
      return false;
    return true;
  }

  private validateEndYearGeaterStartYear(startYear: number, endYear: number) {
    if (startYear > endYear) {
      return false;
    }
    return true;
  }

  private showInvalidYear(greaterYear: string = '', lesserYear: string = '') {
    let iSub = this.confirmationDialogService.showModal({
      title: "Validation error",
      message: greaterYear + " must be greater than or equal to " + lesserYear,
      btnOkText: "Ok"
    }).subscribe(res => {
      iSub.unsubscribe();
    })
  }

  private resetInputValue() {
    this.drawAsset = new DrawFundFromAssetModel();
    this.adviceBuilderService.isUpdateAction = false; // mean create debt
    this.annualAmount = undefined;
  }
  //#endregion


}
