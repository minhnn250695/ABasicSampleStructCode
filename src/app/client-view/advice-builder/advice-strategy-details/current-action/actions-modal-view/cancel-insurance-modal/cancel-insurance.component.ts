import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { OptionModel } from '../../../../../../on-boarding/models';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CancelInsurancePolicyActionModel } from '../../../../../models';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
declare var $: any;

@Component({
  selector: 'cancel-insurance-view-modal',
  templateUrl: './cancel-insurance.component.html',
  styleUrls: ['./cancel-insurance.component.css'],
})
export class CancelInsuranceViewModalComponent implements OnInit {

  @Input() cancelPolicy: CancelInsurancePolicyActionModel = new CancelInsurancePolicyActionModel();
  @Input() activeInsuranceNotClosedList: any[] = [];
  @Input() closedInsuranceList: any[] = [];

  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private router: Router,
  ) { }

  ngOnInit() {
    $('#cancel-insurance-view').on('hidden.bs.modal', () => {
      $('#cancel-insurance-details-view').click();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  ngOnDestroy() {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }

  private getClosedInsurance() {
    if (!this.closedInsuranceList || !this.activeInsuranceNotClosedList) return;
    let closedInsuranceUpdate = this.defineInsuranceList(this.cancelPolicy).filter(insurance => insurance.id == this.cancelPolicy.personalInsuranceId);
    return closedInsuranceUpdate[0] && closedInsuranceUpdate[0].name || "N/A";
  }

  private defineInsuranceList(cancelPolicy: CancelInsurancePolicyActionModel) {
    // case 1 : it's a close insurance in current year or in the past
    // if (this.cancelPolicy.year <= new Date().getFullYear()) {
    //   return (this.closedInsuranceList && this.closedInsuranceList.length > 0) ? this.closedInsuranceList : [];
    // } // case 2: close insurance in the future
    // else { return (this.activeInsuranceNotClosedList && this.activeInsuranceNotClosedList.length > 0) ? this.activeInsuranceNotClosedList : []; }
    return this.closedInsuranceList.concat(this.activeInsuranceNotClosedList);
  }
}
