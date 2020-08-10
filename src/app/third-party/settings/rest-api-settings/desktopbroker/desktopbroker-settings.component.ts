import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { RESTConnection, SOAPConnection, ThirdParty, ThirdPartyAdviser, ThirdPartyDataFeedSettings, ThirdPartyNetwealthDataFeedSettings } from '../../../models';
import { ThirdPartyService } from '../../../third-party.service';

@Component({
    selector: 'app-desktopbroker-settings',
    templateUrl: './desktopbroker-settings.component.html',
    styleUrls: ['./desktopbroker-settings.component.css'],
})
export class DesktopBrokerComponent implements OnInit {

    //#region Properties
    config: ThirdParty<ThirdPartyNetwealthDataFeedSettings, RESTConnection>;
    isMobile: boolean;
    duplicatedCode: boolean;
    newCode: string;
    addingCode: boolean;
    removingCode: boolean;
    subscription: ISubscription;
    //#endregion

    //#region Constructors
    constructor(private thirdPartyService: ThirdPartyService,
        private router: Router, private confirmationDialogService: ConfirmationDialogService) {
        this.config = new ThirdParty<ThirdPartyNetwealthDataFeedSettings, RESTConnection>();
        this.newCode = '';
    }

    ngOnInit() {

        let provider = JSON.parse(sessionStorage.getItem("selectedProvider"));
        if (provider) {
            this.thirdPartyService.selectedProvider = provider;
            sessionStorage.removeItem("selectedProvider");
        }

        if (this.thirdPartyService.selectedProvider) {
            this.getDesktopBrokerConfig();
        }
        else
            this.router.navigate(["third-party/landing"]);
    }
    //#endregion

    //#region Actions

    //#region Data handlers
    addAdviser(code: string) {
        this.duplicatedCode = false;
        this.addingCode = true;
        this.thirdPartyService.addAdviserToThirdParty(code, this.thirdPartyService.selectedProvider.name).subscribe(response => {
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

    getDesktopBrokerConfig() {
        this.subscription = this.thirdPartyService.getThirdParty(this.thirdPartyService.selectedProvider.name).subscribe(res => {
            this.config = res as ThirdParty<ThirdPartyNetwealthDataFeedSettings, RESTConnection>;
            this.subscription.unsubscribe();
        });
    }

    deleteAdivser(adviser: ThirdPartyAdviser) {
        this.thirdPartyService.removeAdviserFromThirdParty(adviser.code, this.thirdPartyService.selectedProvider.name)
            .subscribe((removeResponse) => {
                if (removeResponse.success) {
                    this.removingCode = false;
                    let index = this.config.settings.advisers.indexOf(adviser);
                    this.config.settings.advisers.splice(index, 1);
                }
            });
    }
    //#endregion

    //#region View handlers
    btnSaveClick() {
        this.thirdPartyService.updateThirdParty(this.config).subscribe(response => {
            if (response.success)
                this.router.navigate(["third-party/landing"]);
        });
    }

    btnRmvClick(adviser: ThirdPartyAdviser) {
        this.removingCode = true;
        this.subscription = this.confirmationDialogService.showModal({
            title: "Warning",
            message: "Do you want to delete this adviser code?",
            btnOkText: "Delete",
            btnCancelText: "Cancel",
        }).subscribe((response) => {
            if (response) {
                this.deleteAdivser(adviser);
            } else
                this.removingCode = false;
            this.subscription.unsubscribe();
        });
    }

    getStatusIcon(isActive: boolean): string {
        return isActive ? 'fa-check-circle green-color' : 'fa-times-circle medium-gray';
    }

    getStatus(isActive: boolean): string {
        return isActive ? 'Active' : 'Inactive';
    }

    selectedState() {
        this.config.settings.enabled = !this.config.settings.enabled;
    }

    selectedMode() {
        if (this.config.settings.mode === 0) {
            this.config.settings.importToCRM = false;
            this.config.settings.mode = 1;
        }
        else {
            this.config.settings.importToCRM = true;
            this.config.settings.mode = 0;
        }
    }
    //#endregion

    //#endregion

}