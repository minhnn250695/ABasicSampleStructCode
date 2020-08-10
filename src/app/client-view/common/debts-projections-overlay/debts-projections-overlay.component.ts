import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
// service

import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';
import { ConfigService } from '../../../common/services/config-service';
import { ClientViewService } from '../../client-view.service';
import {
  DebtProjection
} from '../../models';
declare var $: any;

@Component({
  selector: 'common-debts-projections-overlay',
  templateUrl: './debts-projections-overlay.component.html',
  styleUrls: ['./debts-projections-overlay.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DebtsProjectionsOverlayComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  @Input() showIcon: boolean = false;
  // @Input() enabledEdit: boolean = false;
  @Input() buttonShape: string = 'square';
  @Input() iconWidth: number = 20;
  @Input() iconHeight: number = 20;

  debtProjection: DebtProjection = new DebtProjection();
  private houseHoldId: string;

  constructor(
    private clientViewService: ClientViewService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }


  ngOnInit() {
    super.onBaseInit();
    this.initHouseHoldId();
    this.initDebtProjectionModal();
  }

  ngOnDestroy() {
    this.onBaseDestroy();
    $('.popover').popover('hide');
  }

  initHouseHoldId() {
    this.clientViewService.houseHoldObservable.subscribe(houseHold => {
      if (!houseHold) { return; }
      this.houseHoldId = houseHold.id;
    });
  }

  initDebtProjectionModal() {
    // modal event
    $('#debt-projection-modal').on('hidden.bs.modal', () => {
      $('.popover').popover('hide');
    });

    $(".close-popover").click((e) => {
      $('.popover').popover('hide');
    });

    // save data
    $('.save-changes-popover.debt-projection').click((e) => {
      $('.popover').popover('hide');

      let additionalPayment = $('.popover #txtAdditionalPayment').val();
      let debtProjectionUpdate = {
        additionalMonthlyPayment: additionalPayment || this.debtProjection.parameters.additionalMonthlyPayment
      };
      this.clientViewService.showLoading();
      this.clientViewService.updateDebtProjections(debtProjectionUpdate, this.houseHoldId).subscribe(response => {
        if (response.success) {
          this.clientViewService.hideLoading();
          this.debtProjection = { ...response.data };
          this.detectChange();
        }
      });

    });
  }

  /**
   * show modal
   */
  show() {
    $('#debt-projection-modal').modal();
    this.debtProjection = this.cloneObject(this.clientViewService.currentScenario.debtProjections);
    this.detectChange();
  }
}
