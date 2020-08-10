import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataFeedsBaseComponent } from '../../data-feeds-base-components.component';
import { DataFeedsStorage } from '../../data-feeds-storage.service';
import { DataFeedsService } from '../../data-feeds.service';
import { Entity, PlatFormData } from '../../models';

declare var $: any;

@Component({
    selector: 'app-netwealth-manual-match',
    templateUrl: './netwealth-manual-match.component.html',
    styleUrls: ['./netwealth-manual-match.component.css']
})
export class NetwealthManualMatchComponent extends DataFeedsBaseComponent implements OnInit {


    clientAssetMatchList: Array<Entity<PlatFormData>> = [];
    clientAssetUnMatchList: Array<Entity<PlatFormData>> = [];
    activeUnmatchedTab: boolean = false;
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
        // get data asset
        this.dataFeedsService.getAssets().subscribe(res => {
            this.runLoading.emit(false);
            if (res) {
                this.dataFeedsStorage.assets = res;
            }
        });
    }

    ngOnDestroy() {
        this.dataFeedsService.hideLoading()

        $('#confirm-import').modal("hide");
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        $('body').removeAttr("style");
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
        } else
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
            Provider: "Netwealth"
        };
        if (provider && provider.Provider != null) {
            Observable.zip(this.dataFeedsService.getClientAssetMatchedList(provider),
                this.dataFeedsService.getClientAssetUnMatchedList(provider))
                .subscribe(response => {
                    this.dataFeedsService.hideLoading()

                    this.dataFeedsService.isSelectedDateChanged = false;
                    this.clientAssetMatchList = response[0];
                    this.clientAssetUnMatchList = response[1];
                    if (response && response[0].length === 0 && response[1].length === 0) {
                        if (!this.isUploadAll) {
                            $("#confirm-import").modal('show');
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