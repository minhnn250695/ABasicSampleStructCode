import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

// Entity
import { DebtProjection, DebtProjectionDetails, InsuranceProjectionDetails } from '../../models';

// Component

// Service
import { AdviceBuilderService } from '../../advice-builder/advice-builder.service';
import { HandleErrorMessageService } from '../../../common/services/handle-error.service';
import { LoadingSpinnerService } from '../../../common/components/loading-spinner/loading-spinner.service';
import { ClientViewService } from '../../client-view.service';

@Component({
  selector: 'insurance-projection-details',
  templateUrl: './insurance-projection-details.component.html',
  styleUrls: ['./insurance-projection-details.component.css']
})
export class InsuranceProjectionDetailsComponent implements OnInit {
  private insurances: InsuranceProjectionDetails[] = [];
  private displayedInsurances: InsuranceProjectionDetails[] = [];
  private strategy: string = localStorage.getItem('selectedStrategyName');
  private strategyId: string = localStorage.getItem('selectedStrategyID');
  private currentStrategyId = localStorage.getItem('currentStrategy');
  private displayedPeriods: Array<number> = [];
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private _location: Location,
    private router: Router,
    private loadingSpinnerService: LoadingSpinnerService,
    private clientViewSerive: ClientViewService,
    private handleErrorMessageService: HandleErrorMessageService
  ) { }

  ngOnInit() {
    this.getInsuranceProjectionDetails();
  }

  private getInsuranceProjectionDetails() {
    this.insurances = this.adviceBuilderService.insuranceProjection;
    if (this.insurances && this.insurances.length == 0) {
      // refresh page => get cashflow from api
      let houseHoldId = localStorage.getItem('houseHoldID');
      this.adviceBuilderService.showLoading()
      this.adviceBuilderService.getPersonalInsuranceProjectionByScenarioId(houseHoldId, this.strategyId).subscribe(res => {
        this.adviceBuilderService.hideLoading()
        if (res.success) {
          this.insurances = res.data;
          this.getStartAndEndOfDisplayedYears();
          this.getDisplayedInsuranceValues();
        } else {
          this.handleErrorMessageService.handleErrorResponse(res);
        }
      })
    }
    else {
      this.getStartAndEndOfDisplayedYears();
      this.getDisplayedInsuranceValues();
    }
  }

  private exportToExcel() {
    /* table id is passed over here */
    let element = document.getElementById('insurance-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'insurance-projection.xlsx');
  }

  private getStartAndEndOfDisplayedYears() {
    if (this.insurances.length > 0) {
      let startYear = 0;
      let endYear = 0;
      this.insurances.forEach((insurance, insuranceIndex) => {
        insurance.personalInsurancePeriods.forEach((period, periodIndex) => {
          if (insuranceIndex === 0 && periodIndex === 0) {
            startYear = period.year;
            endYear = period.year;
          }
          else {
            if (period.year < startYear)
              startYear = period.year;
            if (period.year > endYear)
              endYear = period.year;
          }
        })
      });
      this.generateYears(startYear, endYear);
    }
  }

  private generateYears(startYear: number, endYear: number) {
    for (var i = startYear; i <= endYear; i++)
      this.displayedPeriods.push(i);
  }


  private getDisplayedInsuranceValues() {
    this.insurances.forEach((insurance) => {
      let item = {
        ownerName: insurance.ownerName,
        policyName: insurance.policyName,
        policyNumber: insurance.policyNumber,
        personalInsurancePeriods: []
      }
      this.displayedPeriods.forEach((period) => {
        let periodDetails = {
          year: period,
          totalPremiums: 0
        }
        for (var i = 0; i < insurance.personalInsurancePeriods.length; i++) {
          let insurancePeriod = insurance.personalInsurancePeriods[i];
          if (period === insurancePeriod.year) {
            periodDetails.totalPremiums = insurancePeriod.totalPremiums;
          }
        }
        item.personalInsurancePeriods.push(periodDetails);
      });
      this.displayedInsurances.push(item);
    });
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
