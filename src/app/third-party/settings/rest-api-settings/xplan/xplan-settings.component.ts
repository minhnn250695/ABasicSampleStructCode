import { Component, OnInit } from '@angular/core';
import { ThirdParty, ThirdPartyDataFeedSettings, RESTConnection } from '../../../models';
import { ThirdPartyService } from '../../../third-party.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-xplan-settings',
    templateUrl: './xplan-settings.component.html',
    styleUrls: ['./xplan-settings.component.css']
})
export class XplanComponent implements OnInit {

    config: ThirdParty<ThirdPartyDataFeedSettings, RESTConnection>;
    // isMobile: boolean;

    constructor(private _service: ThirdPartyService, private router: Router) {
        this.config = new ThirdParty<ThirdPartyDataFeedSettings, RESTConnection>();
    }

    ngOnInit() {

        let provider = JSON.parse(sessionStorage.getItem("selectedProvider"));
        if (provider) {
            this._service.selectedProvider = provider;
            sessionStorage.removeItem("selectedProvider");
        }
        if (this._service.selectedProvider) {
            this._service.getThirdParty(this._service.selectedProvider.name).subscribe(res => {
                this.config = res as ThirdParty<ThirdPartyDataFeedSettings, RESTConnection>;
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
        // if (value == 2) {
        //     if (this.config.settings.mode == 0) {
        //         this.config.settings.importToCRM = false;
        //         this.config.settings.mode = 1;
        //     }
        //     else {
        //         this.config.settings.importToCRM = true;
        //         this.config.settings.mode = 0;
        //     }
        // }
    }
}