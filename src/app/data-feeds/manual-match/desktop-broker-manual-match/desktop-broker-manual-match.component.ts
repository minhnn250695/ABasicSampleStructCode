import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { DataFeedsBaseComponent } from "../../data-feeds-base-components.component";
import { DataFeedsStorage } from "../../data-feeds-storage.service";
import { DataFeedsService } from "../../data-feeds.service";
import { Entity, PlatFormData } from "../../models";

declare var $: any;
@Component({
  selector: "app-desktop-broker-manual-match",
  templateUrl: "./desktop-broker-manual-match.component.html",
  styleUrls: ["./desktop-broker-manual-match.component.css"],
})
export class DesktopBrokerManualMatchComponent extends DataFeedsBaseComponent implements OnInit {

  //#region Properties
  activeUnmatchedTab: boolean = false;
  contentTabCSS: string = "in active";
  clientAssetMatchList: Array<Entity<PlatFormData>> = [];
  clientAssetUnMatchList: Array<Entity<PlatFormData>> = [];

  private isUploadAll: boolean = false;
  //#endregion

  //#region Constructors
  constructor(
    private dataFeedsStorage: DataFeedsStorage,
    private dataFeedsService: DataFeedsService,
    private router: Router) {
    super();
  }

  ngOnInit() {
    this.initialTabCss();
    this.initialData();
    this.runLoading.emit(true);
    // get data asset
    this.dataFeedsService.getAssets().subscribe((res) => {
      this.runLoading.emit(false);
      if (res) {
        this.dataFeedsStorage.assets = res;
      }
    });
  }

  ngOnDestroy() {
    // super.showLoading(false);
    this.dataFeedsService.hideLoading()
    $("#confirm-import").modal("hide");
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
  }
  //#endregion

  //#region Actions
  /**
   * Reload data when update success
   */
  reloadData(event: boolean) {
    if (event) {
      this.initialData();
    }
    else
      // this.loading.closeSpinner();
      this.dataFeedsService.hideLoading()

  }

  openLoading(event: boolean) {
    if (event) {
      // this.loading.openSpinner();
      this.dataFeedsService.showLoading()
    } else
      // this.loading.closeSpinner();
      this.dataFeedsService.hideLoading()
  }

  gotoHomePage() {
    this.router.navigate(["/data-feeds/home-feeds"]);
  }

  checkUploadAll(event: boolean) {
    if (event)
      this.isUploadAll = true;
  }
  //#endregion

  //#region Private
  private initialTabCss() {
    if (sessionStorage.getItem("isUnmatched") === "true") {
      this.activeUnmatchedTab = true;
      // remove it from sessionStorage
      sessionStorage.removeItem("isUnmatched");
    }
    else this.activeUnmatchedTab = false;
  }

  private initialData() {
    const provider = {
      EntityName: "ClientAsset",
      Provider: "DesktopBroker",
    };

    if (provider && provider.Provider != null) {
      Observable.zip(this.dataFeedsService.getClientAssetMatchedList(provider),
        this.dataFeedsService.getClientAssetUnMatchedList(provider))
        .subscribe((response) => {
          // this.loading.closeSpinner();
          // this.showLoading(false);
          this.dataFeedsService.hideLoading()

          this.dataFeedsService.isSelectedDateChanged = false;
          this.clientAssetMatchList = response[0];
          this.clientAssetUnMatchList = response[1];
          // case when all record is imported to crm
          if (response && response[0].length === 0 && response[1].length === 0) {
            if (!this.isUploadAll) {
              $("#confirm-import").modal("show");
            }
            else
              this.showUploadSuccess();
          }
        });
    }
    else {
      // this.loading.closeImmediate();
      this.dataFeedsService.hideLoading()
      this.gotoHomePage();
    }

  }
  //#endregion

}
