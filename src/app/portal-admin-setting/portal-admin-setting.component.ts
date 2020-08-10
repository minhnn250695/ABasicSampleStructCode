import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponentComponent } from '../common/components/base-component';
import { AccountService } from '../account-info/account.service';
import { CompanyResource } from './models';
// import { CropImageComponent } from '../common/components/crop-image/crop-image.component';
import { RevenueImportService } from './portal-admin-setting.service';
import { CompanyMember } from '../admin-management/models';
import { ConfirmationDialogService } from '../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { HeaderService } from '../common/components/header/header.service';
import { CropImageService } from '../common/components/crop-image/crop-image.service';

declare var $: any;
@Component({
    selector: 'app-portal-admin-setting',
    templateUrl: './portal-admin-setting.component.html',
    styleUrls: ['./portal-admin-setting.component.css'],
    providers:[CropImageService]
})
export class PortalAdminSettingComponent extends BaseComponentComponent implements OnInit {
    facebook: string;
    twitter: string;
    youtube: string;
    linkedin: string;
    companyResource: CompanyResource = new CompanyResource();
    logoFileImage: File;
    companyId: string;
    userList: CompanyMember[];

    constructor(
        private accountService: AccountService,
        private revenueImportService: RevenueImportService,
        private confirmationDialogService: ConfirmationDialogService,
        private headerService: HeaderService,
        private cropImageService: CropImageService) {
        super();
    }

    ngOnInit() {
        super.onBaseInit();
        this.companyId = localStorage.getItem("companyId");

        // get user list
        this.revenueImportService.getCustomerSummary(this.companyId).subscribe(res => {
            if (res.users) {
                this.userList = res.users;
                this.detectChange();
            }
            this.showLoading(false);
        });

        this.getCompaniesInfo();

        this.setupPopover();
    }

    getCompaniesInfo() {
        this.accountService.getCompaniesInfo().subscribe((response: CompanyResource) => {
            this.setupMediaLinks(response);
            this.companyResource = response;
        });
    }

    /**
     * get css for crm client
     */
    getCRMLicense(user: CompanyMember) {
        return user.permissionCRM ? "green-color" : "red";
    }

    /**
     * get css for portal client
     */
    getPortalLicense(user: CompanyMember) {
        return user.permissionPortal ? "green-color" : "red";
    }

    /**
     * get css for portal admin
     */
    getPortalAdminValue(user: CompanyMember) {
        return user.isAdmin ? true : false;
    }

    /**
     * update portal admin value when user click change 
     * @param user 
     */
    updatePortalAdminValue(user: CompanyMember) {
        this.showLoading(true);
        let originAdminStatus = user.isAdmin;
        // sent user with id and opposite portal admin value
        this.revenueImportService.updatePortalRole(user.id, !originAdminStatus, this.companyId).subscribe(res => {
            this.showLoading(false);
            if (res.success) {
                this.userList.forEach(u => {
                    if (u.id == user.id)
                        u.isAdmin = !originAdminStatus;
                });
            } else if (!res.success && res.error) {
                let subcription = this.confirmationDialogService.showModal({
                    title: "Error #" + res.error.errorCode,
                    message: res.error.errorMessage,
                    btnOkText: "Close"
                }).subscribe(() => subcription.unsubscribe());
            }
        }, error => {
            this.showLoading(false);
            let subcription = this.confirmationDialogService.showModal({
                title: "Error",
                message: "Update Portal Admin failed.",
                btnOkText: "Close"
            }).subscribe(() => subcription.unsubscribe());
        })
    }

    updateCompanyInfo(company: CompanyResource) {
        this.accountService.updateCompanyInfo(company).subscribe(res => {
            this.showLoading(false);
            if (res.success) {
                this.companyResource = res.data.data;
                this.setupMediaLinks(res.data.data);
                this.detectChange();
            } else if (!res.success && res.error) {
                //show modal update wrong
                let subcription = this.confirmationDialogService.showModal({
                    title: "Error #" + res.error.errorCode,
                    message: res.error.errorMessage,
                    btnOkText: "Close"
                }).subscribe(() => subcription.unsubscribe());
            }
        });
    }

