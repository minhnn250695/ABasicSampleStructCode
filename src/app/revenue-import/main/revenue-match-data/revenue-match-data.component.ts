import {
  AfterViewInit, Component, ContentChild, ElementRef,
  OnDestroy, OnInit, QueryList, ViewChild, ViewChildren
} from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { FfRouterService } from '../../../common/services/ff-router.service';
// Service
import { FpStorageService } from '../../../local-storage.service';
import { RevenueImportService } from '../../revenue-import.service';
import { LoadingSpinnerService } from '../../../common/components/loading-spinner/loading-spinner.service';
// dialog
import { LoadingDialog } from '../../../common/dialog/loading-dialog/loading-dialog.component';

// models
import { Observable } from 'rxjs';
import { Entity, EventCode, ManualMatchRequest, Pairs, RevenueEntity, SortObject } from '../../models';

declare var $: any;

@Component({
  selector: 'app-revenue-match-data',
  templateUrl: './revenue-match-data.component.html',
  styleUrls: ['./revenue-match-data.component.css']
})

export class RevenueMatchDataComponent implements OnInit, OnDestroy {

  // @ViewChildren('matchDialog') matchDialog: QueryList<MatchDialogComponent> = new QueryList<MatchDialogComponent>();

  selectedEntity: Entity;
  isDestroy: boolean;

  isMobile: boolean;
  // misMatchEntities: Entity[];
  showPopUp: boolean = true;
  showDialog: boolean = false;

  matchedRevenueDataList: Entity[] = [];
  unmatchedRevenueDataList: Entity[] = [];
  activeMatchedTab: boolean = true;
  sortOrder: SortObject = new SortObject();
  private iSub: ISubscription;
  constructor(private crmHanlder: RevenueImportService,
    private localStorage: FpStorageService,
    private confirmationDialogService: ConfirmationDialogService,
    private revenueImportService: RevenueImportService,
    private loadingService: LoadingSpinnerService,
    private router: Router) {
  }

  ngOnInit() {
    if (navigator.userAgent.includes("Mobile")) {
      this.isMobile = true;
      $('body').css('padding-top', '0');
    }
    else this.isMobile = false;
    this.isDestroy = false;

    let bashId = this.localStorage.getBashId();
    this.getNecessaryData(bashId);
    this.getMatchedUnmatchedRevenue(bashId);
  }

  ngOnDestroy() {
    this.isDestroy = true;
  }

  /**
   *
   * @param tab : 1 is matched tab
   *              2 is unmatched tab
   */
  tabClick() {
    this.activeMatchedTab = !this.activeMatchedTab;
  }

  reloadUnmatchedData(event: boolean) {
    if (event) {
      let bashId = this.localStorage.getBashId();
      this.loadingService.show();
      this.getMatchedUnmatchedRevenue(bashId, true, true, true);
    }
  }
  reloadMatchedData(event: boolean) {
    if (event) {
      let bashId = this.localStorage.getBashId();
      this.loadingService.show();
      this.getMatchedUnmatchedRevenue(bashId, true, false, true);
    }
  }

  getNecessaryData(bashId: string) {
    this.loadingService.show();
    this.crmHanlder.getNeededData(bashId, (result) => {
      this.loadingService.hide();
      if (!result.success) {
        // this.loadingService.show();
        let iSub: ISubscription = this.confirmationDialogService.showModal({
          title: "Error",
          message: result.error && result.error.message,
          btnOkText: 'Ok'
        }).subscribe(() => { iSub.unsubscribe(); this.router.navigate([""]); });
      }
    });
  }

  getMatchedUnmatchedRevenue(bashId: string, getMatched: boolean = true, getUnmatched: boolean = true, reload: boolean = false) {
    let observables: Array<Observable<any>> = [];
    let companyId = localStorage.getItem('companyId');
    if (getMatched)
      observables.push(this.revenueImportService.getMatchedRevenueRecords(companyId, bashId));
    if (getUnmatched)
      observables.push(this.revenueImportService.getUnmatchedRevenueRecords(companyId, bashId));

    this.iSub = Observable.zip.apply(null, observables).subscribe(responses => {
      if (this.iSub) {
        this.iSub.unsubscribe();
      }
      if (reload === true) {
        this.loadingService.show();
      }
      if (responses && responses.length > 0) {
        let index = 0;
        if (getMatched && responses[index] && responses[index].success) {
          this.matchedRevenueDataList = this.applySortHistory(responses[index++].data.data);
        }
        else if (responses[index++] != null) {
          this.showError(responses[index] && responses[index].error);
        }

        if (getUnmatched && responses[index] && responses[index].success)
          this.unmatchedRevenueDataList = this.applySortHistory(responses[index].data.data);
        else if (responses[index] != null) {
          this.showError(responses[index] && responses[index].error);
        }
      }
    });
  }

  applySortHistory(list: Entity[]): Entity[] {
    let temp = [...list];
    if (this.sortOrder.byDate || this.sortOrder.byClientName || this.sortOrder.byProductNum) {
      if (this.sortOrder.byDate) temp = this.sortByDate(1 - this.sortOrder.byDate, temp);
      if (this.sortOrder.byClientName) temp = this.sortByClientName(1 - this.sortOrder.byClientName, temp);
      if (this.sortOrder.byProductNum) temp = this.sortByProductNumber(1 - this.sortOrder.byProductNum, temp);
    }
    return temp;
  }

  showError(error) {
    let iSub: ISubscription = this.confirmationDialogService.showModal({
      title: "Error " + error.errorCode,
      message: "" + error.errorMessage,
      btnOkText: "Ok"
    }).subscribe(() => {
      iSub.unsubscribe();
      this.router.navigate(['']);
    });
  }

  private openLoading(event: boolean) {
    if (event) {
      this.loadingService.show();
    } else this.loadingService.hide();
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
}

export enum SortType {
  ASC,
  DSC
}
