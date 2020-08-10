import { Component, ViewChild, OnInit } from '@angular/core';
import { UserAccount, ThirdParty, FTPConnection, ThirdPartyNetwealthDataFeedSettings, ThirdPartyAdviser } from '../../../models';
import { ThirdPartyService } from '../../../third-party.service';
import { LoaderService } from '../../../../common/modules/loader';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-netwealth-settings',
    templateUrl: './netwealth-settings.component.html',
    styleUrls: ['./netwealth-settings.component.css']
})
export class NetwealthComponent implements OnInit {

    config: ThirdParty<ThirdPartyNetwealthDataFeedSettings, FTPConnection>;
    duplicatedCode: boolean;
    newCode: string;
    addingCode: boolean;
    removingCode: boolean;
    removeAdviserSubscription: ISubscription;

    constructor(private service: ThirdPartyService,
        private loaderService: LoaderService,
        private router: Router,
        private confirmationDialogService: ConfirmationDialogService) {
        this.config = new ThirdParty<ThirdPartyNetwealthDataFeedSettings, FTPConnection>();
        this.newCode = '';
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
                this.config = res as ThirdParty<ThirdPartyNetwealthDataFeedSettings, FTPConnection>;
            },
                err => { },
                () => {
                    this.loaderService.hide();
                });
        }
        else
            this.router.navigate(["third-party/landing"]);
    }

    selectedState() {
        this.config.settings.enabled = !this.config.settings.enabled;
        this.update();
    }

    selectedMode() {
        if (this.config.settings.mode == 0) {
            this.config.settings.importToCRM = false;
            this.config.settings.mode = 1;
        }
        else {
            this.config.settings.importToCRM = true;
            this.config.settings.mode = 0;
        }
        this.update();
    }

    showActiveConnectionMessage() {
        return this.config.settings.enabled && this.config.connectionStatus;
    }

    showInactiveConnectionMessage() {
        return this.config.settings.enabled && !this.config.connectionStatus;
    }

    removeAdviser(adviser: ThirdPartyAdviser) {
        this.removingCode = true;
        if (this.removeAdviserSubscription)
            this.removeAdviserSubscription.unsubscribe();
        this.removeAdviserSubscription = this.confirmationDialogService.showModal({
            title: "Warning",
            message: "Do you want to delete this adviser code?",
            btnOkText: "Delete",
            btnCancelText: "Cancel"
        }).subscribe((response) => {
            if (response) {
                this.service.removeAdviserFromThirdParty(adviser.code, this.service.selectedProvider.name).subscribe(response => {
                    this.removingCode = false;
                    let index = this.config.settings.advisers.indexOf(adviser);
                    this.config.settings.advisers.splice(index, 1);
                });
            } else
                this.removingCode = false;
        });
    }

    addAdviser(code: string) {
        this.duplicatedCode = false;
        this.addingCode = true;
        this.service.addAdviserToThirdParty(code, this.service.selectedProvider.name).subscribe(response => {
            this.addingCode = false;
            if (response.success) {
                let adviser = new ThirdPartyAdviser();
                adviser.code = code;
                adviser.isActive = false;
                this.config.settings.advisers.push(adviser);
                this.newCode = "";
            } else {
                this.duplicatedCode = true;
            }
        });
    }

    getStatusIcon(isActive: boolean): string {

        return isActive ? 'fa-check-circle green-color' : 'fa-times-circle medium-gray';
    }

    getStatus(isActive: boolean): string {
        return isActive ? 'Active' : 'Inactive';
    }

    private update() {
        this.service.updateThirdParty(this.config).subscribe(response => {
            this.router.navigate(["third-party/landing"]);
        });
    }
}