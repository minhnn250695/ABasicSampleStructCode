import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderService } from '../../common/components/header/header.service';
import { ConfigService } from '../../common/services/config-service';
import { SecurityService } from './../../security/security.service';

declare var $: any;
@Component({
    selector: 'admin-header',
    templateUrl: './admin-header.component.html',
    styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent implements OnInit, OnDestroy {
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

    //#region Contructors
    constructor(private router: Router,
        private security: SecurityService,
        private configService: ConfigService,
        private sanitizer: DomSanitizer,
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
    }

    ngOnInit() {
        this.checkUsingMobile();
        this.getUserInfo();
        this.getCompanyLogo();
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
     * @param update - true if **doesn't have** or **update** company logo path
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

    //#region Navigations
    home(): void {
        this.router.navigate(["/admin"]);
    }

    customterList(): void {
        this.router.navigate(["/admin/customer-list"]);
    }

    report(): void {
        // this.router.navigate(["/admin/staff-report"]);
    }

    admin(): void {
        this.router.navigate(["/admin/admin-info"]);
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

    //#region Helpers
    getProfileImage() {
        let imgUrl = localStorage.getItem('profileImage');
        if (!imgUrl || imgUrl === "undefined" || imgUrl.includes("default-profile"))
            return "../../../../assets/img/default-profile.png";

        return this.configService.getApiUrl() + imgUrl;
    }

    getUserInfo() {
        this.security.checkAuthenticatedUser().then(authenticatedUser => {
            if (authenticatedUser != null) {
                this.userFirstName = authenticatedUser.firstName;
            }
        });
    }

    private getProfileImageUrl() {
        let imgUrl = localStorage.getItem('profileImage');
        if (!imgUrl || imgUrl === "undefined")
            this.profileImgUrl = "../../../../assets/img/default-profile.png";
        else
            this.profileImgUrl = this.configService.getApiUrl() + imgUrl;
    }

    private getCompanyLogoUrl() {
        let path = localStorage.getItem("companyLogoPath");
        if (!path || path === "undefined")
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
