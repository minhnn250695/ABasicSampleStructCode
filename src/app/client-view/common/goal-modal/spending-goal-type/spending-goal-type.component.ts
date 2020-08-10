import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GoalsModel } from '../../../models';
import { OptionModel } from '../../../../on-boarding/models';
import { Pairs, FundedFromType } from '../../../../revenue-import/models';
import { DatepickerComponent } from '../../../../common/components/datepicker/datepicker.component';
import { OnBoardingCommonComponent } from '../../../../on-boarding/on-boarding-common.component';
import { ɵINTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS } from '@angular/platform-browser-dynamic';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ISubscription } from 'rxjs/Subscription';


declare var $: any;

@Component({
  selector: 'spending-goal-type',
  templateUrl: './spending-goal-type.component.html',
  styleUrls: ['./spending-goal-type.component.css'],
})
export class SpendingGoalTypeComponent extends OnBoardingCommonComponent implements OnInit {

  @Input("goal") goalInput: GoalsModel = new GoalsModel();
  @Input() iconCSS: string = "";
  @Input() goalTypeName: string = undefined;
  @Input() clientAssets: Pairs[];
  @Input() clientDebts: Pairs[];
  @Input() readOnly: boolean = false;
  @Input() isCreateGoal: boolean = true;
  @Output() goalEmitting: EventEmitter<GoalsModel> = new EventEmitter();

  private financeFrequencyType: Array<OptionModel<number>>;
  private fundedFromList: Array<OptionModel<number>>;
  private searchTextPH: string = "";
  private goalOutPut: GoalsModel = new GoalsModel();
  private sourceName: string = "";
  private sources: Array<Pairs> = [];
  private isShowLastYear: boolean = true;
  private goalAmount: string = "";
  iconCSSList: string[] = [
    // lifestyles/ family
    "fa-paint-brush",
    "fa-university",
    "fa-child",
    "fa-home",
    "fa-plane",
    "fa-car",
    //employment
    "fa-arrow-up",
    "fa-arrow-down",
    "fa-map-signs",
    "fa-rocket",
    "fa-hands-usd",
    // Financial category
    "fa-money-bill",
    "fa-building",
    "fa-suitcase",
    // Risk Management category
    "fa-file-alt",
    "fa-user",
    // The future category
    "fa-wheelchair",
    "fa-hand-holding-usd",
    "fa-blind",
    "fa-ellipsis-h",
    "fa-question-circle"
  ];

  private FundedFromType = FundedFromType;

  constructor(
    private router: Router,
    private confirmationDialogService: ConfirmationDialogService
  ) { super(); }


  ngOnInit() {
    // init value for frequency type and funded from type
    this.financeFrequencyType = this.getFinanceFrequencyTypes();
    this.fundedFromList = this.getFundedFromType();

    // reset input value after modal hidden
    $('#update-goal').on('hidden.bs.modal', () => {
      this.resetInputValue();
    });
  }

  ngOnDestroy() {

  }

  private resetInputValue() {
    // update do not reset value
    this.goalOutPut = new GoalsModel();
    this.goalAmount = undefined;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.goalInput && changes.goalInput.currentValue) {
      this.goalOutPut = JSON.parse(JSON.stringify(this.goalInput));
      // only show endYear if endYear != startYear
      if (this.goalOutPut.startYear != this.goalOutPut.endYear) {
        this.isShowLastYear = true;
      } else this.isShowLastYear = false;

      // add current symbol for goal mount if it have value
      if (this.goalOutPut.amount || this.goalOutPut.amount == 0) {
        this.goalAmount = "$" + this.goalOutPut.amount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
      }
    }

    // asign name value for asset or debt if it's available
    if (this.goalOutPut.sourceAssetId && this.clientAssets.length > 0) {
      // init client Source
      this.onFundedFromChange();
      let currentAsset = this.clientAssets.filter(asset => asset.id == this.goalOutPut.sourceAssetId);
      if (currentAsset && currentAsset.length > 0)
        this.sourceName = currentAsset[0].value;
    }

