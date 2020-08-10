import { Component, OnInit } from '@angular/core';
import { ThirdParty, ThirdPartyDataFeedSettings, SOAPConnection } from '../../../models';
import { ThirdPartyService } from '../../../third-party.service';
import { Router } from '@angular/router';
declare var $: any;
@Component({
    selector: 'app-hub24-settings',
    templateUrl: './hub24-settings.component.html',
    styleUrls: ['./hub24-settings.component.css']
})

export class Hub24Component implements OnInit {

    config: ThirdParty<ThirdPartyDataFeedSettings, SOAPConnection>;
    isMobile: boolean;
    username: string;
    password: string;
    adviserId: string;

    constructor(private _service: ThirdPartyService, private router: Router) {
        this.config = new ThirdParty<ThirdPartyDataFeedSettings, SOAPConnection>();
    }
    ngOnInit(): void {
        if (navigator.userAgent.includes("Mobile")) {
            this.isMobile = true;
            $('body').css('padding-top', '0');
        }
        else this.isMobile = false;

        let provider = JSON.parse(sessionStorage.getItem("selectedProvider"));
        if (provider) {
            this._service.selectedProvider = provider;
            sessionStorage.removeItem("selectedProvider");
        }
        if (this._service.selectedProvider) {
            this._service.getThirdParty(this._service.selectedProvider.name).subscribe(res => {
                this.config = res as ThirdParty<ThirdPartyDataFeedSettings, SOAPConnection>;
                if (this.config && this.config.connection) {
                    this.username = this.config.connection.username;
                    this.password = this.config.connection.password;
                    this.adviserId = this.config.connection.adviserId;
                }
            });
        }
        else
            this.router.navigate(["third-party/landing"]);
    }

    btnSaveClick() {
        this._service.updateThirdParty(this.config).subscribe(response => {
            this.router.navigate(["third-party/landing"]);
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
    }
}