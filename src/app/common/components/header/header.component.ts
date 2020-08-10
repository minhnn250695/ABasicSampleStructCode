import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../../common/services/config-service';
import { LoaderService } from '../../modules/loader';
import { SecurityService } from './../../../security/security.service';
import { HeaderService } from './header.service';

@Component({
    selector: 'fp-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
    //#region Properties
    @Input("showAvatar") showAvatar: boolean = true;
    @Input("showNavigation") showNavigation: boolean = true;

    isMobile: boolean;
    userFirstName: string;
    profileImgUrl: string;
    logoUrl: SafeUrl = null;
    updateCompanyLogoSub: Subscription;
    updateUserProfileImageSub: Subscription;
    updateHeaderSub: Subscription;
    //#endregion

    //#region Constructor
    constructor(private router: Router,
        private security: SecurityService,
        private configService: ConfigService,
        private loaderService: LoaderService,
        private headerService: HeaderService) {
        this.updateCompanyLogoSub = this.headerService.updateCompanyLogoRequest.subscribe(update => {
            this.getCompanyLogo(update);
        });
        this.updateUserProfileImageSub = this.headerService.updateUserProfileImageRequest.subscribe(update => {
            this.getUserProfileImage(update);
        });
        this.updateHeaderSub = this.headerService.updateHeaderRequest.subscribe(update => {
            if (update)
                this.updateHeader();
        });
        this.headerService.showHeaderLoadingRequest.subscribe(request => {
            if (request)
                this.loaderService.show();
            else
                this.loaderService.hide();
        });
    }

    ngOnInit() {
        this.checkUsingMobile();
        this.bindDataToHeader();
    }

    ngOnDestroy() {
        this.updateCompanyLogoSub.unsubscribe();
        this.updateUserProfileImageSub.unsubscribe();
        this.updateHeaderSub.unsubscribe();
    }
    //#endregion

    //#region Actions
    bindDataToHeader() {
        this.security.checkAuthenticatedUser().then(authenticatedUser => {
            if (authenticatedUser != null) {
                this.userFirstName = authenticatedUser.firstName;
                this.getCompanyLogo();
                this.getUserProfileImage();
            }
        });
    }

    /**
     * @param update - true if update user info
     */
    getUserProfileImage(update: boolean = false) {
        if (update) {
            this.security.getUserInfo().subscribe(user => {
                this.security.storeUserToStorage(user);
                this.getProfileImageUrl();
            });
        } else
            this.getProfileImageUrl();
    }

    /**
     * @param update - true if update **doesn't have** or **update** company logo path
     */
    getCompanyLogo(update: boolean = false) {
        if (update) {
            this.security.getCompanyInfo().subscribe(res => {
                localStorage.setItem('companyLogoPath', res ? res.companyLogoPath : undefined);
                this.getCompanyLogoUrl();
            }, error => {
                console.log("Error");
                console.log(error);
            });
        } else
            this.getCompanyLogoUrl();
    }

    /** Update all header info (Company logo + logged user info). */
    updateHeader() {
        this.security.getUserInfo().subscribe(response => {
            this.security.storeUserToStorage(response);
            this.bindDataToHeader();
        });
    }

    logOut() {
        this.security.logout().subscribe(() => {
            this.router.navigate(["/login"]);
        }, error => {
            console.log("Error logout");
            console.log(error);
        });
    }
    //#endregion

    //#region Check User Authen
    isClientAdminOrStaff() {
        return this.security.isClientAdminOrStaff();
    }

    isClientAdmin() {
        return this.security.isClientAdmin();
    }
    //#endregion

    //#region Navigation
    getLogoUrl() {
        this.logoUrl = localStorage.getItem('companyLogoPath');
        return this.logoUrl;
    }

    customerManagement() {
        this.router.navigate(["/admin"]);
    }

    portalAdminSetting() {
        this.router.navigate(["/portal-admin-setting"]);
    }

    // account() {
    //     this.router.navigate(["/account-info"]);
    // }

    clientList() {
        this.router.navigate(["/client-list"]);
    }

    dataFeeds() {
        this.router.navigate(["/data-feeds"]);
    }

    revenueManagement() {
        this.router.navigate(["/revenue"]);
    }

    documentGenerator() {
        this.router.navigate(["/document/generate-report"]);
    }

    importStatus() {
        this.router.navigate(["/import-process-status"]);
    }

    thirdPartyConnections() {
        this.router.navigate(["/third-party/landing"]);
    }

    templateManager() {
        this.router.navigate(["/document/template-manager"]);
    }

    uploadTemp() {
        this.router.navigate(["/document/upload-template"]);
    }

    saveReports() {
        this.router.navigate(["/document/report-manager"]);
    }

    newTemp() {
        this.router.navigate(["/document/template-editor"]);
    }

    systemDetails(): void {
        this.router.navigate(["/system-details"]);
    }
    //#endregion

    //#region Helpers
    private getProfileImageUrl() {
        let imgUrl = localStorage.getItem('profileImage');
        if (!imgUrl || imgUrl === "undefined" || imgUrl.includes("default-profile"))
            this.profileImgUrl = "../../../../assets/img/default-profile.png";
        else
            this.profileImgUrl = this.configService.getApiUrl() + imgUrl;
    }

    private getCompanyLogoUrl() {
        let path = localStorage.getItem("companyLogoPath");
        let companyId = localStorage.getItem('companyId');
        if ((!path || path === "undefined") && companyId)
            this.getCompanyLogo(true);
        else
            this.logoUrl = path;
    }

    private checkUsingMobile() {
        if (navigator.userAgent.includes("Mobile"))
            this.isMobile = true;
        else
            this.isMobile = false;
    }
    //#endregion
}
