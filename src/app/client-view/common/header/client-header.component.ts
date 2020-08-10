import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RoleAccess } from '../../../common/models';
import { ConfigService } from '../../../common/services/config-service';
import { SecurityService } from './../../../security/security.service';
import { CompanyInfo } from '../../client-contact/models/company-info.model';
import { ClientViewService } from '../../client-view.service';


declare var $: any;
@Component({
    selector: 'client-header',
    templateUrl: './client-header.component.html',
    styleUrls: ['./client-header.component.css']
})
export class ClientHeaderComponent implements OnInit {
    @ViewChild('drawer') drawer;

    companyInfo: CompanyInfo = new CompanyInfo();
    facebook: string;
    twitter: string;
    youtube: string;
    linkedin: string;
    userFirstName: string;
    logoUrl: SafeUrl;
    isMobile: boolean;
    showSideBar: boolean = false;
    searchText: string;
    selectedMenuItem: string = '';
    selectedSubMenuItem: any;
    menu: any;

    constructor(private router: Router,
        private security: SecurityService,
        private configService: ConfigService,
        private clientService: ClientViewService,
        private sanitizer: DomSanitizer) { }

    ngOnInit() {
        if (navigator.userAgent.includes("Mobile")) {
            this.isMobile = true;
            $('body').css('padding-top', '0');
        }
        else this.isMobile = false;

        $(document).on('click', '.navbar-collapse.in', (e) => {
            if ($(e.target).is('a')) {
                $(this).collapse('hide');
            }
        });

        this.userInfo();
        this.getCompanyInfo();
        this.getInitialMenuItem();
        if (this.isMobile)
            this.detectPage();

    }


    userInfo() {
        this.security.checkAuthenticatedUser().then(authenticatedUser => {
            if (authenticatedUser != null) {
                this.userFirstName = authenticatedUser.firstName;
                this.security.getLogoUrl().subscribe(res => {
                    if (res && res.url)
                        this.logoUrl = this.sanitizer.bypassSecurityTrustUrl(res.url);
                });
            }
        });
    }

    getProfileImage() {
        let imgUrl = localStorage.getItem('profileImage');
        if (!imgUrl || imgUrl === "undefined" || imgUrl.includes("default-profile"))
            return "../../../../assets/img/default-profile.png";

        return this.configService.getApiUrl() + imgUrl;
    }

    importStatus() {
        this.router.navigate(["/import-process-status"]);
    }

