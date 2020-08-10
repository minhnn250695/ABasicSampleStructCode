import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DebtActionModel, DebtCategoryType, DebtType, DebtTypeAction, DrawFundFromDebtModel } from '../../../../../models';
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
  selector: 'draw-funds-from-debt-modal',
  templateUrl: './draw-funds-from-debt-modal.component.html',
  styleUrls: ['./draw-funds-from-debt-modal.component.css']
})
export class DrawFundsFromDebtModalComponent implements OnInit {
  // #region Properties
  @Input() updateDrawDebt: DrawFundFromDebtModel = new DrawFundFromDebtModel();
  @Input() notClosedDebtList: any[];
  private drawDebt: DrawFundFromDebtModel = new DrawFundFromDebtModel();
  private DebtAccountType = [{ code: 0, name: "Loan" }, { code: 1, name: "OffsetAccount" }];
  private annualAmount: string = "";
  private debtTypeIsOffset: boolean = false;
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
    $('#draw-funds-from-debt').on('hidden.bs.modal', () => {
      this.resetInputValue();
      $('#draw-fund-debt-details').click();
    });

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.updateDrawDebt && changes.updateDrawDebt.currentValue) {
      this.drawDebt = JSON.parse(JSON.stringify(this.updateDrawDebt));
      // convert AnnualAmount to currency format      
      if (this.drawDebt.annualAmount || this.drawDebt.annualAmount == 0) {
        this.annualAmount = this.returnCurrenyFormat(this.drawDebt.annualAmount.toString());
      }
      // update contribute type to radio button on view
      if (this.drawDebt.debtAccountType == 0) { // loan
        this.debtTypeIsOffset = false;
      } else if (this.drawDebt.debtAccountType == 1) {
        this.debtTypeIsOffset = true;
      }// offset
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
      const debts = JSON.parse(JSON.stringify(this.notClosedDebtList));
      let selectedDebt = debts.filter(asset => asset.id == this.drawDebt.debtId);
      let debtName = (selectedDebt && selectedDebt.length > 0) ? selectedDebt[0].name : "";
      this.drawDebt.actionTitle = debtName;
      // contribute type default is false if user not change
      if (this.debtTypeIsOffset == false && (this.drawDebt.debtAccountType == undefined)) {
        this.drawDebt.debtAccountType = 0;
      }

      if (this.validateYearCreate(this.drawDebt.startYear)
        && this.validateYearCreate(this.drawDebt.endYear)
        && this.validateEndYearGeaterStartYear(this.drawDebt.startYear, this.drawDebt.endYear)) {
          
        this.drawFundFromDebt(houseHoldID, selectedStrategyID);
      } else { // invalid year
        let currentYear = new Date().getFullYear().toString();
        if (!this.validateYearCreate(this.drawDebt.startYear)) {
          this.showInvalidYear('Starting year', currentYear);
        } else if (!this.validateYearCreate(this.drawDebt.endYear)) {
          this.showInvalidYear('End year', currentYear);
        } else if (!this.validateEndYearGeaterStartYear(this.drawDebt.startYear, this.drawDebt.endYear)) {
          this.showInvalidYear('End year', 'Start year');
        }
      }
    }
  }

  private drawFundFromDebt(houseHoldID: string, selectedStrategyID: string) {
    this.adviceBuilderService.showLoading()

    // close modal
    $('#draw-funds-from-debt').modal('hide');
    let observable: Observable<any>[] = [];
    if (this.adviceBuilderService.isUpdateAction) {
      observable.push(this.adviceBuilderService.updateDrawFundFromDebt(houseHoldID, selectedStrategyID, this.drawDebt));
    } else {
      observable.push(this.adviceBuilderService.createDrawFundFromDebt(houseHoldID, selectedStrategyID, this.drawDebt));
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
  }
  //#endregion

  //#region Private

  private debtAccountTypeChange(contributeType: number) {
    this.drawDebt.debtAccountType = contributeType;
    if (contributeType == 1) { // offset
      this.debtTypeIsOffset = true;
    } else if (contributeType == 0) { // 0 is loan
      this.debtTypeIsOffset = false;
    }
  }

  private getDrawDebtName() {
    let debtName = '';
    if (this.notClosedDebtList && this.notClosedDebtList.length > 0) {
      const debtList = JSON.parse(JSON.stringify(this.notClosedDebtList));
      const debtRecord = debtList.filter(debt => debt.id == this.drawDebt.debtId);
      debtName = (debtRecord && debtRecord.length > 0) ? debtRecord[0].name : '';
    }
    return debtName;
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
      this.drawDebt.annualAmount = value.replace(/[^0-9.`-]+/g, "");
  }

  private returnCurrenyFormat(number: string) {
    return '$' + number.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  private viewDetectChange() {
    let viewChange = false;
    if (this.adviceBuilderService.isUpdateAction) {
      if (this.drawDebt.debtId != this.updateDrawDebt.debtId ||
        this.drawDebt.debtAccountType != this.updateDrawDebt.debtAccountType ||
        this.drawDebt.startYear != this.updateDrawDebt.startYear ||
        this.drawDebt.endYear != this.updateDrawDebt.endYear ||
        this.drawDebt.annualAmount != this.updateDrawDebt.annualAmount ||
        // check advice comment
        this.checkUndefinedValue(this.drawDebt.details) != this.checkUndefinedValue(this.updateDrawDebt.details) ||
        this.checkUndefinedValue(this.drawDebt.reason) != this.checkUndefinedValue(this.updateDrawDebt.reason) ||
        this.checkUndefinedValue(this.drawDebt.result) != this.checkUndefinedValue(this.updateDrawDebt.result)
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
    this.drawDebt = new DrawFundFromDebtModel();
    this.adviceBuilderService.isUpdateAction = false; // mean create debt
    this.annualAmount = undefined;
    this.debtTypeIsOffset = false;
  }
  //#endregion

}
