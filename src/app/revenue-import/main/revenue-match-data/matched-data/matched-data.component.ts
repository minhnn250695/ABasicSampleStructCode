import { Component, EventEmitter, Input, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { FfRouterService } from '../../../../common/services/ff-router.service';
import { FpStorageService } from '../../../../local-storage.service';
import { Entity, RevenueEntity, SortObject } from '../../../models';
import { RevenueImportService } from '../../../revenue-import.service';
import { RevenueMatchDataComponent } from '../revenue-match-data.component';
import { UnmatchDialogComponent } from '../unmatched-data/unmatched-dialog/unmatched-dialog.component';

declare var $: any;

@Component({
  selector: 'match-revenue-data',
  templateUrl: './matched-data.component.html',
  styleUrls: ['./matched-data.component.css']
})
export class MatchedRevenueComponent implements OnInit {

  @ViewChildren('matchDialog') matchDialog: QueryList<UnmatchDialogComponent> = new QueryList<UnmatchDialogComponent>();
  @Input('matchedList') matchedList: Entity[] = [];
  @Output("reloadData") reloadData: EventEmitter<boolean> = new EventEmitter();
  @Output("runLoading") runLoading: EventEmitter<boolean> = new EventEmitter();

  isMobile: boolean;
  showPopUp: boolean = true;
  showDialog: boolean = false;
  advancedRecords: number;
  sortOrder: SortObject = new SortObject();
  activeUnmatchedTab: boolean;

  private selectedEntity: Entity;
  private isDestroy: boolean;

  constructor(private crmHanlder: RevenueImportService,
    private localStorage: FpStorageService,
    private routerService: FfRouterService,
    public mdDialog: MatDialog,
    private confirmationDialogService: ConfirmationDialogService,
    private revenueImportService: RevenueImportService) {
  }
  ngOnInit() {
    // this.closeLoadingDialog();
  }

  /**
   * on manual match button click
   */
  onMatchBtnClick(event: Entity) {
    this.selectedEntity = event;

    this.showDialog = true;
    this.matchDialog.changes.subscribe((comps: QueryList<UnmatchDialogComponent>) => {
      let dialog = comps.first;
      if (this.showDialog && dialog) {
        dialog.showMe();
      }
    });
  }

  onEscapePress(event: any) {
    this.showDialog = false;
  }

  /**
   * get data back from dialog and send to server
   */
  onManualDialogResult(entityBack: RevenueEntity) {
    this.showDialog = false;
    if (entityBack) {
      // this.openLoadingDialog();
      this.runLoading.emit(true);
      this.crmHanlder.manualMatch(entityBack, this.manualMatchCallback.bind(this));
    }
  }

  onDialogCancel(event: any) {
    this.showDialog = false;
  }

  onClickContinueImport(): void {
    // submit import CRM anyway
    this.showPopUp = false;
    this.submitImportCRM(true);
  }

  importToCRMBtnClick() {
    // if there is no any entity => no need to ask by dialog, go straight forward
    if (this.matchedList && this.matchedList.length > 0) {
      this.showPopUp = this.checkMissingProductNumber();
      if (!this.showPopUp) this.submitImportCRM(true);
    }
  }

  btnSortByDateClick() {
    if (!this.sortOrder.byDate) { this.sortOrder.byDate = SortType.ASC; }
    this.matchedList = this.sortByDate(this.sortOrder.byDate, this.matchedList);
    this.sortOrder.byDate = 1 - this.sortOrder.byDate;
  }

  btnSortByClientNameClick() {
    if (!this.sortOrder.byClientName) { this.sortOrder.byClientName = SortType.ASC; }
    this.matchedList = this.sortByClientName(this.sortOrder.byClientName, this.matchedList);
    this.sortOrder.byClientName = 1 - this.sortOrder.byClientName;
  }

  btnSortByProductNumberClick() {
    if (!this.sortOrder.byProductNum) { this.sortOrder.byProductNum = SortType.ASC; }
    this.matchedList = this.sortByProductNumber(this.sortOrder.byProductNum, this.matchedList);
    this.sortOrder.byProductNum = 1 - this.sortOrder.byProductNum;
  }

  handleAdvancedModal(value) {
    this.advancedRecords = parseInt(value, 10);
    $("#advanced-search-match-modal").modal('show');
  }
  /* ============================================================================
  PRIVATE METHODS
  =============================================================================== */

  private manualMatchCallback(error) {
    if (this.isDestroy) {
      this.runLoading.emit(false);
      return;
    }
    if (error) {
      this.runLoading.emit(false);
      this.openErrorDialog(error);
      return;
    }

    this.reloadData.emit(true);
  }

  private submitImportCRM(shouldGo: boolean) {
    if (shouldGo) {
      this.runLoading.emit(true);
      this.crmHanlder.submitImportFile((error) => {
        this.runLoading.emit(false);
        if (error) { this.openErrorDialog(error); return; }
        this.localStorage.saveBashId("");
        this.crmHanlder.batchIdentifier = "";
        if (this.isDestroy) return;
        this.routerService.gotoMatchCompletedPage();
      });
    }
  }

  /**
   * Show error msg
   *
   * @private
   * @param {string} error
   * @param {boolean} [isShowOkBttn=false]
   * @memberof UploadFileCompletedComponent
   */
  private openErrorDialog(error: string, isShowOkBttn: boolean = false) {
    let dialogInput = { msg: error, showOkBtn: isShowOkBttn };

    let subcription: ISubscription = this.confirmationDialogService.showModal({
      title: "Error",
      message: dialogInput.msg,
      btnOkText: "OK"
    }).subscribe(() => subcription.unsubscribe());

  }

  private applySortHistory(list: Entity[]): Entity[] {
    let temp = [...list];
    if (this.sortOrder.byDate || this.sortOrder.byClientName || this.sortOrder.byProductNum) {
      if (this.sortOrder.byDate) temp = this.sortByDate(1 - this.sortOrder.byDate, temp);
      if (this.sortOrder.byClientName) temp = this.sortByClientName(1 - this.sortOrder.byClientName, temp);
      if (this.sortOrder.byProductNum) temp = this.sortByProductNumber(1 - this.sortOrder.byProductNum, temp);
    }
    return temp;
  }

  private sortByDate(order: SortType, list: Entity[] = []): Entity[] {
    return list.sort((a, b) => {
      switch (order) {
        case SortType.ASC:
          return a.date.toString().localeCompare(b.date.toString());
        case SortType.DSC:
          return b.date.toString().localeCompare(a.date.toString());
        default: break;
      }
    });
  }

  private sortByClientName(order: SortType, list: Entity[] = []): Entity[] {
    return list.sort((a, b) => {
      switch (order) {
        case SortType.ASC:
          return a.clientName.localeCompare(b.clientName);
        case SortType.DSC:
          return b.clientName.localeCompare(a.clientName);
        default: break;
      }
    });
  }

  private sortByProductNumber(order: SortType, list: Entity[] = []): Entity[] {
    return list.sort((a, b) => {
      switch (order) {
        case SortType.ASC:
          return a.productNumber.localeCompare(b.productNumber);
        case SortType.DSC:
          return b.productNumber.localeCompare(a.productNumber);
        default: break;
      }
    });
  }
  private checkMissingProductNumber() {
    let isMissing = false;
    isMissing = this.matchedList.filter(record => !record.productNumber || record.productNumber === "").length > 0;
    return isMissing;
  }
}

export enum SortType {
  ASC,
  DSC
}
