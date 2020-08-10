import {
  ChangeDetectionStrategy, Component, Input, OnDestroy,
  OnInit, ViewChild, SimpleChanges, Output, EventEmitter, ChangeDetectorRef
} from '@angular/core';
// services
import { ConfigService } from '../../../common/services/config-service';

// components
import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';
import { DebtProjection, ScenarioDebt } from '../../models';
import { ClientViewService } from '../../client-view.service';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { AdviceBuilderService } from '../../advice-builder/advice-builder.service';
import { HandleErrorMessageService } from '../../../common/services/handle-error.service';
import { Observable } from 'rxjs';

declare var $: any;
@Component({
  selector: 'common-client-assets-debts',
  templateUrl: './client-assets-debts.component.html',
  styleUrls: ['./client-assets-debts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientAssetsDebtsComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  @Input('asset') asset: any;
  @Input('assetProjections') assetProjections: any;
  @Input('debtProjections') debtProjections: any;
  @Input('debt') debt = new ScenarioDebt();
  @Input() showThumbsUpDown: boolean = true;
  @Input() isAdviceBuilderPage: boolean = true;
  private iSubscription: ISubscription;

  constructor(
    configService: ConfigService,
    private clientViewService: ClientViewService,
    private confirmationDialogService: ConfirmationDialogService,
    changeDetectorRef: ChangeDetectorRef,
    private handleErrorMessageService: HandleErrorMessageService,
    private adviceBuilderService: AdviceBuilderService,
  ) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    super.onBaseInit();
    this.setupPopover();
  }

  ngOnDestroy() {
    this.onBaseDestroy();

    if (this.iSubscription) {
      this.iSubscription.unsubscribe();
    }
  }

  /**==================================================
                     INITIAL SETUP
  =====================================================*/
  private setupPopover() {
    $(".close-popover").click((e) => {
      this.hide();
    });

    $('.save-changes-popover.desire-year').click((e) => {
      this.hide();
      let yearToPay = $('.popover #year-to-pay').val();
      this.updateDesireYearToPay(yearToPay);
    });
  }

  /**==================================================
                   EVENT HANDLER
  =====================================================*/
  private updateDesireYearToPay(yearToPay: number) {
    this.clientViewService.showLoading();
    let houseHoldId = localStorage.getItem('houseHoldID');
    let seletedStrategy = this.adviceBuilderService.selectedScenario;

    let observable: Observable<any>[] = [];
    if (!this.isAdviceBuilderPage || (seletedStrategy && seletedStrategy.scenarioType === 0)) { // home page or current situation strategy
      observable.push(this.clientViewService.updateDesireYearToPay(houseHoldId, yearToPay));
    } else {
      seletedStrategy.debtScenario = {
        wishedYearsToPay: yearToPay
      }
      observable.push(this.adviceBuilderService.editStrategy(houseHoldId, seletedStrategy));
    }
    this.iSubscription = Observable.zip.apply(null, observable).subscribe(response => {
      if (this.iSubscription) {
        this.iSubscription.unsubscribe();
      }
      if (response[0].success) {
        this.debt.wishedYearsToPay = yearToPay;
        this.clientViewService.reloadCurrentScenario(houseHoldId).subscribe(res => {
          this.clientViewService.hideLoading();
          this.debt = res && res.data && res.data.debt;
          this.detectChange();
        });
      } else {
        this.handleErrorMessageService.handleErrorResponse(response[0]);
      }
    })
  }

  private hide() {
    $('.popover').popover('hide');
  }


  /**==================================================
                     MOBILE EVENT HANDLER
  =====================================================*/
  private onclickMinus() {
    let yearToPay = this.debt && this.debt.wishedYearsToPay;
    if (yearToPay == 1) { return };
    this.updateDesireYearToPay(yearToPay - 1);
  }

  private onclickPlus() {
    let yearToPay = this.debt && this.debt.wishedYearsToPay;
    this.updateDesireYearToPay(yearToPay + 1);
  }
}
