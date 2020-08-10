import { Component, OnInit, SimpleChange } from '@angular/core';
import { AssetProjectionDetails } from '../../models';
import { AdviceBuilderService } from '../../advice-builder/advice-builder.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router'
import { HandleErrorMessageService } from '../../../common/services/handle-error.service';
import { LoadingSpinnerService } from '../../../common/components/loading-spinner/loading-spinner.service';
import { ClientViewService } from '../../client-view.service';
import * as XLSX from 'xlsx';


@Component({
  selector: 'common-asset-projections-detail',
  templateUrl: './asset-projections-detail.component.html',
  styleUrls: ['./asset-projections-detail.component.css'],
})
export class AssetProjectionsDetailComponent implements OnInit {
  // #region Properties
  private assetProjections: any;
  private displayDetails: any;
  private currentDisplayAsset: string;
  private strategy: string = localStorage.getItem('selectedStrategyName');
  private strategyId: string = localStorage.getItem('selectedStrategyID');
  private currentStrategyId = localStorage.getItem('currentStrategy');
  private assetExportData: any[] = [];
  // #endregion

  // #region Contructors
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private loadingSpinnerService: LoadingSpinnerService,
    private clientViewSerive: ClientViewService,
    private _location: Location,
    private router: Router
  ) { }

  ngOnInit() {
    this.getAssetProjectionDetails();
  }

  private getAssetProjectionDetails() {
    this.assetProjections = this.adviceBuilderService.assetProjections;

    if (this.assetProjections && this.assetProjections.length == 0) {
      // refresh page => get cashflow from api
      let houseHoldId = localStorage.getItem('houseHoldID');
      this.adviceBuilderService.showLoading()
      this.adviceBuilderService.getAssetProjectionByScenarioId(houseHoldId, this.strategyId).subscribe(res => {
        this.adviceBuilderService.hideLoading();
        if (res.success) {
          this.assetProjections = res.data;
          this.getAssetProjectionDetailsDisplayData();
        } else {
          this.handleErrorMessageService.handleErrorResponse(res);
        }
      });
    }
    else {
      this.getAssetProjectionDetailsDisplayData();

    }
  }

  private exportToExcel() {
    /* table id is passed over here */
    let element = document.getElementById('asset-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'asset-projection.xlsx');
  }

  private getAssetProjectionDetailsDisplayData() {
    this.displayDetails = [];
    let assetFields = [
      { name: "Member", value: "accountBalance" },
      // { name: "Account Balance", value: "accountBalance" },
      { name: "Income Drawn", value: "incomeDrawn" },
      { name: "Transfer", value: "transfer" },
      { name: "Net Contributions", value: "netContributions" }
    ]
    if (this.assetProjections && this.assetProjections.length > 0) {
      for (var i = 0; i < this.assetProjections[0].assets.length; i++) {
        let asset = this.assetProjections[0].assets[i];
        if (i == 0)
          this.currentDisplayAsset = 'asset-0';
        for (var f = 0; f < assetFields.length; f++) {
          let field = assetFields[f];
          let record = {
            id: 'asset-' + i,
            name: field.value == 'accountBalance' ? asset.name : field.name,
            data: [],
            isTitle: field.value == 'accountBalance' ? true : false,
            parent: asset.name
          };
          for (var n = 0; n < this.assetProjections.length; n++) {
            let _each = this.assetProjections[n];
            record.data.push(_each.assets[i][field.value]);

          }
          this.displayDetails.push(record);
        }
      }
    }
  }

  private showAssetDetails(asset: string) {
    if (asset) {
      if (asset != this.currentDisplayAsset)
        this.currentDisplayAsset = asset;
      else
        this.currentDisplayAsset = "";
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
  //#endregion

}
