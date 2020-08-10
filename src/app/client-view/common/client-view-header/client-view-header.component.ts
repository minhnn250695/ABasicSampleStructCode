import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from '../../../common/components/header/header.service';

import { SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../../common/services/config-service';
import { SecurityService } from './../../../security/security.service';

@Component({
    selector: 'fp-client-view-header',
    templateUrl: './client-view-header.component.html',
    styleUrls: ['./client-view-header.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientViewHeaderComponent implements OnInit, OnDestroy {

    //#region Properties
    @Input() active: string = "1";
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
        this.bindDataToHeader();
    }

    ngOnDestroy() {
        this.updateCompanyLogoSub.unsubscribe();
        this.updateUserProfileImageSub.unsubscribe();
        this.updateHeaderSub.unsubscribe();
    }
    // #endregion

    //#region Actions
    getActive(id: string) {
        // if (this.active === id) {
        //     return id === '9' ? 'active advice-builder-tab' : 'active';
        // }
        // else
        //     return '';
        return this.active === id ? 'active' : '';
    }

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
    // #endregion

    //#region Check User Authen
    isClientAdminOrStaff() {
        return this.security.isClientAdminOrStaff();
    }

    isClientAdmin() {
        return this.security.isClientAdmin();
    }
    //#endregion

    //#region Navigations
    private home() {
        this.router.navigate(['/client-view/landing']);
    }

    private personal() {
        this.router.navigate(['/client-view/personal']);
    }

    private cashFlow() {
        this.router.navigate(['/client-view/cash-flow-detail']);
    }

    private assets() {
        this.router.navigate(['/client-view/asset']);
    }

    private debts() {
        this.router.navigate(['/client-view/debt']);
    }

    private perosonalProtection() {
        this.router.navigate(['/client-view/insurance']);
    }

    private documentStorage() {
        this.router.navigate(['/client-view/doc-storage']);
    }

    private contact() {
        this.router.navigate(['/client-view/contact']);
    }

    private advice() {
        this.router.navigate(['/client-view/advice-builder']);
    }

    // #endregion

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
