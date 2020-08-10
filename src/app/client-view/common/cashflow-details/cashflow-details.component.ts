import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

// Entity
import { CashFlowDetails } from '../../models';

// Service
import { AdviceBuilderService } from '../../advice-builder/advice-builder.service';
import { HandleErrorMessageService } from '../../../common/services/handle-error.service';
import { LoadingSpinnerService } from '../../../common/components/loading-spinner/loading-spinner.service';
import { ClientViewService } from '../../client-view.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'common-cashflow-details',
  templateUrl: './cashflow-details.component.html',
  styleUrls: ['./cashflow-details.component.css']
})
export class CashflowDetailsComponent implements OnInit {
  private cashFlowDetails: CashFlowDetails[] = [];
  private strategy: string = localStorage.getItem('selectedStrategyName');
  private strategyId: string = localStorage.getItem('selectedStrategyID');
  private currentStrategyId = localStorage.getItem('currentStrategy');
  private currentDisplayType: string;
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private loadingSpinnerService: LoadingSpinnerService,
    private clientViewSerive: ClientViewService,
    private _location: Location,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.getCashFlowDetails();
    this.currentDisplayType = "Income";
  }

  private getCashFlowDetails() {
    this.cashFlowDetails = this.adviceBuilderService.cashFlowDetails;
    if (this.cashFlowDetails && this.cashFlowDetails.length == 0) {
      // refresh page => get cashflow from api
      let houseHoldId = localStorage.getItem('houseHoldID');
      this.adviceBuilderService.showLoading()
      this.adviceBuilderService.getScenarioDetails(houseHoldId, this.strategyId).subscribe(res => {
        this.adviceBuilderService.hideLoading()
        if (res.success) {
          this.cashFlowDetails = res.data && res.data.cashFlow && res.data.cashFlow.details;
        } else {
          this.handleErrorMessageService.handleErrorResponse(res);
        }
      })
    }
  }

  private exportToExcel() {
    /* table id is passed over here */
    let element = document.getElementById('cashflow-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'cashflow-projection.xlsx');
  }

  private showDetails(type: string) {
    if (type) {
      if (type != this.currentDisplayType)
        this.currentDisplayType = type;
      else
        this.currentDisplayType = "";
    }
  }

  private backClicked() {
    localStorage.setItem('strategy_storaged_no_reload', 'true');
    this._location.back();
  }

  private goToPage(page: string) {
    let url = '/client-view/advice-builder';
    if (page == 'advice-homepage') {
      localStorage.setItem('selectedStrategyID', '');
    }
    else if (page == 'edit-strategy')
      url += '/strategy-details';
    this.router.navigate([url]);
  }
}
