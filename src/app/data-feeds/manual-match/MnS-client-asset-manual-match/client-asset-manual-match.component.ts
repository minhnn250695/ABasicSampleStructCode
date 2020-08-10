import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataFeedsBaseComponent } from '../../data-feeds-base-components.component';
import { DataFeedsStorage } from '../../data-feeds-storage.service';
import { DataFeedsService } from '../../data-feeds.service';
import { ClientAsset, Entity } from '../../models';

declare var $: any;
@Component({
  selector: 'app-client-asset-manual-match',
  templateUrl: './client-asset-manual-match.component.html',
  styleUrls: ['./client-asset-manual-match.component.css']
})
export class ClientAssetManualMatchComponent extends DataFeedsBaseComponent implements OnInit {

  isMobile: boolean;
  clientAssetMatchList: Array<Entity<ClientAsset>> = [];
  clientAssetUnMatchList: Array<Entity<ClientAsset>> = [];
  clientAssetIgnoreList: Array<Entity<ClientAsset>> = [];
  contentTabCSS: string = "in active";
  activeUnmatchedTab: boolean = false;

  private isUploadAll: boolean = false;

  constructor(
    private dataFeedsService: DataFeedsService,
    private dataFeedsStorage: DataFeedsStorage,
    private router: Router) {
    super();
  }

  ngOnInit() {
    this.checkUsingMobile();
    this.initialTabCss();
    this.initialData();
  }

  ngOnDestroy() {
    this.dataFeedsService.hideLoading()
    $('#confirm-import').modal("hide");
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
  }

  // reload data when update success
  reloadData(event: boolean) {
    if (event) {
      this.initialData();
    }
    else
      this.dataFeedsService.hideLoading()

  }

  openLoading(event: boolean) {
    if (event) {
      this.dataFeedsService.showLoading()
    }
  }

  gotoHomePage() {
    this.router.navigate(["/data-feeds/home-feeds"]);
  }

  checkUploadAll(event: boolean) {
    if (event)
      this.isUploadAll = true;
  }

  private initialTabCss() {
    if (sessionStorage.getItem("isUnmatched") === "true") {
      this.activeUnmatchedTab = true;
      // remove it from sessionStorage
      sessionStorage.removeItem("isUnmatched");
    }
    else this.activeUnmatchedTab = false;
  }

  /**
   * GET MATCHED, UNMATCHED, IGNORED LIST
   *
   */
  private initialData() {

    let provider = {
      Provider: "MoneySoft",
      EntityName: "ClientAsset"
    };

    Observable.zip(this.dataFeedsService.getClientAssetMatchedList(provider),
      this.dataFeedsService.getClientAssetUnMatchedList(provider),
      this.dataFeedsService.getClientAssetIgnoredList()
    ).subscribe(response => {
      this.dataFeedsService.hideLoading()
      if (response && response[0] === undefined && response[1] === undefined && response[2].length === 0) {
        if (!this.isUploadAll) {
          $("#confirm-import").modal('show');
        }
        else
          this.uploadCompletedDialog.showUCDialog();
        return;
      }

      this.clientAssetMatchList = response[0];
      this.clientAssetUnMatchList = response[1];
      this.clientAssetIgnoreList = response[2];

      this.dataFeedsStorage.storeClientAsset(this.clientAssetMatchList,
        this.clientAssetUnMatchList, this.clientAssetIgnoreList);
    });
  }
}
