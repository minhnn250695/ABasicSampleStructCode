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
import { ISubscription } from 'rxjs/Subscription';
declare var $: any;


@Component({
  selector: 'contribute-funds-to-asset-modal',
  templateUrl: './contribute-funds-to-asset-modal.component.html',
  styleUrls: ['./contribute-funds-to-asset-modal.component.css']
})
export class ContributeFundsToAssetModalComponent implements OnInit {

  // #region Properties
  @Input() notClosedAssetList: any[];
  @Input() updateContributAsset: ContributeAssetActionModel = new ContributeAssetActionModel();

  private contributeAsset: ContributeAssetActionModel = new ContributeAssetActionModel();
  private ContributionType = [{ code: 1, name: "PreTax" }, { code: 2, name: "PostTax" }];
  private annualAmount: string = "";
  private contributeTypeIsPreTax: boolean = false;
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
    $('#contribute-funds-to-asset').on('hidden.bs.modal', () => {
      this.resetInputValue();
      $('#contribute-funds-asset-details').click();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.updateContributAsset && changes.updateContributAsset.currentValue) {
      this.contributeAsset = JSON.parse(JSON.stringify(this.updateContributAsset));
      // convert AnnualAmount to currency format      
      if (this.contributeAsset.annualAmount || this.contributeAsset.annualAmount == 0) {
        this.annualAmount = this.returnCurrenyFormat(this.contributeAsset.annualAmount.toString());
      }
      // update contribute type to radio button on view
      if (this.contributeAsset.contributionType == 1) { //pre tax
        this.contributeTypeIsPreTax = true;
      } else { this.contributeTypeIsPreTax = false; }
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
  private saveChangeFundsContribution() {
    let houseHoldID = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldID || !selectedStrategyID) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      const assets = JSON.parse(JSON.stringify(this.notClosedAssetList));
      let selectedAsset = assets.filter(asset => asset.id == this.contributeAsset.assetId);      
      let assetName = (selectedAsset && selectedAsset.length > 0) ? selectedAsset[0].name : "";
      this.contributeAsset.actionTitle = assetName;
      // contribute type default is false if user not change
      if (this.contributeTypeIsPreTax == false && !this.contributeAsset.contributionType) {
        this.contributeAsset.contributionType = 2;
      }

      if (this.validateYearCreate(this.contributeAsset.startYear) && this.validateYearCreate(this.contributeAsset.endYear)
        && this.validateEndYearGeaterStartYear(this.contributeAsset.startYear, this.contributeAsset.endYear)) {
          this.adviceBuilderService.showLoading()
        // close modal
        $('#contribute-funds-to-asset').modal('hide');
        let observable: Observable<any>[] = [];
        if (this.adviceBuilderService.isUpdateAction) {
          observable.push(this.adviceBuilderService.updateContributeFundToAsset(houseHoldID, selectedStrategyID, this.contributeAsset));
        } else {
          observable.push(this.adviceBuilderService.createContributeFundToAsset(houseHoldID, selectedStrategyID, this.contributeAsset));
        };
        this.iSub = Observable.zip.apply(null, observable).subscribe(res => {
          if (this.iSub) {
            this.iSub.unsubscribe();
          }
          this.adviceBuilderService.hideLoading()
          if (res && res.length > 0) {
            if (res[0].success) {
              //reload all data
              // => new to optimize - just reload which api needed
              this.adviceBuilderService.reloadAllData();
            } else {
              this.handleErrorMessageService.handleErrorResponse(res[0]);
            }
          }
        });
      } else { // invalid year
        let currentYear = new Date().getFullYear().toString();
        if (!this.validateYearCreate(this.contributeAsset.startYear)) {
          this.showInvalidYear('Starting year', currentYear);
        } else if (!this.validateYearCreate(this.contributeAsset.endYear)) {
          this.showInvalidYear('End year', currentYear);
        } else if (!this.validateEndYearGeaterStartYear(this.contributeAsset.startYear, this.contributeAsset.endYear)) {
          this.showInvalidYear('End year', 'Start year');
        }
      }
    }
  }

  //#endregion

  //#region Private
  private contributionTypeChange(contributeType: number) {
    this.contributeAsset.contributionType = contributeType;
    if (contributeType == 1) { // pre tex
      this.contributeTypeIsPreTax = true;
    } else { // post tax
      this.contributeTypeIsPreTax = false;
    }
  }

  private getContributeAssetName() {
    let assetName = '';
    if (this.notClosedAssetList && this.notClosedAssetList.length > 0) {
      const assetList = JSON.parse(JSON.stringify(this.notClosedAssetList));
      const assetRecord = assetList.filter(asset => asset.id == this.contributeAsset.assetId);
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
      this.contributeAsset.annualAmount = value.replace(/[^0-9.`-]+/g, "");
  }

  private returnCurrenyFormat(number: string) {
    return '$' + number.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  private viewDetectChange() {
    let viewChange = false;
    if (this.adviceBuilderService.isUpdateAction) {
      if (this.contributeAsset.assetId != this.updateContributAsset.assetId ||
        this.contributeAsset.contributionType != this.updateContributAsset.contributionType ||
        this.contributeAsset.startYear != this.updateContributAsset.startYear ||
        this.contributeAsset.endYear != this.updateContributAsset.endYear ||
        this.contributeAsset.annualAmount != this.updateContributAsset.annualAmount ||
        // check advice comment
        this.checkUndefinedValue(this.contributeAsset.details) != this.checkUndefinedValue(this.updateContributAsset.details) ||
        this.checkUndefinedValue(this.contributeAsset.reason) != this.checkUndefinedValue(this.updateContributAsset.reason) ||
        this.checkUndefinedValue(this.contributeAsset.result) != this.checkUndefinedValue(this.updateContributAsset.result)
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
    this.contributeAsset = new ContributeAssetActionModel();
    this.adviceBuilderService.isUpdateAction = false; // mean create debt
    this.annualAmount = undefined;
    this.contributeTypeIsPreTax = false;
  }
  //#endregion
}
