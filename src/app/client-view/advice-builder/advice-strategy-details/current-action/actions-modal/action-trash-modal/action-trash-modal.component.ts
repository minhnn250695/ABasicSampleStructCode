import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Router } from '@angular/router';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
declare var $: any;

@Component({
  selector: 'action-trash-modal',
  templateUrl: './action-trash-modal.component.html',
  styleUrls: ['./action-trash-modal.component.css'],
})
export class ActionTrashModalComponent implements OnInit {

  private actionId: string;
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
  ) {
    this.adviceBuilderService.handleSelectedActionValue().subscribe(action => {
      if (action) {
        this.actionId = action.actionId;
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    // resolve the issue unclickable when press "ESC" key
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }

  private deleteSelectedAction() {
    this.adviceBuilderService.showLoading();
    let houseHoldId = localStorage.getItem('houseHoldID');
    let seletedStrategyId = localStorage.getItem('selectedStrategyID');
    this.adviceBuilderService.deleteAction(houseHoldId, seletedStrategyId, this.actionId).subscribe(res => {
      this.adviceBuilderService.hideLoading();
      if (res.success) {
        // reload all data
        this.adviceBuilderService.reloadAllData();
      } else {
        this.handleErrorMessageService.handleErrorResponse(res);
      }
    });
  }
}
