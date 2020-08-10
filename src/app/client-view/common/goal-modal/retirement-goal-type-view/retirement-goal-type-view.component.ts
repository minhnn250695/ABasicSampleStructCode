import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GoalsModel } from '../../../models';
import { OptionModel } from '../../../../on-boarding/models';
import { Pairs } from '../../../../revenue-import/models';
import { DatepickerComponent } from '../../../../common/components/datepicker/datepicker.component';
import { OnBoardingCommonComponent } from '../../../../on-boarding/on-boarding-common.component';
import { ɵINTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS } from '@angular/platform-browser-dynamic';
import { ClientViewService } from '../../../client-view.service';
import { AdviceBuilderService } from '../../../advice-builder/advice-builder.service';


declare var $: any;

@Component({
  selector: 'retirement-goal-type-view',
  templateUrl: './retirement-goal-type-view.component.html',
  styleUrls: ['./retirement-goal-type-view.component.css'],
})
export class RetirementGoalTypeViewComponent extends OnBoardingCommonComponent implements OnInit {

  @Input("goal") goalInput: GoalsModel = new GoalsModel();
  @Input() iconCSS: string = "";
  @Input() goalTypeName: string = undefined;
  @Input() clientAssets: Pairs[];
  @Input() clientDebts: Pairs[];
  @Input() readOnly: boolean = false;
  @Output() goalEmitting: EventEmitter<GoalsModel> = new EventEmitter();
  @Input() isLandingPage: boolean = false;
  @Input() showInvestfit: boolean = false;

  private financeFrequencyType: Array<OptionModel<number>>;
  private fundedFromList: Array<OptionModel<number>>;
  private searchTextPH: string = "";
  private goalOutPut: GoalsModel = new GoalsModel();
  private sourceName: string = "";
  private primaryMember: any;
  private spouseMember: any;
  private currentYear: number;

  iconCSSList: string[] = [
    // retirement income
    "fa-cocktail",
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
    private clientViewService: ClientViewService,
    private adviceBuilderService: AdviceBuilderService
  ) { super(); }


  ngOnInit() {
    // reset input value after modal hidden
    $('#update-goal').on('hidden.bs.modal', () => {
      this.resetInputValue();
    });
    this.currentYear = new Date().getFullYear();
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
      // set primary/spouse retirement age
      if (this.isLandingPage) { // client view landing page
        this.primaryMember = this.clientViewService.familyMembers[0];
        this.spouseMember = this.clientViewService.familyMembers[1];
      } else { // advice builder page
        this.primaryMember = this.adviceBuilderService.familyMembers[0];
        this.spouseMember = this.adviceBuilderService.familyMembers[1];
      }
    }

    // if (changes.showInvestfit && changes.showInvestfit.currentValue) {
    // }
  }

  private isShowInvestfit() {
    return this.goalOutPut.name == 'Retirement Income' && this.showInvestfit;
  }

  private goToInvestfit() {
    this.router.navigate(["/client-view/retirement-report"]);
  }
}