    getCompanyInfo() {
        this.clientService.getContactInfo().subscribe(
            res => {
                this.companyInfo = res;
                this.setURL(this.companyInfo);
            }
        )
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

    getInitialMenuItem() {
        let clientName = localStorage.getItem("clientName");
        this.menu = {
            account: [{ id: "logout", name: "Log out", link: "", isShow: true, icon: "fa-sign-out" }],
            home: [
                { id: "landing", name: "My Home", link: "/landing", isShow: true },
                { id: "clientLanding", name: clientName + "'s Home", link: "/client-view/landing", isShow: true }],
            sections: [
                { id: "personal", name: "Personal", pageTitle: "Personal Information", link: "/client-view/personal", isShow: true },
                { id: "cashflow", name: "Cash Flow", pageTitle: "Cash Flow", link: "/client-view/cash-flow-detail", isShow: true },
                {
                    id: "assets", name: "Assets", pageTitle: "Assets", link: "", isShow: true, isShowSubMenu: false,
                    subMenu: [{ id: "assetsOverview", name: "Assets Main", pageTitle: "Assets", link: "/client-view/asset/overview" }, { id: "assetsHistory", name: "Assets History", pageTitle: "Assets History", link: "/client-view/asset/history" }]
                },
                {
                    id: "debt", name: "Debt", pageTitle: "Debt", link: "", isShow: true, isShowSubMenu: false,
                    subMenu: [{ id: "debtOverview", name: "Debt Main", pageTitle: "Debt", link: "/client-view/debt/overview" }, { id: "debtHistory", name: "Debt History", pageTitle: "Debt History", link: "/client-view/debt/history" }]
                },
                { id: "insurance", name: "Insurance", pageTitle: "Insurance", link: "/client-view/insurance", isShow: true },
                { id: "document", name: "Documents", pageTitle: "Documents", link: "/client-view/doc-storage", isShow: true }
            ]
        }
    }

    private detectPage(url = undefined) {
        if (!url || url == '')
            url = this.router.url;
        let sectionFound = this.menu.sections.find(item => {
            if (item.subMenu) {
                let subMenuFound = item.subMenu.find(subItem => subItem.link === url);
                return subMenuFound;
            }
            else
                return item.link === url;
        });

        if (sectionFound)
            this.selectedSubMenuItem = sectionFound;
        else
            this.selectedSubMenuItem = undefined;
    }
    /***
     *
     * ROUTING SECTION
     */

    account() {
        let user = JSON.parse(localStorage.getItem('authenticatedUser'));
        if (user.roleAccess[0].name === RoleAccess.PORTAL_BUSINESS_CLIENT) {

            this.router.navigate(["/client-view/account"]);
        } else if (user.roleAccess[0].name === RoleAccess.PORTAL_BUSINESS_ADMIN || user.roleAccess[0].name === RoleAccess.PORTAL_BUSINESS_STAFF) {
            this.router.navigate(['/account-info']);
        }
    }

    clientList(): void {
        this.router.navigate(["/client-list"]);
    }

    logOut() {
        this.security.logout().subscribe(() => {
            this.router.navigate(["/login"]);
        });
    }

    customerManagement(): void {
        this.router.navigate(["/admin"]);
    }

    dataFeeds(): void {
        this.router.navigate(["/data-feeds"]);
    }

    revenueManagement(): void {
        this.router.navigate(["/revenue"]);
    }

    documentGenerator(): void {
        this.router.navigate(["/document/generate-report"]);
    }

    thirdPartyConnections(): void {
        this.router.navigate(["/third-party/landing"]);
    }

    portalAdminSetting(): void {
        this.router.navigate(["/portal-admin-setting"]);
    }

    private isClientAdminOrStaff() {
        return this.security.isClientAdminOrStaff();
    }

    private isClientAdmin() {
        return this.security.isClientAdmin();
    }

    private isBusinessClient() {
        return this.security.isClient();
    }

    private selectMenuItem(item: string) {
        if (this.selectedMenuItem == '') {
            this.selectedMenuItem = item;
            this.openSideBar()
        }
        else if (this.selectedMenuItem == item) {
            this.closeSideBar();
        }
        else {
            this.selectedMenuItem = item;
            this.openSideBar();
        }
    }

    private toggleSubMenu(navItem, navItemIndex) {
        let item = this.menu[this.selectedMenuItem][navItemIndex];
        if (!item.isShowSubMenu)
            item.isShowSubMenu = true;
        else
            item.isShowSubMenu = false;
    }

    private takeAnAction(navItem) {
        if (!navItem.link || navItem.link == "") {
            this.doAnAction(navItem);
        }
        else {
            this.detectPage(navItem.link);
            this.goToPage(navItem.link);
        }
        this.closeSideBar();
    }

    private doAnAction(navItem) {
        if (navItem.id == "logout") {
            this.logOut();
        }
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

    private goToPage(link) {
        this.router.navigate([link]);
        this.closeSideBar();
    }

    private openSideBar() {
        this.drawer.open();
        this.searchText = '';
        this.showSideBar = true;
        $('body').css('overflow-y', 'hidden');
    }

    private closeSideBar() {
        $('body').css('overflow-y', 'auto');
        this.drawer.close();
        this.menu = undefined;
        this.showSideBar = false;
        this.selectedMenuItem = '';
        this.searchText = '';
        this.getInitialMenuItem();
    }

    private validatePhoneNumber(phone) {
        return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone)
    }

    private clearSearchText() {
        if (this.searchText != '' && this.selectedMenuItem == 'sections') {
            this.menu.sections[2].isShowSubMenu = false;
            this.menu.sections[3].isShowSubMenu = false;
        }
        this.searchText = '';
    }

    private onChangeSearchText() {
        if (this.searchText && this.searchText != "") {
            this.menu.sections[2].isShowSubMenu = true;
            this.menu.sections[3].isShowSubMenu = true;
        }
        else {
            this.menu.sections[2].isShowSubMenu = false;
            this.menu.sections[3].isShowSubMenu = false;
        }
    }
}
