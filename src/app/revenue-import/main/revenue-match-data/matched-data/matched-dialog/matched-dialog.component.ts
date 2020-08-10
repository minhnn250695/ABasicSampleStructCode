import {
  Component, EventEmitter, Inject, Input, OnInit, Output,
  QueryList, ViewChildren
} from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';

// models
import { Entity, Pairs, RevenueEntity } from '../../../../models';

// service
import { RevenueImportService } from '../../../../revenue-import.service';
import { LoadingSpinnerService } from '../../../../../common/components/loading-spinner/loading-spinner.service';



declare var $: any;

@Component({
  selector: 'fp-match-dialog',
  templateUrl: './matched-dialog.component.html',
  styleUrls: ['./matched-dialog.component.css']
})
export class MatchDialogComponent implements OnInit {

  @Input() entity: Entity;
  @Output("onDialogResult") dialogResultEvent = new EventEmitter();
  @Output("onDialogCancel") dialogCancelEvent = new EventEmitter();
  @Output("keyPress") keyPressEvent = new EventEmitter();
  @Output("showAdvancedSearchModal") showAdvancedSearchModal = new EventEmitter();

  // @ViewChildren(RowContentComponent) rowConntents: QueryList<RowContentComponent>;

  // revenue category
  selectedRevenueCatetoryPosition: number;
  originalRevenueCatetoryPosition: number;
  revenueCatetorySource: Pairs[];
  // revenue type
  revenueTypeSource: Pairs[];
  revenueEntity: RevenueEntity;

  clientAssets: Pairs[] = [];
  clientDebts: Pairs[] = [];
  productProvider: Pairs[] = [];

  constructor(private crmHanlder: RevenueImportService,
    private loadingService: LoadingSpinnerService) {
  }

  ngOnInit() {
    this.revenueCatogerySetup();
    //
    this.revenueEntity = this.getDefaultRevenueEntity();
    this.revenueTypeSource = this.crmHanlder.getRevenueTypeOptions();
    this.clientAssets = [...this.crmHanlder.getClientAssets()];
    this.clientDebts = [...this.crmHanlder.getClientDebts()];
    this.productProvider = [...this.crmHanlder.getProductProviders()];
    this.checkInputChange();

  }



  showMe() {
    $('#manual-match-modal').modal({
      backdrop: 'static',
    });

    $('#manual-match-modal').modal();
  }

  hideMe() {
    $('#manual-match-modal').modal("hide");
  }

  /**
   * Validate input if valid, then close dialog and return the updated entity
   * to caller
   */
  validateAndClose() {
    if (this.isValidData()) {
      this.updateRevenueEntity();
      this.dialogResultEvent.emit(this.revenueEntity);
      this.hideMe();
    }
  }

  /**nothing difference from selected record and value of inputs on showing dialog
   * then inputs change nothing
   */
  checkInputChange() {
    if (this.revenueEntity.productProviderId === this.entity.productProviderId &&
      this.revenueEntity.clientId === this.entity.clientId &&
      this.revenueEntity.clientAssetId === this.entity.clientAssetId &&
      this.revenueEntity.clientDebtId === this.entity.clientDebtId &&
      this.revenueEntity.personalInsuranceId === this.entity.personalInsuranceId &&
      this.revenueEntity.opportunityId === this.entity.opportunityId &&
      this.selectedRevenueCatetoryPosition === this.originalRevenueCatetoryPosition)
      return false;
    return true;
  }

  escapePress(e) {
    if (e.which === 27) {
      this.keyPressEvent.emit(false);
    }
  }

  cancelClick() {
    this.hideMe();
    this.dialogCancelEvent.emit(false);
  }

  isShowOpportunityRow(): Boolean {
    if (this.entity && this.entity.revenueType) {
      return this.entity.revenueType.toLowerCase() === "upfront";
    }
    return false;
  }

  getReturnData(item) {
    if (item) {
      switch (item.type) {
        case "product":
          this.revenueEntity.productProviderId = item.id;
          this.revenueEntity.productProviderName = item.value;
          break;
        case "client":
          this.revenueEntity.clientId = item.id;
          this.revenueEntity.originalClientName = item.value;
          break;
        case "clientAsset":
          this.revenueEntity.clientAssetId = item.id;
          this.revenueEntity.clientAssetName = item.value;
          break;
        case "clientDebt":
          this.revenueEntity.clientDebtId = item.id;
          this.revenueEntity.clientDebtName = item.value;
          break;
        case "personal":
          this.revenueEntity.personalInsuranceId = item.id;
          this.revenueEntity.personalInsuranceName = item.value;
          break;
        case "opportunity":
          this.revenueEntity.opportunityId = item.id;
          this.revenueEntity.opportunityName = item.value;
          break;
        default: break;
      }
      this.checkInputChange();
    }
  }


  isInsuranceCategorySelected(): boolean {
    let position = this.selectedRevenueCatetoryPosition;
    if (this.revenueCatetorySource && this.revenueCatetorySource.length > position) {
      let category: Pairs = this.revenueCatetorySource[position];
      if (category.value === "Life Insurance Commission") return true;
    }

    return false;
  }

  isLendingCategorySelected(): boolean {
    let position = this.selectedRevenueCatetoryPosition;
    if (this.revenueCatetorySource && this.revenueCatetorySource.length > position) {
      let category: Pairs = this.revenueCatetorySource[position];
      if (category.value === "Lending Commission") return true;
    }

    return false;
  }

