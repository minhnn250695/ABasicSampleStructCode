import { BaseComponentComponent } from "../../../common/components/base-component";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { ExternalSoftwareService } from "./../external-software.service";
import { DataImportFromFile, UnmappedFields } from '../models';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Observable } from 'rxjs';
import { ThirdPartyService } from '../../../third-party/third-party.service';
import { ThirdParty, ThirdPartyDataFeedSettings, RESTConnection } from '../../../third-party/models';
import { ISubscription } from 'rxjs/Subscription';

declare var $: any;
@Component({
    selector: "app-external-sfotware-landing",
    templateUrl: "./external-software-landing.component.html",
    styleUrls: ["./external-software-landing.component.css"]
})
export class ExternalSoftwareLandingComponent extends BaseComponentComponent implements OnInit, OnDestroy {
    config: ThirdParty<ThirdPartyDataFeedSettings, RESTConnection>;

    isIress: boolean = false;
    isMissingField: boolean = false;
    xplan_username: string;
    xplan_password: string;
    xplan_url: string;
    private iSub: ISubscription;
    constructor(private router: Router,
        private externalSoftwareService: ExternalSoftwareService,
        private confirmationDialogService: ConfirmationDialogService,
        private thirdPartyService: ThirdPartyService) {
        super();
        this.config = new ThirdParty<ThirdPartyDataFeedSettings, RESTConnection>();
    }

    ngOnInit() {
        super.initTooltip();
        this.thirdPartyService.getThirdParty('XPlan').subscribe(res => {
            this.config = res as ThirdParty<ThirdPartyDataFeedSettings, RESTConnection>;
            this.xplan_username = this.config.connection.username;
            this.xplan_password = this.config.connection.password;
            this.xplan_url = this.config.connection.url;
            if (this.xplan_username.length == 0 || this.xplan_password.length == 0 || this.xplan_url.length == 0) {
                this.isMissingField = true;
            }
        });


    }

    ngOnDestroy() {
    }

    onIressClick() {
        if (!this.isMissingField) {
            let observables: Observable<any>[] = [];

            observables.push(this.externalSoftwareService.xPlanDataImportExecutions(this.config.connection.username, this.config.connection.password, this.config.connection.url));
            this.iSub = Observable.zip.apply(null, observables).subscribe(responses => {
                if (this.iSub) {
                    this.iSub.unsubscribe();
                  }
                let subcription: ISubscription = this.confirmationDialogService.showModal({
                    title: "Success",
                    message: "Successfully executed",
                    btnOkText: "OK"
                }).subscribe(() => subcription.unsubscribe());
            }, error => {
                // this.loading.emit(false);
                let subcription: ISubscription = this.confirmationDialogService.showModal({
                    title: "Error",
                    message: error.message,
                    btnOkText: "OK"
                }).subscribe(() => subcription.unsubscribe());
                // });
            });
        }
    }

    onSaveClick() {
        // this.loading.emit(true);
        let observables: Observable<any>[] = [];

        this.config.connection.username = this.xplan_username;
        this.config.connection.password = this.xplan_password;
        this.config.connection.url = this.xplan_url;

        observables.push(this.thirdPartyService.updateThirdParty(this.config));
        observables.push(this.externalSoftwareService.xPlanDataImportExecutions(this.config.connection.username, this.config.connection.password, this.config.connection.url));
        this.iSub = Observable.zip.apply(null, observables).subscribe(responses => {
            if (this.iSub) {
                this.iSub.unsubscribe();
              }
            let subcription: ISubscription = this.confirmationDialogService.showModal({
                title: "Success",
                message: "Successfully executed",
                btnOkText: "OK"
            }).subscribe(() => subcription.unsubscribe());
        }, error => {
            // this.loading.emit(false);
            let subcription: ISubscription = this.confirmationDialogService.showModal({
                title: "Error",
                message: error.message,
                btnOkText: "OK"
            }).subscribe(() => subcription.unsubscribe());
            // });
        });
    }
}

