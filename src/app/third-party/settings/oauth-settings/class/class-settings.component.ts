import { Component, ViewChild, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ThirdParty, RESTConnection, ThirdPartyDataFeedSettings } from '../../../models';
import { ThirdPartyService } from '../../../third-party.service';
import { ISubscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-class-settings',
    templateUrl: './class-settings.component.html',
    styleUrls: ['./class-settings.component.css']
})
export class ClassComponent implements OnInit {

    config: ThirdParty<ThirdPartyDataFeedSettings, RESTConnection>;
    enabled: boolean;
    accessGranted: boolean;
    source: SafeResourceUrl;
    authen: string;
    subscription: ISubscription;

    constructor(private router: Router, private activatedRoute: ActivatedRoute,
        private service: ThirdPartyService, private sanitizer: DomSanitizer) {
        this.config = new ThirdParty<ThirdPartyDataFeedSettings, RESTConnection>();
    }

    ngOnInit() {
        let provider = JSON.parse(sessionStorage.getItem("selectedProvider"));
        if (provider) {
            this.service.selectedProvider = provider;
            sessionStorage.removeItem("selectedProvider");
        }
        if (this.service.selectedProvider) {
            this.subscription = this.service.getThirdParty(this.service.selectedProvider.name).subscribe(res => {
                this.config = res as ThirdParty<ThirdPartyDataFeedSettings, RESTConnection>;
                this.subscription.unsubscribe();
            });
        }
        else {
            this.router.navigate(["third-party/oauth-settings/class"]);
        }

        this.activatedRoute.queryParams.subscribe(params => {
            if (params['authen'] == "true") {
                this.accessGranted = true;
            }
            if (params['authen'] == undefined || params['authen'] == "false") {
                const adviserId = JSON.parse(localStorage.getItem("authenticatedUser"));
                this.service.haveLoginAuthenticateToThirdParty(adviserId.id).subscribe(response => {
                    if (response.success) {
                        this.accessGranted = response.data.data.accessGranted;
                        if (!this.accessGranted)
                            this.source = this.sanitizer.bypassSecurityTrustResourceUrl(response.data.data.loginUrlResponse);
                    }
                });
            }
        });
    }

    btnSaveClick() {
        this.service.updateThirdParty(this.config).subscribe(response => {
        });
    }

    onSettingSelect(value: number) {
        if (value == 1)
            this.config.settings.enabled = !this.config.settings.enabled;
        if (value == 2) {
            if (this.config.settings.mode == 0) {
                this.config.settings.importToCRM = false;
                this.config.settings.mode = 1;
            }
            else {
                this.config.settings.importToCRM = true;
                this.config.settings.mode = 0;
            }
        }
        this.btnSaveClick();
    }
}