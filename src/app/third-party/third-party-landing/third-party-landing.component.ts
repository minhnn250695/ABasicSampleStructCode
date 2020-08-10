import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ThirdPartyService } from '../third-party.service';
import { LoaderService } from '../../common/modules/loader';

import { ConfigType, ThirdPartyInfo } from '../models';

declare var $: any;

@Component({
    selector: 'app-third-party-landing',
    templateUrl: './third-party-landing.component.html',
    styleUrls: ['./third-party-landing.component.css']
})
export class ThirdPartyLandingComponent implements OnInit {
    private COLUMN_NUM = 5;
    private providers: ThirdPartyInfo[];
    private displayedProviders: ThirdPartyInfo[];
    private rowList: number[] = [];

    isMobile: boolean;

    constructor(private router: Router,
        private _service: ThirdPartyService,
        private loaderService: LoaderService) { }

    ngOnInit() {

        if (navigator.userAgent.includes("Mobile")) {
            this.isMobile = true;
            $('body').css('padding-top', '0');
        }
        else this.isMobile = false;

        this.loaderService.show();
        this._service.getThirdParties()
            .subscribe(result => {

                // Need to delete the following line after completed LifeRish third party
                result = result.filter(r => r.name != "LifeRisk")


                this.providers = result;
                this.displayedProviders = result;
                this.rowList = this.getProviderRows();
            },
                err => {
                    this.loaderService.hide();
                },
                () => {
                    this.loaderService.hide();
                });
    }

    goToPage(party: ThirdPartyInfo) {
        if (!party) return;
        this._service.selectedProvider = party;

        if (party.name == "MoneySoft")
            this.router.navigate(["third-party/rest-api-settings/moneysoft"]);

        if (party.name == "TAL")
            this.router.navigate(["third-party/sftp-settings"]);

        if (party.name == "Netwealth")
            this.router.navigate(["third-party/sftp-settings/netwealth"]);

        if (party.name == "Investfit")
            this.router.navigate(["third-party/rest-api-settings/investfit"]);

        if (party.name == "CafeX")
            this.router.navigate(["third-party/simple-api-settings/cafex"]);

        if (party.name == "DesktopBroker")
            this.router.navigate(["third-party/rest-api-settings/desktopbroker"]);

        if (party.name == "Class")
            this.router.navigate(["third-party/oauth-settings/class"]);

        if (party.name == "Macquarie")
            this.router.navigate(["third-party/soap-settings/macquariebank"]);

    }

    getPartyImg(party) {
        return "../../../assets/img/" + party.name.toLowerCase() + ".png";
    }

    /**
     * DATA
     */


    /**
     * VIEW ACTION
     */
    private onProviderImgClick(row: number, column: number) {
        let position = row * this.COLUMN_NUM + column;
        let provider = this.displayedProviders[position];
        if (!provider) return;
        this._service.selectedProvider = provider;
        // decide go to where depend on the config type
        switch (provider.connectionType) {
            case ConfigType.SFTP:
                if (provider.name == 'Netwealth')
                    this.router.navigate(["third-party/netwealth-settings"]);
                else
                    this.router.navigate(["third-party/sftp-settings"]);
                break;
            case ConfigType.WEB_SERVICE:
                this.router.navigate(["third-party/web-service-settings"]);
                break;
            case ConfigType.RESTFUL_API:
                if (provider.name == "MoneySoft") {
                    this.router.navigate(["third-party/rest-api-settings/moneysoft"]);
                } else if (provider.name == 'Investfit') {
                    this.router.navigate(["third-party/rest-api-settings/investfit"]);
                } else if (provider.name == 'XPlan') {
                    this.router.navigate(["third-party/rest-api-settings/xplan"]);
                } else if (provider.name == 'DesktopBroker') {
                    this.router.navigate(["third-party/rest-api-settings/desktopbroker"]);
                } else if (provider.name == 'Class') {
                    this.router.navigate(["third-party/oauth-settings/class"]);
                }
                break;
            case ConfigType.SIMPLE:
                if (provider.name == "Hub24") {
                    this.router.navigate(["third-party/soap-settings/hub24"]);
                }
                break;
            case ConfigType.NONE:
                if (provider.name == 'CafeX') {
                    this.router.navigate(["third-party/simple-settings/cafex"]);
                }
                break;
            case ConfigType.MACQUARIE:
                if (provider.name == 'Macquarie') {
                    this.router.navigate(["third-party/soap-settings/macquariebank"]);
                }
                break;
        }
    }

    private onProviderSearch(input: string) {
        if (!input) {
            this.displayedProviders = this.providers;
            return;
        }
        this.displayedProviders = this.providers.filter(p => p.name.toLowerCase().search(input.toLowerCase()) != -1);
    }

    /**
     * OTHERS
     */
    private getProviderRows() {
        if (!this.displayedProviders) { return [] }

        let value = this.displayedProviders.length;
        let rowNum = Math.ceil(value / 4);
        let result = Array.apply(null, { length: rowNum }).map(Number.call, Number);
        return result;
    }

    private getProviderAt(row: number, column: number): ThirdPartyInfo {
        let position = row * this.COLUMN_NUM + column;
        return this.displayedProviders[position];
    }
}
