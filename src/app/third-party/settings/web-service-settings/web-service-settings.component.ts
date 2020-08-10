import { Component, OnInit } from '@angular/core';
import { ThirdPartyService } from '../../third-party.service';

import { ThirdPartyInfo } from '../../models';

@Component({
    selector: 'app-web-service-settings',
    templateUrl: './web-service-settings.component.html',
    styleUrls: ['./web-service-settings.component.css']
})
export class WebServiceSettingsComponent implements OnInit {
    private providerName: string;

    constructor(private service: ThirdPartyService) { }

    ngOnInit() {
        let provider = JSON.parse(sessionStorage.getItem("selectedProvider"));
        if (provider) {
            this.service.selectedProvider = provider;
            sessionStorage.removeItem("selectedProvider");
        }
        this.providerName = this.service.selectedProvider.name;
    }

}
