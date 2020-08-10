import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Rx';
// dialog
// import { ErrorDialog } from './../../../common/dialog/error-dialog/error-dialog.component';
// service
import { RevenueImportService } from './../../revenue-import.service';

// model
import { Entity, ErrorCode } from './../../models';
import { BaseComponentComponent } from '../../../common/components/base-component';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';

declare var $: any;
const MAX_TIME = 440; // 120 seconds
const TIME_TICK = 2000; // 2seconds

@Component({
  selector: 'app-check-match-progress',
  templateUrl: './check-match-progress.component.html',
  styleUrls: ['./check-match-progress.component.css']
})
export class CheckMatchProgressComponent extends BaseComponentComponent implements OnInit, OnDestroy {

  private timeCount: number = 0;
  private isComponentDestroy: boolean = false;

  wait: any;
  percent: number;
  // isMobile: boolean;

  constructor(
    private router: Router,
    private mdDialog: MatDialog,
    private crmHanlder: RevenueImportService,
    private confirmationDialogService: ConfirmationDialogService
  ) {
    super();
  }

  ngOnInit() {
    super.checkUsingMobile();

    this.checkingMatchingProgress();
    this.waitResponse();
  }

  ngOnDestroy() {
    this.stopWaiting();
    this.isComponentDestroy = true;
  }

  /**
   * ====================================================================================
   * CHECKING MATCH PROGRESS PART
   * ====================================================================================
   */

  waitResponse() {
    let dots = 0;
    this.wait = setInterval(waitFnct, 800);

    function waitFnct() {
      if (dots < 3) {
        $('#dots').append('.');
        dots++;
      } else {
        $('#dots').html('');
        dots = 0;
      }
    }
  }

  stopWaiting() {
    clearInterval(this.wait);
  }

  /**
   * ====================================================================================
   * PRIVATE PART
   * ====================================================================================
   */
  private checkingMatchingProgress() {
    if (!this.crmHanlder.batchIdentifier)
      this.backToPreviousPage();
    this.crmHanlder.checkingMatchingProgress(this.checkingProgressCallback.bind(this));
  }

  private checkingProgressCallback(error?: string, errorCode?: number, perc?: number, list?: Entity[]) {
    if (this.isComponentDestroy) return;

    // success case
    if (!error && !errorCode) {
      // this.crmHanlder.setMisMatchEntities(list);
      document.getElementById("checkProgressBar").style.width = "100%";
      this.gotoNextPage();
      return;
    }

    // this.percent = perc;
    if (perc) {
      document.getElementById("checkProgressBar").style.width = parseInt(perc.toString()) + "%";
    }

    if (errorCode === ErrorCode.DATE_TIME_IS_MISSING ||
      errorCode === ErrorCode.ADVISER_NOT_FOUND || errorCode === ErrorCode.REVENUE_FIELD_MISSING) {
      let IconfirmationDialog = this.confirmationDialogService.showModal({
        title: "Error #" + errorCode,
        message: error,
        btnOkText: "Back to upload"
      }).subscribe(() => {
        IconfirmationDialog.unsubscribe();
        this.router.navigate(["/revenue/upload"]);
      });
      return;
    }
    else if (errorCode === ErrorCode.BATCH_NOT_FOUND) {
      let IconfirmationDialog = this.confirmationDialogService.showModal({
        title: "Error #" + errorCode,
        message: "Batch id " + error,
        btnOkText: "Back to upload"
      }).subscribe(() => {
        IconfirmationDialog.unsubscribe();
        this.router.navigate(["/revenue/upload"]);
      });
      return;
    }
    else if (errorCode !== ErrorCode.AUTO_MATCH_NOT_COMPLETE) {
      // this.crmHanlder.setMisMatchEntities(list);
      let IconfirmationDialog = this.confirmationDialogService.showModal({
        title: "Error #" + errorCode,
        message: error + ". Do you want to continue?",
        btnOkText: "OK"
      }).subscribe(() => { 
        IconfirmationDialog.unsubscribe();
        this.router.navigate(["/revenue/match-data"]);
      });
      return;
    }

    // match progress is not done, continue to checking
    // timeout
    this.timeCount++;
    if (this.timeCount >= MAX_TIME) {
      this.confirmationDialogService.showModal({
        title: "Warning",
        message: "Time out. Please try again.",
        btnOkText: "Back to upload"
      }).subscribe(() => this.router.navigate(["/revenue/upload"]));
      return;
    }

    Observable.of(null).delay(TIME_TICK)
      .subscribe(() => {
        this.checkingMatchingProgress();
      });
  }

  private gotoNextPage() {
    this.router.navigate(["/revenue/match-data"]);
  }

  private backToPreviousPage() {
    this.router.navigate(["/revenue/upload"]);
  }

}