    if (this.goalOutPut.sourceDebtId && this.clientDebts.length > 0) {
      // init client Source
      this.onFundedFromChange();
      let currentDebt = this.clientDebts.filter(debt => debt.id == this.goalOutPut.sourceDebtId);
      if (currentDebt && currentDebt.length > 0)
        this.sourceName = currentDebt[0].value;
    }
  }

  private onAmountFocus(value) {
    if (value && value != "") {
      this.goalAmount = value.replace(/[^0-9.`-]+/g, "");
    }
  }

  private onAmountFocusOut(value) {
    if (value && value != "") {
      this.goalAmount = '$' + value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }
  }

  private onAmountKeyup(event) {
    let value = event.target && event.target.value;
    this.goalOutPut.amount = parseInt(value.replace(/[^0-9.`-]+/g, ""));
  }

  private onSourceChange(item: Pairs) {
    this.sourceName = item.value;
    if (this.goalOutPut.fundedFrom == FundedFromType.AssetBalance) {
      this.goalOutPut.sourceAssetId = item.id;
    } else if (this.goalOutPut.fundedFrom == FundedFromType.LoanBalance || this.goalOutPut.fundedFrom == FundedFromType.LoanOffsetAccount) {
      this.goalOutPut.sourceDebtId = item.id;
    }
  }

  private onFundedFromChange(isInit: boolean = true) {
    // reset current fundfrom and sourceID
    if (isInit == false) {
      this.sourceName = "";
      this.goalOutPut.sourceAssetId = undefined;
      this.goalOutPut.sourceDebtId = undefined;
    }
    if (this.goalOutPut.fundedFrom == FundedFromType.AssetBalance) {
      this.searchTextPH = "Client Asset";
      this.sources = this.clientAssets;
    }

    if (this.goalOutPut.fundedFrom == FundedFromType.LoanBalance || this.goalOutPut.fundedFrom == FundedFromType.LoanOffsetAccount) {
      this.searchTextPH = "Client Debt";
      this.sources = this.clientDebts;
    }
  }

  private frequencyChange(event: any) {
    let value = event.target && event.target.value;
    if (value == 0) {
      this.goalOutPut.endYear = this.goalOutPut.startYear;
    } else {
      this.goalOutPut.endYear = undefined;
      this.isShowLastYear = true;
    }
  }

  private emitGoalToSave() {
    // emit Out put "goal" to parents
    this.goalOutPut.amount = parseInt(this.goalOutPut.amount.toString());
    this.goalOutPut.financeFrequency = parseInt(this.goalOutPut.financeFrequency.toString());
    this.goalOutPut.fundedFrom = parseInt(this.goalOutPut.fundedFrom.toString());

    let isValidFirstYear = this.validateYearCreate(this.goalOutPut.startYear);
    let isValidLastYear = this.validateYearCreate(this.goalOutPut.endYear);
    if (isValidFirstYear && isValidLastYear) {
      if (this.goalOutPut.financeFrequency === 0) {
        this.goalOutPut.endYear = this.goalOutPut.startYear;
        this.goalEmitting.emit(this.goalOutPut);
        $('#update-goal').modal("hide");
      }
      else {
        if (this.validateEndYearGeaterStartYear(this.goalOutPut.startYear, this.goalOutPut.endYear)) {
          this.goalEmitting.emit(this.goalOutPut);
          $('#update-goal').modal("hide");
        } else {
          this.showInvalidYear('End year', 'Start year');
        }
      }
    } else { // invalid first year or last year
      let currentYear = new Date().getFullYear().toString();
      if (!isValidFirstYear) {
        this.showInvalidYear('Starting year', currentYear);
      } else if (!isValidLastYear) {
        this.showInvalidYear('End year', currentYear);
      }
    }
  }

  private viewDetectChange() {
    let viewChange = false;
    if (!this.isCreateGoal) { // is update goal
      // if goal input different from goalInput => change
      if (this.goalInput.name != this.goalOutPut.name ||
        this.goalInput.startYear != this.goalOutPut.startYear ||
        this.goalInput.endYear != this.goalOutPut.endYear ||
        (this.goalInput.financeFrequency != this.goalOutPut.financeFrequency) ||
        parseInt(this.returnDecimalValue(this.goalAmount)) != this.goalInput.amount ||
        this.goalInput.description != this.goalOutPut.description ||
        (this.goalInput.fundedFrom != this.goalOutPut.fundedFrom && this.isSourceOfFundChange() && this.isCorrectSourceOfFund()) ||
        // check asset change
        this.isSourceAssetChange() ||
        // check debt change
        this.isSourceDebtChange()

      ) {
        viewChange = true;
      }
    } else { viewChange = true };
    // create new goal or not change
    return viewChange;
  }

  private isCorrectSourceOfFund() {
    let correct = false;
    if (this.goalOutPut.fundedFrom) {
      if (this.goalOutPut.fundedFrom == FundedFromType.Cashflow) correct = true;
      if (this.goalOutPut.fundedFrom == FundedFromType.AssetBalance && this.goalOutPut.sourceAssetId) { // fund from asset
        correct = true;
      }
      if ((this.goalOutPut.fundedFrom == FundedFromType.LoanBalance || this.goalOutPut.fundedFrom == FundedFromType.LoanOffsetAccount) && this.goalOutPut.sourceDebtId) { // fund from debt
        correct = true;
      }
    }
    return correct;
  }

  private isSourceAssetChange() {
    if (this.goalInput.fundedFrom == FundedFromType.AssetBalance) {
      return this.goalInput.sourceAssetId != this.goalOutPut.sourceAssetId;
    }
    return false;
  }

  private isSourceDebtChange() {
    if (this.goalInput.fundedFrom == FundedFromType.LoanBalance || this.goalInput.fundedFrom == FundedFromType.LoanOffsetAccount) {
      return this.goalInput.sourceDebtId != this.goalOutPut.sourceDebtId;
    }
    return false;
  }

  private isSourceOfFundChange() {
    let isChange = false;
    if (this.goalOutPut.fundedFrom) {
      if (this.goalOutPut.fundedFrom == FundedFromType.Cashflow && (this.goalOutPut.fundedFrom != this.goalInput.fundedFrom))
        isChange = true;

      if (this.goalOutPut.fundedFrom == FundedFromType.AssetBalance && (this.goalOutPut.sourceAssetId != this.goalInput.sourceAssetId)) { // fund from asset
        isChange = true;
      }
      if ((this.goalOutPut.fundedFrom == FundedFromType.LoanBalance || this.goalOutPut.fundedFrom == FundedFromType.LoanOffsetAccount) && (this.goalOutPut.sourceDebtId != this.goalInput.sourceDebtId)) { // fund from debt
        isChange = true;
      }
    }
    return isChange;
  }

  private returnDecimalValue(number: string) {
    if (number)
      return number.replace(/[^0-9.`-]+/g, "");
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
}
