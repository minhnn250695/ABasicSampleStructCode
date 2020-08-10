import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ContributeDebtActionModel } from '../../../../../models';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../../../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Observable } from 'rxjs';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
import { ISubscription } from 'rxjs/Subscription';
declare var $: any;


@Component({
  selector: 'contribute-funds-to-debt-modal',
  templateUrl: './contribute-funds-to-debt-modal.component.html',
  styleUrls: ['./contribute-funds-to-debt-modal.component.css']
})
export class ContributeFundsToDebtModalComponent implements OnInit {

  // #region Properties
  @Input() notClosedDebtList: any[];
  @Input() updateContributeDebt: ContributeDebtActionModel = new ContributeDebtActionModel();
  private contributeDebt: ContributeDebtActionModel = new ContributeDebtActionModel();
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
    private confirmationDialogService: ConfirmationDialogService
  ) { }

  ngOnInit() {
    $('#contribute-funds-to-debt').on('hidden.bs.modal', () => {
      this.resetInputValue();
      $('#contribute-funds-debt-details').click();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.updateContributeDebt && changes.updateContributeDebt.currentValue) {
      this.contributeDebt = JSON.parse(JSON.stringify(this.updateContributeDebt));
      // convert AnnualAmount to currency format      
      if (this.contributeDebt.annualAmount || this.contributeDebt.annualAmount == 0) {
        this.annualAmount = this.returnCurrenyFormat(this.contributeDebt.annualAmount.toString());
      }
      // update contribute type to radio button on view
      if (this.contributeDebt.debtAccountType == 0) { // loan
        this.debtTypeIsOffset = false;
      } else if (this.contributeDebt.debtAccountType == 1) {
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
  private saveChangeFundsContribution() {
    let houseHoldID = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldID || !selectedStrategyID) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      const debts = JSON.parse(JSON.stringify(this.notClosedDebtList));
      let selectedDebt = debts.filter(debt => debt.id == this.contributeDebt.debtId);
      let debtName = (selectedDebt && selectedDebt.length > 0) ? selectedDebt[0].name : "";
      this.contributeDebt.actionTitle = debtName;
      // contribute type default is false if user not change
      if (this.debtTypeIsOffset == false && (this.contributeDebt.debtAccountType == undefined)) {
        this.contributeDebt.debtAccountType = 0;
      }

      if (this.validateYearCreate(this.contributeDebt.startYear) && this.validateYearCreate(this.contributeDebt.endYear)
        && this.validateEndYearGeaterStartYear(this.contributeDebt.startYear, this.contributeDebt.endYear)) {
        this.adviceBuilderService.showLoading()
        // close modal
        $('#contribute-funds-to-debt').modal('hide');
        let observable: Observable<any>[] = [];
        if (this.adviceBuilderService.isUpdateAction) {
          observable.push(this.adviceBuilderService.updateContributeFundToDebt(houseHoldID, selectedStrategyID, this.contributeDebt));
        } else {
          observable.push(this.adviceBuilderService.createContributeFundToDebt(houseHoldID, selectedStrategyID, this.contributeDebt));
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
        if (!this.validateYearCreate(this.contributeDebt.startYear)) {
          this.showInvalidYear('Starting year', currentYear);
        } else if (!this.validateYearCreate(this.contributeDebt.endYear)) {
          this.showInvalidYear('End year', currentYear);
        } else if (!this.validateEndYearGeaterStartYear(this.contributeDebt.startYear, this.contributeDebt.endYear)) {
          this.showInvalidYear('End year', 'Start year');
        }
      }
    }
  }
  //#endregion

  private debtAccountTypeChange(contributeType: number) {
    this.contributeDebt.debtAccountType = contributeType;
    if (contributeType == 1) { // offset
      this.debtTypeIsOffset = true;
    } else if (contributeType == 0) { // 0 is loan
      this.debtTypeIsOffset = false;
    }
  }

  private getContributeDebtName() {
    let debtName = '';
    if (this.notClosedDebtList && this.notClosedDebtList.length > 0) {
      const debtList = JSON.parse(JSON.stringify(this.notClosedDebtList));
      const debtRecord = debtList.filter(debt => debt.id == this.contributeDebt.debtId);
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
      this.contributeDebt.annualAmount = value.replace(/[^0-9.`-]+/g, "");
  }

  private returnCurrenyFormat(number: string) {
    return '$' + number.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  private viewDetectChange() {
    let viewChange = false;
    if (this.adviceBuilderService.isUpdateAction) {
      if (this.contributeDebt.debtId != this.updateContributeDebt.debtId ||
        this.contributeDebt.debtAccountType != this.updateContributeDebt.debtAccountType ||
        this.contributeDebt.startYear != this.updateContributeDebt.startYear ||
        this.contributeDebt.endYear != this.updateContributeDebt.endYear ||
        this.contributeDebt.annualAmount != this.updateContributeDebt.annualAmount ||
        // check advice comment
        this.checkUndefinedValue(this.contributeDebt.details) != this.checkUndefinedValue(this.updateContributeDebt.details) ||
        this.checkUndefinedValue(this.contributeDebt.reason) != this.checkUndefinedValue(this.updateContributeDebt.reason) ||
        this.checkUndefinedValue(this.contributeDebt.result) != this.checkUndefinedValue(this.updateContributeDebt.result)
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
    this.contributeDebt = new ContributeDebtActionModel();
    this.adviceBuilderService.isUpdateAction = false; // mean create debt
    this.annualAmount = undefined;
    this.debtTypeIsOffset = false;
  }
  //#endregion

}
