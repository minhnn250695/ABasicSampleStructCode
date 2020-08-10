import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GoalsModel } from '../../../models';
import { OptionModel } from '../../../../on-boarding/models';
import { Pairs, FundedFromType } from '../../../../revenue-import/models';
import { DatepickerComponent } from '../../../../common/components/datepicker/datepicker.component';
import { OnBoardingCommonComponent } from '../../../../on-boarding/on-boarding-common.component';
import { ɵINTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS } from '@angular/platform-browser-dynamic';


declare var $: any;

@Component({
  selector: 'spending-goal-type-view',
  templateUrl: './spending-goal-type-view.component.html',
  styleUrls: ['./spending-goal-type-view.component.css'],
})
export class SpendingGoalTypeViewComponent extends OnBoardingCommonComponent implements OnInit {

  @Input("goal") goalInput: GoalsModel = new GoalsModel();
  @Input() iconCSS: string = "";
  @Input() goalTypeName: string = undefined;
  @Input() clientAssets: Pairs[];
  @Input() clientDebts: Pairs[];
  @Input() readOnly: boolean = false;
  @Output() goalEmitting: EventEmitter<GoalsModel> = new EventEmitter();

  private financeFrequencyType: Array<OptionModel<number>>;
  private fundedFromList: Array<OptionModel<number>>;
  private searchTextPH: string = "";
  private goalOutPut: GoalsModel = new GoalsModel();
  private sourceName: string = "";
  private isShowLastYear = true;
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

  constructor(
    private router: Router,
  ) { super(); }


  ngOnInit() {
    // init value for frequency type and funded from typ
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
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.goalInput && changes.goalInput.currentValue) {
      this.goalOutPut = JSON.parse(JSON.stringify(this.goalInput));
      // only show endYear if endYear != startYear
      if (this.goalOutPut.startYear != this.goalOutPut.endYear) {
        this.isShowLastYear = true;
      } else this.isShowLastYear = false;
    }
    
    // asign name value for asset or debt if it's available
    if (this.goalOutPut.sourceAssetId != "00000000-0000-0000-0000-000000000000" && this.clientAssets.length > 0) {
      // init client Source
      // this.onFundedFromChange();
      let currentAsset = this.clientAssets.filter(asset => asset.id == this.goalOutPut.sourceAssetId);
      if (currentAsset && currentAsset.length > 0)
        this.sourceName = currentAsset[0] && currentAsset[0].value;
    }

    if (this.goalOutPut.sourceDebtId != "00000000-0000-0000-0000-000000000000" && this.clientDebts.length > 0) {
      // init client Source
      // this.onFundedFromChange();
      let currentDebt = this.clientDebts.filter(debt => debt.id == this.goalOutPut.sourceDebtId);
      if (currentDebt && currentDebt.length > 0)
        this.sourceName = currentDebt[0] && currentDebt[0].value;
    }

  }

  onFundedFromChange() {
    if (this.goalOutPut.fundedFrom == FundedFromType.AssetBalance) {
      this.searchTextPH = "Client Asset";
      this.initAutoComplete("search-text", this.clientAssets);
    }

    if (this.goalOutPut.fundedFrom == FundedFromType.LoanBalance || this.goalOutPut.fundedFrom == FundedFromType.LoanOffsetAccount) {
      this.searchTextPH = "Client Debt";
      this.initAutoComplete("search-text", this.clientDebts);
    }
  }

  private initAutoComplete(id: string, records: Pairs[]) {
    if (records === undefined || records.length === 0) return;
    const item = $("#" + id);
    item.autocomplete({
      source: (request, response) => {
        let results = $.ui.autocomplete.filter(records, request.term);
        response(results.slice(0, 50));
      },
      select: (e, ui) => {
        if (this.goalOutPut.fundedFrom == FundedFromType.AssetBalance) {
          this.goalOutPut.sourceAssetId = ui.item.id;
        }
        else if (this.goalOutPut.fundedFrom == FundedFromType.LoanBalance || this.goalOutPut.fundedFrom == FundedFromType.LoanOffsetAccount) {
          this.goalOutPut.sourceDebtId = ui.item.id;
        }
      }
    });

    item.autocomplete("option", "appendTo", "#search-group");

  }

  private emitGoalToSave() {
    // emit Out put "goal" to parents
    this.goalOutPut.amount = parseInt(this.goalOutPut.amount.toString());
    this.goalOutPut.financeFrequency = parseInt(this.goalOutPut.financeFrequency.toString());
    this.goalOutPut.fundedFrom = parseInt(this.goalOutPut.fundedFrom.toString());

    if (!this.goalOutPut.endYear)
      this.goalOutPut.endYear = this.goalOutPut.startYear;
    this.goalEmitting.emit(this.goalOutPut);
  }

  getFinanceFrequency() {
    var financeFrequency = "N/A";
    if (this.goalOutPut.financeFrequency != undefined) {
      var frequencyTypes = this.financeFrequencyType.filter(type => type.code == this.goalOutPut.financeFrequency);
      financeFrequency = frequencyTypes[0] && frequencyTypes[0].name;
    }
    return financeFrequency;
  }

  getFundedFrom() {
    var fundedFrom = "N/A";
    if (this.goalOutPut.fundedFrom != undefined) {
      var fundedFromList = this.fundedFromList.filter(fund => fund.code == this.goalOutPut.fundedFrom);
      fundedFrom = fundedFromList[0] && fundedFromList[0].name;
    }
    return fundedFrom;
  }
}