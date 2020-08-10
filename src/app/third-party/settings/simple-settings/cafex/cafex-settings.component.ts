import { Component, ViewChild, OnInit } from '@angular/core';
import { UserAccount, ThirdParty, RESTConnection, ThirdPartySimpleSettings } from '../../../models';
import { ThirdPartyService } from '../../../third-party.service';
import { LoaderService } from '../../../../common/modules/loader';
import { Router } from "@angular/router";


@Component({
    selector: 'app-cafex-settings',
    templateUrl: './cafex-settings.component.html',
    styleUrls: ['./cafex-settings.component.css']
})
export class CafeXComponent implements OnInit {

    config: ThirdParty<ThirdPartySimpleSettings, RESTConnection>;
    providerName: string;
    enabled: boolean;
    accountNumber: string;

    constructor(private service: ThirdPartyService, private loaderService: LoaderService, private router: Router) {
        // let provider = JSON.parse(sessionStorage.getItem("selectedProvider"));
        // if (provider) {
        //     this.service.selectedProvider = provider;
        //     sessionStorage.removeItem("selectedProvider");
        // }
        // this.providerName = this.service.selectedProvider.name;
        this.config = new ThirdParty<ThirdPartySimpleSettings, RESTConnection>();
    }

    ngOnInit() {
        // this.loaderService.show();
        let provider = JSON.parse(sessionStorage.getItem("selectedProvider"));
        if (provider) {
            this.service.selectedProvider = provider;
            sessionStorage.removeItem("selectedProvider");
        }
        if (this.service.selectedProvider) {
            this.service.getThirdParty(this.service.selectedProvider.name).subscribe(res => {
                this.config = res as ThirdParty<ThirdPartySimpleSettings, RESTConnection>;
                this.accountNumber = this.config.settings.configuration["AccountNumber"];
            });
        }
        else {
            this.router.navigate(["third-party/landing"]);
        }
    }

    save() {
        this.config.settings.configuration["AccountNumber"] = this.accountNumber;
        this.service.updateThirdParty(this.config).subscribe();
    }
}