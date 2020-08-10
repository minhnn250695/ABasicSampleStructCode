import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DebtActionModel, DebtCategoryType, DebtType, DebtTypeAction } from '../../../../../models';
import { OptionModel } from '../../../../../../on-boarding/models';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Router } from '@angular/router';
import { OnBoardingService } from '../../../../../../on-boarding/on-boarding.service';
import { OnBoardingCommonComponent } from '../../../../../../on-boarding/on-boarding-common.component';
import { Pairs } from '../../../../../../revenue-import/models';
import { ConfirmationDialogService } from '../../../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Observable } from 'rxjs';
import { DebtFundedFrom } from '../../../../../../common/models/debt-fund-from.enum';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
declare var $: any;

@Component({
  selector: 'debt-view-modal',
  templateUrl: './debt-modal.component.html',
  styleUrls: ['./debt-modal.component.css'],
})
export class DebtViewModalComponent extends OnBoardingCommonComponent implements OnInit {

  @Input() debt: DebtActionModel = new DebtActionModel();
  @Input() ownerShipTypes: any;
  @Input() frequencyList: any;
  @Input() activeAssetList: any[];
  private debtCategoryList: OptionModel<number>[] = [];
  private interestRateTypes: OptionModel<number>[] = [];
  private selectedOwnershipType = "";
  private isShowingOffsetAccount: boolean = false;
  private fundedFromList: Array<OptionModel<number>>;
  // private isNotSelectSourceDebt: boolean = true;
  private debtTypes: OptionModel<number>[] = [];
  private willThereBeOffsetAccount: boolean;
  private DebtFundedFrom = DebtFundedFrom;
  private isValidValue = true;
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private router: Router,
    private onBoardingService: OnBoardingService,
    private confirmationDialogService: ConfirmationDialogService
  ) { super(); }

  ngOnInit() {
    this.fundedFromList = this.getFundedFromTypeForDebtAction();
    $('#debt-view').on('hidden.bs.modal', () => {
      $('#debt-details').click();
    });
  }

  ngOnDestroy() {
    // resolve the issue unclickable when press "ESC" key
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.activeAssetList && changes.activeAssetList.currentValue) {
      this.activeAssetList = this.activeAssetList.map(asset => {
        return { id: asset.id, value: asset.name };
      });
    }
    // show debt value need to update on view
    if (changes.debt && changes.debt.currentValue) {
      this.debt = JSON.parse(JSON.stringify(this.debt));
      this.updateDebtToView();
    }
  }

  private updateDebtToView() {

    this.willThereBeOffsetAccount = this.debt.willThereBeOffsetAccount;
    // check showing offset account
    this.checkShowingOffsetAccount(this.debt.debtCategory);
    this.checkValidValue();
  }

  private checkValidValue(){
    let source = [];
    let sourceId = this.debt.sourceId;
    this.isValidValue = true;
    if (this.debt.sourceOfFunds == DebtFundedFrom.Asset) {
      source = this.activeAssetList.filter(item => item.id == sourceId);
      if((source.length <= 0) && (sourceId && sourceId != '')){
        this.isValidValue = false;
      }
    }
  }

  private checkShowingOffsetAccount(debtCategory: number) {
    if (debtCategory == DebtCategoryType.RentalPropertyLoan || debtCategory == DebtCategoryType.HomeMortgage) {
      this.isShowingOffsetAccount = true;
    } else {
      this.isShowingOffsetAccount = false;
      this.willThereBeOffsetAccount = false;
    }
  }

  private returnDebtType() {
    let debtTypes = this.getDebtType();
    let debtType = debtTypes.filter(debt => debt.code == this.debt.debtType);
    return debtType[0] && debtType[0].name || 'N/A';
  }

  private returnDebtSubcate() {
    let debtSubcate = this.getDebtCategory();
    let sub = debtSubcate.filter(item => item.code == this.debt.debtCategory);
    return sub[0] && sub[0].name || 'N/A';
  }

  private returnOwnership() {
    let currentOwnerShip = this.debt && this.debt.ownershipType && this.debt.ownershipType.toString();
    if (this.debt.ownershipType == 100000000) {
      currentOwnerShip = this.debt.primaryClientId;
    }
    let sub = this.ownerShipTypes.filter(item => item.code == currentOwnerShip);
    return sub[0] && sub[0].name || 'N/A';
  }

  private returnFrequency() {
    let frequency = this.frequencyList.filter(item => item.code == this.debt.repaymentFrequency);
    return frequency[0] && frequency[0].name || 'N/A';
  }

  private getFundFromText(sourceOfFunds) {
    let fundFrom = this.fundedFromList.filter(item => item.code == sourceOfFunds);
    return fundFrom[0] && fundFrom[0].name || 'N/A';
  }

  private getSourceText(sourceId) {
    let source = [];
    if (this.debt.sourceOfFunds == DebtFundedFrom.Asset) {
      source = this.activeAssetList.filter(item => item.id == sourceId);
    }
    return source[0] && source[0].value || 'N/A';
  }

  getDebtCategory(): Array<OptionModel<number>> {
    let options: Array<OptionModel<number>> = [
      { name: "Rental property loan", code: DebtCategoryType.RentalPropertyLoan },
      { name: "Investment loan ", code: DebtCategoryType.InvestmentLoan },
      { name: "Home mortgage ", code: DebtCategoryType.HomeMortgage },
      { name: "Car loan ", code: DebtCategoryType.CarLoan },
      { name: "Credit card ", code: DebtCategoryType.CreditCard },
      { name: "Personal loan", code: DebtCategoryType.PersonalLoan },
      { name: "Other", code: DebtCategoryType.Other },
    ];
    return options;
  }

  getDebtType(): Array<OptionModel<number>> {
    let options: Array<OptionModel<number>> = [
      { name: "Deductible", code: DebtTypeAction.Deductible },
      { name: "NonDeductible", code: DebtTypeAction.NonDeductible },
    ];
    return options;
  }

}