    updateCompanyLogo(img: File) {
        this.showLoading(true);
        this.accountService.updateCompanyLogo(img).subscribe(res => {
            this.showLoading(false);
            if (res.success) {
                this.updateCurrentLogo(res.data.url);
            }
        }, err => {
            this.showLoading(false);
            let subcription = this.confirmationDialogService.showModal({
                title: "Error",
                message: "Update company logo failed.",
                btnOkText: "Close"
            }).subscribe(() => subcription.unsubscribe());
        });
    }

    setupMediaLinks(company: CompanyResource) {
        // set up media links
        if (company.socialMedias && company.socialMedias.length > 0) {
            company.socialMedias.forEach(media => {
                if (media.socialMediaType == 1) {
                    this.facebook = media.url;
                } else if (media.socialMediaType == 2) {
                    this.twitter = media.url;
                } else if (media.socialMediaType == 3) {
                    this.youtube = media.url;
                } else if (media.socialMediaType == 4) {
                    this.linkedin = media.url;
                }
            });
        }
    }

    /**
     * Go to company page when click on CRM link.
     */
    onCrmUrlClick() {
        if (this.companyResource && this.companyResource.crmurl) {
            window.open(this.companyResource.crmurl, '_blank');
        }
    }

    handleUploadImage(event) {
        const image = event.target.files;
        this.cropImageService.compress(image[0], null, 200).subscribe(response => {
            this.updateCompanyLogo(response)
        })
    }

    initLogoImg(imgUrl?: string): any {
        if (imgUrl)
            return imgUrl;
    }

    updateCurrentLogo(newUrl) {
        let uploadLogo: any = document.getElementById("logoImage");
        let headerLogo: any = document.getElementById("header-logo-img");

        uploadLogo.src = newUrl;
        headerLogo.src = newUrl;

        this.companyResource.companyLogoPath = newUrl;
        this.headerService.updateCompanyLogoRequest.next(true);
    }

    private setupPopover() {
        // close popover when click outside
        $('html').on('click', function (e) {
            if (!$(e.target).parents().is('.popover.in') && !$(e.target).parents().is('a')) {
                $('[rel="popover"]').popover('hide');
            }
        });

        $('.save-change').click(() => {
            // update companies info
            this.showLoading(true);
            $('[rel="popover"]').popover('hide');
            let updateObj = this.updateValueFromInput();
            this.updateCompanyInfo(updateObj);
        });
    }

    /**update value that user typed to companyResource object */
    private updateValueFromInput() {
        let temp: CompanyResource = new CompanyResource();
        temp = { ...this.companyResource };

        if ($('.popover #registeredName').val())
            temp.registerName = $('.popover #registeredName').val();
        if ($('.popover #registerNumber').val())
            temp.registerNumber = $('.popover #registerNumber').val();
        if ($('.popover #clientNumber').val())
            temp.licenseNumber = $('.popover #clientNumber').val();
        if ($('.popover #address1').val())
            temp.addressLine1 = $('.popover #address1').val();
        if ($('.popover #address2').val())
            temp.addressLine2 = $('.popover #address2').val();
        if ($('.popover #city').val())
            temp.city = $('.popover #city').val();
        if ($('.popover #state').val())
            temp.stateOrProvince = $('.popover #state').val();
        if ($('.popover #postal-code').val())
            temp.postalCode = $('.popover #postal-code').val();
        if ($('.popover #email-address').val())
            temp.email = $('.popover #email-address').val();
        if ($('.popover #phone').val())
            temp.phone = $('.popover #phone').val();

        // set social medias from input to temp object
        temp.socialMedias = [
            {
                socialMediaType: 1,
                url: $('.popover #facebook').val() ? $('.popover #facebook').val() : this.facebook
            },
            {
                socialMediaType: 2,
                url: $('.popover #twitter').val() ? $('.popover #twitter').val() : this.twitter
            },
            {
                socialMediaType: 3,
                url: $('.popover #youtube').val() ? $('.popover #youtube').val() : this.youtube
            },
            {
                socialMediaType: 4,
                url: $('.popover #linkedin').val() ? $('.popover #linkedin').val() : this.linkedin
            }
        ]

        return temp;
    }


}
