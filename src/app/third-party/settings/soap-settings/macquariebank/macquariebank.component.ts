import { Component, OnInit } from '@angular/core';
import { ThirdParty, ThirdPartyDataFeedSettings, SOAPConnection } from '../../../models';
import { ThirdPartyService } from '../../../third-party.service';
import { Router } from '@angular/router';
declare var $: any;

@Component({
    selector: 'app-macquariebank',
    templateUrl: './macquariebank.component.html',
    styleUrls: ['./macquariebank.component.css']
})
export class MacquariebankComponent implements OnInit {
    config: ThirdParty<ThirdPartyDataFeedSettings, SOAPConnection>;
    configOutput: ThirdParty<ThirdPartyDataFeedSettings, SOAPConnection>;

    isMobile: boolean;
    adviserId: string;
    connectionType: string = 'cash-account';

    constructor(private _service: ThirdPartyService, private router: Router) {
        this.config = new ThirdParty<ThirdPartyDataFeedSettings, SOAPConnection>();
        this.configOutput = new ThirdParty<ThirdPartyDataFeedSettings, SOAPConnection>();
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
        this.adviserId = localStorage.getItem("selected_client_id_in_client_view");
        if (this._service.selectedProvider) {
            this._service.getThirdPartyConfig(this._service.selectedProvider.name, this.adviserId).subscribe(res => {
                this.config = res as ThirdParty<ThirdPartyDataFeedSettings, SOAPConnection>;
                this.configOutput = JSON.parse(JSON.stringify(this.config));
            });
        }
        else
            this.router.navigate(["third-party/landing"]);
    }

    btnSaveClick() {
        let loginUser = JSON.parse(localStorage.getItem('authenticatedUser'));
        if (!this.configOutput.connection.adviserId || this.configOutput.connection.adviserId == '')
            this.configOutput.connection.adviserId = loginUser.id;
        this._service.updateThirdParty(this.configOutput).subscribe(response => {
            // this.router.navigate(["third-party/soap-settings/mac"]);
        });
    }

    onSettingSelect(value: number) {
        if (value == 1)
            this.configOutput.settings.enabled = !this.configOutput.settings.enabled;
        if (value == 2) {
            if (this.configOutput.settings.mode == 0) {
                this.configOutput.settings.importToCRM = false;
                this.configOutput.settings.mode = 1;
            }
            else {
                this.configOutput.settings.importToCRM = true;
                this.configOutput.settings.mode = 0;
            }
        }
        this.btnSaveClick();
    }

    onChangeConnectionType() {
        this.configOutput = new ThirdParty<ThirdPartyDataFeedSettings, SOAPConnection>();
        this.configOutput = JSON.parse(JSON.stringify(this.config));
    }

}
