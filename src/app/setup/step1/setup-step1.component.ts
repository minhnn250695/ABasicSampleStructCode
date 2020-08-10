import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { SetupService } from '../setup.service';
import { LoaderService } from '../../common/modules/loader';
import { ConfigService } from '../../common/services/config-service';
import { SecurityService } from '../../security/security.service';

import { SetupStep1, SetupMode } from '../models';

@Component({
    selector: 'app-setup-step1',
    templateUrl: './setup-step1.component.html',
    styleUrls: ['./setup-step1.component.css']
})
export class SetupStep1Component implements OnInit {

    step: SetupStep1;
    showConfirmMessage: boolean;
    showErrorMessage: boolean;
    showPrivilegesError: boolean;
    showCompanyNameExistError: boolean;
    showCRMConnectionError: boolean;
    isUpdate: boolean;
    componentType: number;
    mode: number;

    constructor(private router: Router,
        private service: SetupService,
        private loaderService: LoaderService,
        private configService: ConfigService,
        private securityService: SecurityService,
        private activatedRoute: ActivatedRoute) {

        this.step = new SetupStep1();
        this.isUpdate = false;
    }

    ngOnInit() {
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.isUpdate = params['update'] == 'true';
            this.componentType = params["componentType"];
            this.mode = params["mode"];
        });

        if (this.mode == SetupMode.Quick) {
            parent.postMessage({ "status": "loginCompleted", "componentType": this.componentType }, this.configService.getAppUrl());
        } else {
            this.securityService.checkAuthenticatedUser().then(result => {
                this.service.getSetupStep1().subscribe(result => {
                    this.step = result;
                    this.step.isUpdate = this.isUpdate;
                });
            });
        }
    }

    saveStep1() {
        this.clearErrors();
        this.service.saveSetupStep1(this.step).subscribe(result => {
            if (result.success) {
                let userAccount = this.securityService.authenticatedUser();
                userAccount.firstName = this.step.firstName;
                userAccount.lastName = this.step.lastName;
                this.securityService.saveAuthenticatedUser(userAccount);
                this.continue();
            } else {
                if (result.error.errorCode == 50) {
                    this.showConfirmMessage = true;
                } else if (result.error.errorCode == 51) {
                    this.showPrivilegesError = true;
                } else if (result.error.errorCode == 52) {
                    this.showCompanyNameExistError = true;
                } else if (result.error.errorCode == 53) {
                    this.showCRMConnectionError = true;
                }
            }
        });
    }

    clearErrors() {
        this.showPrivilegesError = false;
        this.showCompanyNameExistError = false;
        this.showCRMConnectionError = false;
    }

    hideError() {
        this.showCRMConnectionError = false;
    }

    continue() {
        var params = {};
        if (this.isUpdate)
            params["update"] = this.isUpdate;
        if (this.componentType)
            params["componentType"] = this.componentType;

        this.router.navigate(["/setup/step2"], { queryParams: params });
    }

    cancel() {
        this.router.navigate(["/setup/cancel"]);
    }
}