  getClientAssetsByKeyWord(key: string) {
    this.loadingService.show();
    this.crmHanlder.getClientAssetByKeyWord(key).subscribe(response => {
      let dataRes = [...response.data.data];
      this.showAdvancedSearchModal.emit(dataRes.length);
      this.clientAssets = [...this.clientAssets, ...response.data.data];
      this.loadingService.hide();
    });
  }

  getClientDebtsByKeyWord(key: string) {
    this.loadingService.show();
    this.crmHanlder.getClientDebtByKeyWord(key).subscribe(response => {
      let dataRes = [...response.data.data];
      this.showAdvancedSearchModal.emit(dataRes.length);
      this.clientDebts = [...this.clientDebts, ...response.data.data];
      this.loadingService.hide();
    });
  }

  getProductProvidersByKeyWord(key: string) {
    this.loadingService.show();
    this.crmHanlder.getProductProviderByKeyWord(key).subscribe(response => {
      let dataRes = [...response.data.data];
      this.showAdvancedSearchModal.emit(dataRes.length);
      this.productProvider = [...this.productProvider, ...response.data.data];
      this.loadingService.hide();
    });
  }

  /**
   * ====================================================================================
   * PRIVATE PART
   * ====================================================================================
   */
  private isValidData(): boolean {
    return true;
  }

  /**
   * Update revenue entity before returning it into caller
   *
   * @private
   * @memberof MatchDialog
   */
  private updateRevenueEntity() {
    // this.rowConntents.forEach((item) => {
    //   let selectedValue = item.getSelectedValue();
    //   if (!selectedValue) return;
    //   switch (item.id) {
    //     case "product":
    //       this.revenueEntity.productProviderId = selectedValue.id
    //       this.revenueEntity.productProviderName = selectedValue.value;
    //       break;
    //     case "client":
    //       this.revenueEntity.clientId = selectedValue.id
    //       this.revenueEntity.originalClientName = selectedValue.value;
    //       break;
    //     case "clientAsset":
    //       this.revenueEntity.clientAssetId = selectedValue.id
    //       this.revenueEntity.clientAssetName = selectedValue.value;
    //       break;
    //     case "clientDebt":
    //       this.revenueEntity.clientDebtId = selectedValue.id
    //       this.revenueEntity.clientDebtName = selectedValue.value;
    //       break;
    //     case "personal":
    //       this.revenueEntity.personalInsuranceId = selectedValue.id
    //       this.revenueEntity.personalInsuranceName = selectedValue.value;
    //       break;
    //     case "opportunity":
    //       this.revenueEntity.opportunityId = selectedValue.id
    //       this.revenueEntity.originalOpportunityName = selectedValue.value;
    //       break;
    //   }
    // })

    // revenue catogery
    let position = this.selectedRevenueCatetoryPosition;
    let length = this.revenueCatetorySource.length;
    if (length > position) {
      let category = this.revenueCatetorySource[position];
      this.revenueEntity.revenueCategoryId = category.id;
      this.revenueEntity.revenueCategory = category.value;
    }

    // revenue type
    if (this.entity.revenueType) {
      let type = this.revenueTypeSource.find(it => it.value === this.entity.revenueType);
      if (type) {
        this.revenueEntity.revenueTypeId = type.id;
        this.revenueEntity.revenueType = type.value;
      }
    }
  }

  /**
   * setup revenue catogery selection list
   *
   * @private
   * @memberof MatchDialog
   */
  private revenueCatogerySetup() {
    this.revenueCatetorySource = this.crmHanlder.getRevenueCategoryOptions();
    this.selectedRevenueCatetoryPosition = 0;

    let value = this.entity.revenueCategory;

    if (this.revenueCatetorySource) {
      value = value === "Insurance" ? "Life Insurance Commission" : value === "Lending" ? "Lending Commission" : value;
      let index = this.revenueCatetorySource.findIndex((item) => item.value === value);
      if (index !== -1) this.selectedRevenueCatetoryPosition = this.originalRevenueCatetoryPosition = index;
    }
  }

  /**
   *
   */

  private isValidId(id: string): boolean {
    // return false;
    if (!id)
      return false;
    return id !== "00000000-0000-0000-0000-000000000000";
  }

  private getDefaultRevenueEntity(): RevenueEntity {
    let revenueEntity = new RevenueEntity();

    revenueEntity.entityId = this.entity.entityId;
    revenueEntity.originalProductName = this.entity.productName;

    // product provider
    revenueEntity.productProviderName = this.entity.productProvider;
    revenueEntity.productProviderId = this.entity.productProviderId;

    // clients
    revenueEntity.originalClientName = this.entity.contactName;
    revenueEntity.clientId = this.entity.clientId;

    // Insurance
    revenueEntity.personalInsuranceName = this.entity.personalInsuranceName;
    revenueEntity.personalInsuranceId = this.entity.personalInsuranceId;

    // client asset
    revenueEntity.clientAssetName = this.entity.clientAssetName;
    revenueEntity.clientAssetId = this.entity.clientAssetId;

    // client debt
    revenueEntity.clientDebtName = this.entity.clientDebtName;
    revenueEntity.clientDebtId = this.entity.clientDebtId;

    // Opportunities
    revenueEntity.opportunityName = this.entity.opportunity;
    revenueEntity.opportunityId = this.entity.opportunityId;
    return revenueEntity;
  }
}
