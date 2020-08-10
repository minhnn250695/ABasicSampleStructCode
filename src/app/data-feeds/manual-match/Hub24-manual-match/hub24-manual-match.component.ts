import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { DataFeedsBaseComponent } from "../../data-feeds-base-components.component";
import { DataFeedsStorage } from "../../data-feeds-storage.service";
import { DataFeedsService } from "../../data-feeds.service";
import { Entity, PlatFormData } from "../../models";

declare var $: any;
@Component({
    selector: "app-hub24-manual-match",
    styleUrls: ["./hub24-manual-match.component.css"],
    templateUrl: "./hub24-manual-match.component.html",
})
export class Hub24ManualMatchComponent extends DataFeedsBaseComponent implements OnInit {
    activeUnmatchedTab: boolean = false;
    clientAssetMatchList: Array<Entity<PlatFormData>> = [];
    clientAssetUnMatchList: Array<Entity<PlatFormData>> = [];
    contentTabCSS: string = "in active";
    private isUploadAll: boolean = false;

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

    // reload data when update success
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

    private initialTabCss() {
        if (sessionStorage.getItem("isUnmatched") === "true") {
            this.activeUnmatchedTab = true;
            // remove it from sessionStorage
            sessionStorage.removeItem("isUnmatched");
        }
        else this.activeUnmatchedTab = false;
    }

    private initialData() {
        let provider = {
            EntityName: "ClientAsset",
            Provider: "Hub24",
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
            this.dataFeedsService.hideLoading()
            this.gotoHomePage();
        }

    }
}