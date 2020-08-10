import { Component, OnInit } from '@angular/core';
import { ThirdPartyService } from '../../third-party.service';
import { Router } from '@angular/router';

import { FTPConnection, ThirdPartyDataFeedSettings, ThirdParty } from '../../models';

declare var $: any;
@Component({
    selector: 'app-sftp-settings',
    templateUrl: './sftp-settings.component.html',
    styleUrls: ['./sftp-settings.component.css']
})
export class SftpSettingsComponent implements OnInit {

    config: ThirdParty<ThirdPartyDataFeedSettings, FTPConnection>;
    isMobile: boolean;

    constructor(private _service: ThirdPartyService, private router: Router) {
        this.config = new ThirdParty<ThirdPartyDataFeedSettings, FTPConnection>();
    }

    ngOnInit() {
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
                if (res) {
                    this.config = res as ThirdParty<ThirdPartyDataFeedSettings, FTPConnection>;
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

    btnDownloadClick() {
        this.downloadPublicKey();
    }

    onSettingSelect(value: number) {
        if (value == 1)
            this.config.settings.enabled = !this.config.settings.enabled;
        if (value == 2) {
            // this.config.settings.importToCRM = !this.config.settings.importToCRM;
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

    private downloadPublicKey() {
        this._service.generateAndDownloadCertificate(this._service.selectedProvider.name);
    }
}
