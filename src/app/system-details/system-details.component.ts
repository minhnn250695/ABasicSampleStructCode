import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { LoaderService } from '../common/modules/loader';
import { SystemDetailsService } from './system-details.service';
import { SystemDetails } from './models/system-details.model';
import { SystemComponent } from './models/system-component.model';
import { SuccessDialog } from '../common/dialog/success-dialog/success-dialog.component';
import { ConfigService } from '../common/services/config-service';
import { SecurityService } from '../security/security.service';
import { SetupService } from '../setup/setup.service';
import { ComponentType } from './models/component-type.model';

@Component({
    selector: 'app-system-details',
    templateUrl: './system-details.component.html',
    styleUrls: ['./system-details.component.css']
})
export class SystemDetailsComponent implements OnInit {

    systemDetails: SystemDetails;
    private updated: boolean;
    landingSetupUrl: SafeResourceUrl;
    private checkInterval: any;
    private checkUpdateProcess: any;

    constructor(private service: SystemDetailsService,
        private router: Router,
        private loaderService: LoaderService,
        private sanitizer: DomSanitizer,
        private configService: ConfigService,
        private securityService: SecurityService,
        private setupService: SetupService,
        private activatedRoute: ActivatedRoute) {

        this.systemDetails = new SystemDetails();
        this.landingSetupUrl = this.sanitizer.bypassSecurityTrustResourceUrl("");
    }

    ngOnInit() {
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.updated = params['updated'] == 'true';
        });

        this.service.getSystemDetails().subscribe(result => {
            this.systemDetails = result;
        });

    }

    getBackgroundColor(i: number): string[] {
        let classes = [];
        switch (i % 2) {
            case 0:
                classes.push("light-blue-background");
                break;
            case 1:
                classes.push("green-background");
                break;
            case 2:
                classes.push("light-orange-background");
                break;
        }
        return classes;
    }

    update(component: SystemComponent) {
        component.initUpdate();
        this.checkUpdateProcess = setTimeout(function (self: any, comp: SystemComponent) {
            if (!comp.updateStarted) {
                component.setFailedUpdate(true);
                self.landingSetupUrl = self.sanitizer.bypassSecurityTrustResourceUrl("");
            }
        }, 120000, this, component); // timeout to check after 2 minutes if update process has started correctly

        this.securityService.logout().subscribe(result => {
            this.landingSetupUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.configService.getAppUrl() + "#/setup?update=true&mode=1&componentType=" + component.type);
        });

    }

    updateDisabled(component: SystemComponent) {
        return !this.canBeUpdated(component) || component.updating;
    }

    canBeUpdated(component: SystemComponent): boolean {
        let result: boolean;
        if (component.type == ComponentType.CrmSolution)
            result = this.securityService.authenticatedUser() && this.securityService.authenticatedUser().crmPermission;
        else
            result = true;

        return result;
    }

    startUpdateProcess(componentType: number) {
        let self = this;
        this.securityService.checkAuthenticatedUser().then(result => {
            this.setupService.continueStep2(componentType).subscribe(result => {
                let processId = result.data;
                this.setupService.getStatusStep2(processId).subscribe(status => {
                    let component = self.systemDetails.components.find(c => c.type == componentType);
                    component.updateStarted = true;
                });
                this.checkInterval = setInterval(function () {
                    self.setupService.getStatusStep2(processId).subscribe(result => {
                        if (result.completed || result.failed) {
                            clearInterval(self.checkInterval);
                            let component = self.systemDetails.components.find(c => c.type == componentType);
                            if (result.completed) {
                                self.service.getSystemComponent(componentType).subscribe(result => {
                                    component.version = result.version;
                                    component.lastUpdate = result.lastUpdate;
                                    component.updated = true;
                                    component.updating = false;
                                });
                            }
                            else {
                                component.setFailedUpdate(false);
                                self.landingSetupUrl = self.sanitizer.bypassSecurityTrustResourceUrl("");
                            }
                        }
                    });
                }, 10000);
            });
        });
    }

    @HostListener('window:message', ['$event'])
    onMessage(event: any) {
        if (event.data.status == 'loginCompleted') {
            this.startUpdateProcess(event.data.componentType);
        }
    }
}
