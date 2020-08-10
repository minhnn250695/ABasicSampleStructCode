import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DebtActionModel, DebtCategoryType, DebtType, DebtTypeAction, DrawFundFromDebtModel } from '../../../../../models';
import { OptionModel } from '../../../../../../on-boarding/models';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Router } from '@angular/router';
import { OnBoardingService } from '../../../../../../on-boarding/on-boarding.service';
import { OnBoardingCommonComponent } from '../../../../../../on-boarding/on-boarding-common.component';
import { Pairs } from '../../../../../../revenue-import/models';
import { ConfirmationDialogService } from '../../../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
declare var $: any;

@Component({
  selector: 'draw-funds-from-debt-view-modal',
  templateUrl: './draw-funds-from-debt-modal.component.html',
  styleUrls: ['./draw-funds-from-debt-modal.component.css']
})
export class DrawFundsFromDebtViewModalComponent implements OnInit {
  // #region Properties
  @Input() drawDebt: DrawFundFromDebtModel = new DrawFundFromDebtModel();
  @Input() notClosedDebtList: any[];
  private DebtAccountType = [{ code: 0, name: "Loan" }, { code: 1, name: "OffsetAccount" }];
  private annualAmount: string = "";
  private debtTypeIsOffset: boolean = false;
  // #endregion Properties

  // #region Contructor
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private router: Router,
    private onBoardingService: OnBoardingService,
    private confirmationDialogService: ConfirmationDialogService
  ) { }

  ngOnInit() {
    $('#draw-debt-view').on('hidden.bs.modal', () => {
      $('#draw-fund-debt-details-view').click();
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

  private getDrawDebtName() {
    let debtName = '';
    if (this.notClosedDebtList && this.notClosedDebtList.length > 0) {
      const debtList = JSON.parse(JSON.stringify(this.notClosedDebtList));
      const debtRecord = debtList.filter(debt => debt.id == this.drawDebt.debtId);
      debtName = (debtRecord && debtRecord.length > 0) ? debtRecord[0].name : '';
    }
    return debtName || 'N/A';
  }

  private getContributeTypeText() {
    // update contribute type to radio button on view
    if (this.drawDebt.debtAccountType == 0) { // loan
      return "Loan principal";
    } else if (this.drawDebt.debtAccountType == 1) {
      return "Offset account";
    }
  }
}
