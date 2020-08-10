import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ContributeDebtActionModel } from '../../../../../models';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../../../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Observable } from 'rxjs';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
declare var $: any;


@Component({
  selector: 'contribute-funds-to-debt-view-modal',
  templateUrl: './contribute-funds-to-debt-modal.component.html',
  styleUrls: ['./contribute-funds-to-debt-modal.component.css']
})
export class ContributeFundsToDebtViewModalComponent implements OnInit {

  // #region Properties
  @Input() notClosedDebtList: any[];
  @Input() contributeDebt: ContributeDebtActionModel = new ContributeDebtActionModel();
  private DebtAccountType = [{ code: 0, name: "Loan" }, { code: 1, name: "OffsetAccount" }];
  private annualAmount: string = "";
  private debtTypeIsOffset: boolean = false;

  // #endregion Properties

  // #region Contructor
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private router: Router,
    private confirmationDialogService: ConfirmationDialogService
  ) { }

  ngOnInit() {
    $('#contribute-debt-view').on('hidden.bs.modal', () => {
      $('#contribute-funds-debt-details-view').click();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  ngOnDestroy() {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }
  // #endregion  

  private getContributeDebtName() {
    let debtName = '';
    if (this.notClosedDebtList && this.notClosedDebtList.length > 0) {
      const debtList = JSON.parse(JSON.stringify(this.notClosedDebtList));
      const debtRecord = debtList.filter(debt => debt.id == this.contributeDebt.debtId);
      debtName = (debtRecord && debtRecord.length > 0) ? debtRecord[0].name : '';
    }
    return debtName || 'N/A';
  }

  private getContributeTypeText() {
    // update contribute type to radio button on view
    if (this.contributeDebt.debtAccountType == 0) { // loan
      return "Loan principal";
    } else if (this.contributeDebt.debtAccountType == 1) {
      return "Offset account";
    }// offset
  }
}
