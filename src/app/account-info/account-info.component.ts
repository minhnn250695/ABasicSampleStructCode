import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { Observable } from "rxjs/Observable";
// services
import { ClientViewService } from "../client-view/client-view.service";
import { SecurityService } from "../security/security.service";
import { AccountService } from "./account.service";

// components
import { BaseEventComponent } from "../common/components/base-component/base-event.component";
import { LoadingDialog } from "../common/dialog/loading-dialog/loading-dialog.component";

// models
import { Result, UiEvent } from "../common/models";
import { ConfigService } from "../common/services/config-service";

// utils
import { ValidateUtils } from "../common/utils";
import { AccountInfoState } from "./models";

declare var $: any;

@Component({
  selector: "app-account-info",
  templateUrl: "./account-info.component.html",
  styleUrls: ["./account-info.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountInfoComponent extends BaseEventComponent implements OnInit, OnDestroy {
  isChanged: boolean = false;
  isAdmin: boolean = false;

  userName: string;
  companyName: string;
  companyLogo: string;
  address1: string;
  address2: string;
  city: string;
  stateCity: string;
  postalCode: string;
  email: string;
  phone: number;
  crmUrl: string;

  facebook: string;
  twitter: string;
  youtube: string;
  linkedin: string;

  private state: AccountInfoState = new AccountInfoState();
  private validateUtils: ValidateUtils = new ValidateUtils();

  constructor(private security: SecurityService,
    private sanitizer: DomSanitizer,
    private accountService: AccountService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    super.onBaseInit();
    this.initital();
  }

  ngOnDestroy() {
    super.onBaseDestroy();
  }
  /* =====================================================================================================================
   *  VIEW ACTION
   * ===================================================================================================================== */

  /**
   * on select file changed listener
   *
   */
  onFileChanged(event: any) {
    let fileList: FileList = event.target.files;
    if (fileList.length === 1) {
      let file: File = fileList.item(0);
      this.updateCompanyLogo(file);
    }
  }

  updateProfileImg(file: File) {
    this.proceedEvent(AccountInfoEvent.UPDATE_PROFILE_PHOTO, file);
  }

  updateCompanyLogo(file: File) {
    this.proceedEvent(AccountInfoEvent.UPDATE_COMPANY_LOGO, file);
  }

  selectCompanyLogo(option: number) {
    if (option === 1)
      document.getElementById("uploadProFile").click();
    else
      document.getElementById("uploadCompanyLogo").click();
  }

  btnSaveClick() {
    if (this.checkMakeSomeChanges()) {
      let update = {
        id: localStorage.getItem("companyId"),
        addressLine1: this.address1,
        addressLine2: this.address2,
        city: this.city,
        stateOrProvince: this.stateCity,
        postalCode: this.postalCode,
        phone: this.phone,
        email: this.email,
        companyLogoPath: this.companyLogo,
        crmurl: this.crmUrl,
        socialMedias: [
          {
            socialMediaType: 1,
            url: this.facebook,
          },
          {
            socialMediaType: 2,
            url: this.twitter,
          },
          {
            socialMediaType: 4,
            url: this.youtube,
          },
          {
            socialMediaType: 3,
            url: this.linkedin,
          },
        ],
      };

      this.proceedEvent(AccountInfoEvent.UPDATE_COMPANY_INFO, update);
    }
  }

  /* =====================================================================================================================
   * EVENT Handling
   * ===================================================================================================================== */
  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();

    if (this.myLoadingSpinner)
      this.myLoadingSpinner.openSpinner();

    if (event.event === AccountInfoEvent.GET_USER_INFO) {
      return this.userInfo();
    } else if (event.event === AccountInfoEvent.GET_COMPANY_INFO) {
      return this.accountService.getCompaniesInfo();
    } else if (event.event === AccountInfoEvent.UPDATE_PROFILE_PHOTO) {
      return this.accountService.updateProfilePhoto(event.payload);
    } else if (event.event === AccountInfoEvent.UPDATE_COMPANY_LOGO) {
      return this.accountService.updateCompanyLogo(event.payload);
    } else if (event.event === AccountInfoEvent.UPDATE_COMPANY_INFO) {
      return this.accountService.updateCompanyInfo(event.payload);
    }

    return Observable.empty();
  }

  // GET RETURNED VALUES
  handleEventResult(result: Result) {
    this.myLoadingSpinner.closeSpinner();

    if (!result) return;
    let payload = result.payload;

    if (result.event === AccountInfoEvent.GET_USER_INFO) {
      this.userName = payload.firstName + " " + payload.lastName;
    }
    else if (result.event === AccountInfoEvent.GET_COMPANY_INFO) {
      this.bindCompanyInfo(payload);
    }
    else if (result.event === AccountInfoEvent.UPDATE_PROFILE_PHOTO) {
      this.profilePhotoUrl();
    }
    else if (result.event === AccountInfoEvent.UPDATE_COMPANY_LOGO) {
      this.companyLogo = payload.data.url;
      localStorage.setItem("companyLogoPath", payload.data.url);
    }
    else if (result.event === AccountInfoEvent.UPDATE_COMPANY_INFO) { }

    this.detectChange();
  }

  handleError(result: any) {

  }

  /* =====================================================================================================================
   * private part
   * ===================================================================================================================== */
  /**
   *
   */
  private bindCompanyInfo(payload: any) {
    this.address1 = payload.addressLine1;
    this.address2 = payload.addressLine2 ? payload.addressLine2 : "";
    this.city = payload.city;
    this.stateCity = payload.stateOrProvince;
    this.email = payload.email;
    this.phone = payload.phone;
    this.postalCode = payload.postalCode;
    this.companyLogo = payload.companyLogoPath;
    this.companyName = payload.name;
    this.crmUrl = payload.crmurl;

    if (payload.socialMedias.length > 0) {
      payload.socialMedias.forEach((media) => {
        switch (media.socialMediaType) {
          case 1:
            this.facebook = media.url;
            break;
          case 2:
            this.twitter = media.url;
            break;
          case 3:
            this.linkedin = media.url;
            break;
          case 4:
            this.youtube = media.url;
            break;
          default:
            break;
        }
      });
    }
  }

  private profilePhotoUrl() {
    this.state.profilePhotoUrl = localStorage.getItem("profileImage");
    return this.getImgUrl(this.state.profilePhotoUrl);
  }

  private userInfo(): Observable<any> {
    let getLogoUrl = (authenticatedUser) => {
      return this.security.getLogoUrl().map((res) => {
        return {
          loginEmail: authenticatedUser && authenticatedUser.userName,
          firstName: authenticatedUser && authenticatedUser.firstName,
          lastName: authenticatedUser && authenticatedUser.lastName,
          logoUrl: this.sanitizer.bypassSecurityTrustUrl(res.url),
        };
      });
    };

    return Observable.fromPromise(this.security.checkAuthenticatedUser())
      .flatMap((authenticatedUser) => {
        return getLogoUrl(authenticatedUser);
      });
  }

  private checkMakeSomeChanges(): boolean {
    if (!this.address1 && !this.address2 && !this.city && !this.state
      && !this.stateCity && !this.postalCode && !this.phone
      && !this.email && !this.companyLogo
      && !this.crmUrl && !this.facebook && !this.twitter && !this.youtube && !this.linkedin) {
      return false;
    } else {
      this.isChanged = true;
      return true;
    }
  }

  private initital() {

    // Get user and company info
    this.proceedEvent(AccountInfoEvent.GET_USER_INFO);
    this.proceedEvent(AccountInfoEvent.GET_COMPANY_INFO);

    let user = JSON.parse(localStorage.getItem("authenticatedUser"));
    this.isAdmin = user.isAdmin;
    this.detectChange();
  }
}

enum AccountInfoEvent {
  GET_USER_INFO,
  UPDATE_PROFILE_PHOTO,
  GET_COMPANY_INFO,
  UPDATE_COMPANY_INFO,
  UPDATE_COMPANY_LOGO,
}

