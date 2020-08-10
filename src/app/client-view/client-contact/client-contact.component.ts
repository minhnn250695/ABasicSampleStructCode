import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/Observer';
import { ISubscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
// Components
import { BaseEventComponent, BaseComponentComponent } from '../../common/components/base-component';

// services
import { ClientViewService } from '../client-view.service';
import { ConfigService } from '../../common/services/config-service';
import { FpStorageService } from '../../local-storage.service';
import { ClientContactService } from './client-contact.service';
import { ThirdPartyService } from '../../third-party/third-party.service';
import { LiveCustomerSupportService } from '../../common/components/live-customer-support/live-customer-support.service'
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';
// Entity
import { UiEvent, Result, BaseResponse } from '../models';
import { CompanyInfo } from './models/company-info.model';
import { ThirdParty, RESTConnection, ThirdPartySimpleSettings } from '../../third-party/models';

import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

declare var $: any;

@Component({
    selector: 'app-client-contact',
    templateUrl: './client-contact.component.html',
    styleUrls: ['./client-contact.component.css'],
})

export class ClientContactComponent extends BaseComponentComponent implements OnInit, OnDestroy {

    constructor(
        private clientViewService: ClientViewService,
        private fpStorageService: FpStorageService,
        private clientContactService: ClientContactService,
        private customerSuportService: LiveCustomerSupportService,
        private thirdPartyService: ThirdPartyService,
        private confirmationDialogService: ConfirmationDialogService,
        private router: Router,
        private sanitizer: DomSanitizer,
        configService: ConfigService) {
        super(configService)
    }
    public ClassicEditor = ClassicEditor;
    companyInfo: CompanyInfo = new CompanyInfo();
    facebook: string;
    twitter: string;
    youtube: string;
    linkedin: string;
    userId: string;
    name: string;
    contactEmail: string;
    policyNum: string;
    message: string = '';
    fullName: string;
    companyPhoneNumberURL: any;

    ngOnInit() {
        this.clientViewService.showLoading();
        this.userId = this.fpStorageService.getClientId();
        if (!this.userId) {
            this.router.navigate(['/landing']);
            return;
        }

        this.clientViewService.getContactInfo().subscribe(
            res => {
                this.companyInfo = res;
                this.setURL(this.companyInfo);
            }
        )
        var companyId = localStorage.getItem('companyId');
        this.thirdPartyService.getThirdParty('CafeX').subscribe(res => {
            this.clientViewService.hideLoading();
            let thirdParty = res as ThirdParty<ThirdPartySimpleSettings, RESTConnection>;
            if (thirdParty.settings.enabled) {
                let accountNumber = thirdParty.settings.configuration["AccountNumber"];
                if (accountNumber != '') {
                    this.customerSuportService.show(accountNumber);
                }
            }
        });
        this.fullName = this.getLoginUserFullName();
    }

    ngOnDestroy() {
        this.customerSuportService.hide();
    }

    private sanitize() {
        let url = "";
        if (this.companyInfo.phone && this.companyInfo.phone != '') {
            if (this.validatePhoneNumber(this.companyInfo.phone))
                url = "skype:" + this.companyInfo.phone + "?call";
            else
                url = "skype:" + this.companyInfo.phone + "?chat";
        }
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    private getLoginUserFullName() {
        let userInfo: any = JSON.parse(localStorage.getItem('authenticatedUser'));
        return userInfo.firstName + ' ' + userInfo.lastName;
    }


    setURL(info: CompanyInfo) {
        if (info && info.socialMedias.length > 0) {
            info.socialMedias.forEach(media => {
                switch (media.socialMediaType) {
                    case 1:
                        this.facebook = media.url;
                        break;
                    case 2:
                        this.twitter = media.url;
                        break;
                    case 3:
                        this.youtube = media.url;
                        break;
                    case 4:
                        this.linkedin = media.url;
                        break;
                }
            })
        }
    }

    btnSendClick() {
        if (this.name && this.message) {
            let request = {
                Subject: "",
                Name: this.name,
                PolicyNumber: this.policyNum,
                ContactEmail: this.contactEmail,
                Message: this.message,
                Sender: this.userId
            }

            this.clientViewService.showLoading();
            this.clientContactService.sendMessage(request).subscribe((res: BaseResponse<any>) => {
                this.clientViewService.hideLoading();

                if (res.success) {
                    this.clearView();
                }
                else {
                    /* BE doesn't handle error response */
                    let subcription: ISubscription = this.confirmationDialogService.showModal({
                        title: "Warning",
                        message: "Cannot send this message. Please try it again later.",
                        btnOkText: "OK"
                    }).subscribe(() => subcription.unsubscribe());
                }

            }, error => {
                /* BE doesn't handle error response */
                this.clientViewService.hideLoading();
                let subcription: ISubscription = this.confirmationDialogService.showModal({
                    title: "Warning",
                    message: "Cannot send this message. Please try it again later.",
                    btnOkText: "OK"
                }).subscribe(() => subcription.unsubscribe());
            })
        }
    }

    private validatePhoneNumber(phone) {
        return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone)
    }

    clearView() {
        this.name = undefined;
        this.contactEmail = undefined;
        this.policyNum = undefined;
        this.message = undefined;
    }
}
