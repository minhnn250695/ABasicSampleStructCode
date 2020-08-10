import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UploadCompletedDialog } from '../../../common/dialog/upload-completed-dialog/upload-completed-dialog.component';
import { ThirdParty } from '../../../third-party/models';
import { DataFeedsBaseComponent } from '../../data-feeds-base-components.component';
import { DataFeedsStorage } from '../../data-feeds-storage.service';
// import { LoadingDialog } from '../../../common/dialog/loading-dialog/loading-dialog.component';
import { DataFeedsService } from '../../data-feeds.service';
import { Entity, Insurance, Provider } from '../../models';

declare var $: any;

@Component({
    selector: 'app-personal-manual-match',
    templateUrl: './personal-manual-match.component.html',
    styleUrls: ['./personal-manual-match.component.css']
})
export class PersonalManualMatchComponent extends DataFeedsBaseComponent implements OnInit {
    insuranceMatchList: Array<Entity<Insurance>> = [];
    insuranceUnMatchList: Array<Entity<Insurance>> = [];
    activeUnmatchedTab: boolean = false;
    contentTabCSS: string = "in active";

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
    }

    reloadData(event: boolean) {
        if (event) {
            // update success
            this.initialData();
        }
        else
            // update unsuccess
            this.dataFeedsService.hideLoading()
    }

    showWaiting(value: boolean) {
        if (value)
            this.dataFeedsService.showLoading();
        else
            this.dataFeedsService.hideLoading();
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
     *  DATA
     *
     * @param provider
     */

    private initialData() {
        let provider = this.dataFeedsService.getSelectedProvider();
        if (provider && provider.Provider != null) {

            Observable.zip(this.dataFeedsService.getInsuranceMatchedList(provider),
                this.dataFeedsService.getInsuranceUnMatchedList(provider))
                .subscribe(response => {
                    this.dataFeedsService.hideLoading()

                    this.dataFeedsService.isSelectedDateChanged = false;
                    this.insuranceMatchList = response[0];
                    this.insuranceUnMatchList = response[1];

                    this.dataFeedsStorage.storeInsurance(this.insuranceMatchList, this.insuranceUnMatchList);

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