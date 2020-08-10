import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GoalsModel } from '../../../models';
import { DatepickerComponent } from '../../../../common/components/datepicker/datepicker.component';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
declare var $: any;
@Component({
  selector: 'non-spending-goal-type',
  templateUrl: './non-spending-goal-type.component.html',
  styleUrls: ['./non-spending-goal-type.component.css'],
})

export class NonSpendingGoalTypeComponent implements OnInit {

  @Input('goal') goalInput: GoalsModel = new GoalsModel();
  @Input() iconCSS: string = "";
  @Input() goalTypeName: string = "";
  @Input() readOnly: boolean = false;
  @Input() isCreateGoal: boolean = true;
  @Output() goalEmitting: EventEmitter<GoalsModel> = new EventEmitter();
  private goalOutPut: GoalsModel = new GoalsModel();
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
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router,
  ) { }


  ngOnInit() {
    // reset input value after modal hidden
    $('#update-goal').on('hidden.bs.modal', () => {
      this.resetInputValue();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.goalInput && changes.goalInput.currentValue) {
      this.goalOutPut = JSON.parse(JSON.stringify(this.goalInput));
    }
  }

  private emitGoalToSave() {
    let isValidFirstYear = this.validateYearCreate(this.goalOutPut.startYear);
    if (isValidFirstYear) {
      // emit Out put "goal" to parents
      this.goalEmitting.emit(this.goalOutPut);
      $('#update-goal').modal('hide');
    } else {
      let currentYear = new Date().getFullYear().toString();
      if (!isValidFirstYear) {
        this.showInvalidYear('Starting year', currentYear);
      }
    }
  }

  private resetInputValue() {
    this.goalOutPut = new GoalsModel();
  }

  private viewDetectChange() {
    // if (!this.isCreateGoal) { // is update goal
      // if goal input different from goalInput => change
      if (this.goalInput.name != this.goalOutPut.name ||
        this.goalInput.startYear != this.goalOutPut.startYear ||
        this.goalInput.description != this.goalOutPut.description
      ) {
        return true;
      }
    // }
    // create new goal or not change
    return false;
  }


  private validateYearCreate(createYear: number) {
    let currentYear = new Date().getFullYear();
    if (currentYear > createYear)
      return false;
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