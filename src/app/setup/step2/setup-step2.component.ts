import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { SetupService } from '../setup.service';
import { LoaderService } from '../../common/modules/loader';
import { SecurityService } from '../../security/security.service';
import { ErrorDialog } from '../../common/dialog/error-dialog/error-dialog.component';

import { SetupStep2, SetupMode } from '../models';

@Component({
    selector: 'app-setup-step2',
    templateUrl: './setup-step2.component.html',
    styleUrls: ['./setup-step2.component.css']
})
export class SetupStep2Component implements OnInit {

    step: SetupStep2;
    showErrorMessage: boolean;
    isUpdate: boolean;
    private componentType: number;
    private mode: SetupMode;
    private checkInterval: any;

    constructor(private router: Router,
        private service: SetupService,
        private securityService: SecurityService,
        private loaderService: LoaderService,
        private activatedRoute: ActivatedRoute) {
    }

    ngOnInit() {
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.isUpdate = params['update'] == 'true';
            this.componentType = params["componentType"];
            this.mode = params["mode"];
        });

        let self = this;
        this.securityService.checkAuthenticatedUser().then(result => {
            this.service.continueStep2(this.componentType).subscribe(result => {
                let processId = result.data;
                this.service.getStatusStep2(processId).subscribe(status => {
                    this.step = status;
                });
                this.checkInterval = setInterval(function () {
                    self.service.getStatusStep2(processId).subscribe(result => {
                        self.step = result;
                        if (result.completed || result.failed) {
                            clearInterval(self.checkInterval);
                            if (result.completed) {
                                if (self.mode == SetupMode.Quick)
                                    self.router.navigate(["/system-details"], { queryParams: { updated: true } });
                                else
                                    self.router.navigate(["/setup/step3"]);
                            }
                            else {
                                self.showErrorMessage = true;
                            }
                        }
                    });
                }, 10000);
            });
        });
    }

    retry() {
        if (this.isUpdate) {
            if (this.mode == SetupMode.Quick)
                this.router.navigate(["/setup"], { queryParams: { update: this.isUpdate, mode: this.mode, componentType: this.componentType } });
            else
                this.router.navigate(["/setup"], { queryParams: { update: this.isUpdate } });
        }
        else
            this.router.navigate(["/setup"]);
    }
}
