import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GoalsModel, RetirementIncomeGoalsModel } from '../../../models';
import { OptionModel } from '../../../../on-boarding/models';
import { Pairs } from '../../../../revenue-import/models';
import { DatepickerComponent } from '../../../../common/components/datepicker/datepicker.component';
import { OnBoardingCommonComponent } from '../../../../on-boarding/on-boarding-common.component';
import { ɵINTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS } from '@angular/platform-browser-dynamic';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ISubscription } from 'rxjs/Subscription';
import { AdviceBuilderService } from '../../../advice-builder/advice-builder.service';
import { ClientViewService } from '../../../client-view.service';


declare var $: any;

@Component({
  selector: 'retirement-goal-type',
  templateUrl: './retirement-goal-type.component.html',
  styleUrls: ['./retirement-goal-type.component.css'],
})
export class RetirementGoalTypeComponent implements OnInit {

  @Input("goal") goalInput: RetirementIncomeGoalsModel = new RetirementIncomeGoalsModel();
  @Input() iconCSS: string = "";
  @Input() goalTypeName: string = undefined;
  @Input() readOnly: boolean = false;
  @Input() isCreateGoal: boolean = true;
  @Output() goalEmitting: EventEmitter<RetirementIncomeGoalsModel> = new EventEmitter();
  @Input() isLandingPage: boolean = false;
  @Input() showInvestfit: boolean = false;

  private goalOutPut: RetirementIncomeGoalsModel; // we have not goal retirement Model
  private primaryMember: any;
  private spouseMember: any;
  private desireRetirementIncome: string;
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
    private confirmationDialogService: ConfirmationDialogService,
    private adviceBuilderService: AdviceBuilderService,
    private clientViewService: ClientViewService,
  ) { }


  ngOnInit() {
    // reset input value after modal hidden
    $('#update-goal').on('hidden.bs.modal', () => {
      this.resetInputValue();
    });
  }

  ngOnDestroy() {

  }

  private resetInputValue() {
    // update do not reset value
    this.goalOutPut = new RetirementIncomeGoalsModel();
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

      // add current symbol for goal mount if it have value
      if (this.goalOutPut.desireRetirementIncome) {
        this.desireRetirementIncome = "$" + this.goalOutPut.desireRetirementIncome.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
      } else {
        this.desireRetirementIncome = "$0";
      }
    }
    if (changes.goalTypeName && changes.goalTypeName.currentValue) {
    }
  }

  private emitGoalToSave() {
    // emit Out put "goal" to parents
    this.goalOutPut.desireRetirementIncome = parseInt(this.desireRetirementIncome.replace(/[^0-9.`-]+/g, ""));
    this.goalEmitting.emit(this.goalOutPut);
    $('#update-goal').modal("hide");
  }

  private onAmountFocus(value) {
    if (value && value != "") {
      this.desireRetirementIncome = value.replace(/[^0-9.`-]+/g, "");
    }
  }

  private viewDetectChange() {
    if (!this.isCreateGoal) { // is update goal
      // if goal input different from goalInput => change
      if (this.goalInput.desireRetirementIncome != this.goalOutPut.desireRetirementIncome
      ) {
        return true;
      }
    }
    // create new goal or not change
    return false;
  }

  private onAmountFocusOut(value) {
    if (value && value != "") {
      this.desireRetirementIncome = '$' + value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }
  }

  private onAmountKeyup(event) {
    let value = event.target && event.target.value;
    this.goalOutPut.desireRetirementIncome = value.replace(/[^0-9.`-]+/g, "");
  }

  private isShowInvestfit() {
    return this.goalOutPut.name == 'Retirement Income' && this.showInvestfit;
  }

  private goToInvestfit() {
    this.router.navigate(["/client-view/retirement-report"]);
  }
}

