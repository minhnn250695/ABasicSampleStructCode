import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { ConfigService } from '../../common/services/config-service';
import { SecurityService } from '../../security/security.service';
import { SetupMode } from '../models';

@Component({
    selector: 'app-setup-landing',
    templateUrl: './setup-landing.component.html',
    styleUrls: ['./setup-landing.component.css']
})
export class SetupLandingComponent implements OnInit {

    constructor(private configService: ConfigService,
        private securityService: SecurityService,
        private activatedRoute: ActivatedRoute) {
    }

    ngOnInit() {        
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            let update = params['update'] == 'true';
            let componentType = params['componentType'];
            let mode = params['mode'];

            let returnUrl = this.getReturnUrl(update, mode, componentType);

            this.securityService.logout().subscribe(result => {
                window.location.href = this.configService.getApiUrl() + "adminlogin/signin-oidc?returnUrl=" +
                    encodeURIComponent(returnUrl) + "&baseUrl=" + encodeURIComponent(window.location.origin);
            });
        });

    }

    private getReturnUrl(update: boolean, mode: number, componentType: number): string {

        let returnUrl = window.location.origin + "/#/setup/step1";

        if (update) {
            returnUrl += "?update=true";
            if (mode)
                returnUrl += "&mode=" + mode;
            if (componentType)
                returnUrl += "&componentType=" + componentType;
        }

        return returnUrl;
    }
}
