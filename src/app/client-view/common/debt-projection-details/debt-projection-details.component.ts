import { Component, OnInit, SimpleChange } from '@angular/core';
import { DebtProjection, DebtProjectionDetails } from '../../models';
import { AdviceBuilderService } from '../../advice-builder/advice-builder.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { HandleErrorMessageService } from '../../../common/services/handle-error.service';
import { LoadingSpinnerService } from '../../../common/components/loading-spinner/loading-spinner.service';
import { ClientViewService } from '../../client-view.service';
import * as XLSX from "xlsx";
@Component({
  selector: 'debt-projection-details',
  templateUrl: './debt-projection-details.component.html',
  styleUrls: ['./debt-projection-details.component.css']
})
export class DebtProjectionDetailsComponent implements OnInit {
  private debtDetails: DebtProjectionDetails[] = [];
  private strategy: string = localStorage.getItem('selectedStrategyName');
  private strategyId: string = localStorage.getItem('selectedStrategyID');
  private currentStrategyId = localStorage.getItem('currentStrategy');
  private currentDisplayDebt: number = 10000;

  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private loadingSpinnerService: LoadingSpinnerService,
    private clientViewSerive: ClientViewService,
    private _location: Location,
    private router: Router
  ) { }

  ngOnInit() {
    this.getDebtProjectionDetails();
  }

  private getDebtProjectionDetails() {
    this.debtDetails = this.adviceBuilderService.debtProjections;
    if (this.debtDetails && this.debtDetails.length == 0) {
      // refresh page => get cashflow from api
      let houseHoldId = localStorage.getItem('houseHoldID');
      this.adviceBuilderService.showLoading()
      this.adviceBuilderService.getDebtProjectionByScenarioId(houseHoldId, this.strategyId).subscribe(res => {
        this.adviceBuilderService.hideLoading()
        if (res.success) {
          this.debtDetails = res.data;
          // this.currentDisplayDebt = this.debtDetails[0] && this.debtDetails[0].debtName;
          if (this.debtDetails && this.debtDetails.length > 0)
            this.currentDisplayDebt = 0;
        } else {
          this.handleErrorMessageService.handleErrorResponse(res);
        }
      })
    }
  }

  private exportToExcel() {
    /* table id is passed over here */
    let element = document.getElementById('debt-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'debt-projection.xlsx');
  }

  private showDebtDetails(debtIndex: number) {
    if (debtIndex != this.currentDisplayDebt)
      this.currentDisplayDebt = debtIndex;
    else
      this.currentDisplayDebt = 10000;
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
