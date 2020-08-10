import { Component, ViewChild, OnInit } from '@angular/core';
import { UserAccount, ThirdParty, RESTConnection, ThirdPartySettings } from '../../../models';
import { ThirdPartyService } from '../../../third-party.service';
import { LoaderService } from '../../../../common/modules/loader';
import { Router } from "@angular/router";


@Component({
    selector: 'app-investfit-settings',
    templateUrl: './investfit-settings.component.html',
    styleUrls: ['./investfit-settings.component.css']
})
export class InvestfitComponent implements OnInit {

    config: ThirdParty<ThirdPartySettings, RESTConnection>;

    constructor(private service: ThirdPartyService, private loaderService: LoaderService, private router: Router) {
        this.config = new ThirdParty<ThirdPartySettings, RESTConnection>();
    }

    ngOnInit() {
        this.loaderService.show();
        let provider = JSON.parse(sessionStorage.getItem("selectedProvider"));
        if (provider) {
            this.service.selectedProvider = provider;
            sessionStorage.removeItem("selectedProvider");
        }
        if (this.service.selectedProvider) {
            this.service.getThirdParty(this.service.selectedProvider.name).subscribe(res => {
                this.config = res as ThirdParty<ThirdPartySettings, RESTConnection>;
            },
                err => { },
                () => {
                    this.loaderService.hide();
                });
        }
        else
            this.router.navigate(["third-party/landing"]);
    }

    save() {
        this.config.settings.enabled = !this.config.settings.enabled;
        this.service.updateThirdParty(this.config).subscribe();
    }
}