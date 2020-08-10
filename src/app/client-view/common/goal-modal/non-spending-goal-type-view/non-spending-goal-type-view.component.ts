import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GoalsModel } from '../../../models';
import { DatepickerComponent } from '../../../../common/components/datepicker/datepicker.component';
declare var $: any;
@Component({
  selector: 'non-spending-goal-type-view',
  templateUrl: './non-spending-goal-type-view.component.html',
  styleUrls: ['./non-spending-goal-type-view.component.css'],
})

export class NonSpendingGoalTypeViewComponent implements OnInit {

  @Input('goal') goalInput: GoalsModel = new GoalsModel();
  @Input() iconCSS: string = "";
  @Input() goalTypeName: string = "";
  @Input() readOnly: boolean = false;
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
    // emit Out put "goal" to parents
    this.goalEmitting.emit(this.goalOutPut);
  }

  private resetInputValue() {
    this.goalOutPut = new GoalsModel();
  }
}