import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

// services
import { SecurityService } from '../../security/security.service';
import { AdminService } from '../admin.service';

// components
import { BaseEventComponent } from '../../common/components/base-component';
import { LoadingSpinnerService } from '../../common/components/loading-spinner/loading-spinner.service';

// models
import { Client, Pair, Result, UiEvent } from '../../common/models';
import { ConfigService } from '../../common/services/config-service';
import { ValidateUtils } from '../../common/utils';
import { AdminInfoState } from './AdminInfoState';
import { CropImageService } from '../../common/components/crop-image/crop-image.service';

declare var $: any;

@Component({
  selector: 'app-admin-info',
  templateUrl: './admin-info.component.html',
  styleUrls: ['./admin-info.component.css'],
  providers: [CropImageService]
})
export class AdminInfoComponent extends BaseEventComponent implements OnInit, OnDestroy {
  private state: AdminInfoState = new AdminInfoState();
  private validateUtils: ValidateUtils = new ValidateUtils();
  private errorMsg: string;
  private isShowWarning: boolean = false;

  constructor(private adminService: AdminService,
    private loadingService: LoadingSpinnerService,
    private securityService: SecurityService,
    private cropImageService: CropImageService,
    configService: ConfigService) {
    super(configService);
  }

  ngOnInit() {
    super.onBaseInit();
    let user = this.securityService.authenticatedUser();
    if (!user) {
      this.adminService.adminRouter.gotoAdminLanding();
      return;
    }
    this.state.user = user;
    this.proceedEvent(AdminInfoEvent.GET_COMPANY_INFO, user.companyId);
    this.init();
  }

  ngOnDestroy() {
    super.onBaseDestroy();
    this.loadingService.hide();
  }

  /* =====================================================================================================================
  * handle event
  * ===================================================================================================================== */
  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();
    let payload = event.payload;
    this.loadingService.show();

    switch (event.event) {
      case AdminInfoEvent.GET_COMPANY_INFO:
        return this.adminService.getCompaniesInfo(payload);
      case AdminInfoEvent.UPDATE_COMPANY_INFO:
        return this.adminService.updateCompanyInfo(payload);
      case AdminInfoEvent.UPLOAD_LOGO:
        return this.adminService.uploadCompanyLogo(this.state.companyInfo.id, payload);
      default:
        return Observable.empty();
    }
  }

  handleEventResult(result: Result) {
    if (!result) return;
    let event = result.event;
    let data = result.payload;
    this.loadingService.hide();
    switch (result.event) {
      case AdminInfoEvent.GET_COMPANY_INFO:
        this.state.companyInfo = data;
        break;
      case AdminInfoEvent.UPDATE_COMPANY_INFO:
        this.state.companyInfo = data;
        break;
      case AdminInfoEvent.UPLOAD_LOGO:
        this.updateCurrentLogo(data);

        break;
      default:
        break;
    }

    this.showWarning(null);
    this.detectChange();
  }

  handleError(result: any) {
    this.loadingService.hide();

    let err = result && result.data && result.data.message;
    this.showWarning(err);

    // reload if failed
    let user = this.state.user;
    this.proceedEvent(AdminInfoEvent.GET_COMPANY_INFO, user && user.companyId);
  }

  handleUploadImage(event) {
    const image = event.target.files;
    this.cropImageService.compress(image[0], null, 200).subscribe(response => {
      this.proceedEvent(AdminInfoEvent.UPLOAD_LOGO, response)
    })
  }

  updateCurrentLogo(newUrl) {
    if (newUrl && newUrl !== "") {
      let uploadLogo: any = document.getElementById("logoImage");
      let headerLogo: any = document.getElementById("admin-header-logo-img");

      uploadLogo.src = newUrl;
      headerLogo.src = newUrl;

      this.state.companyInfo.companyLogoPath = newUrl;
      localStorage.setItem('companyLogoPath', newUrl);
    }
  }


  /* =====================================================================================================================
 *  VIEW ACTION
 * ===================================================================================================================== */
  private savePhone() {
    let alias = $('.popover #txtAlias').val();
    let phone = $('.popover #txtPhone').val();
    this.state.updatePhone(alias, phone);
    this.proceedEvent(AdminInfoEvent.UPDATE_COMPANY_INFO, this.state.companyInfo);
  }

  private saveAddress() {
    let txtStreet = $('.popover #txtStreet').val();
    let city = $('.popover #selectCity').val();
    let stateOrProvince = $('.popover #selectState').val();
    let postCode = $('.popover #selectPostCode').val();

    this.state.updateAddress(txtStreet, city, stateOrProvince, postCode);
    this.proceedEvent(AdminInfoEvent.UPDATE_COMPANY_INFO, this.state.companyInfo);
  }

  private saveEmail() {
    let email = $('.popover #txtEmail').val();
    if (this.validateUtils.validateEmail(email)) {
      this.state.updateEmail(email);
      this.proceedEvent(AdminInfoEvent.UPDATE_COMPANY_INFO, this.state.companyInfo);
    } else {
      this.showWarning(`Email ${email} is incorrect format`);
    }
  }

  private showWarning(error: string) {
    // this.modal.show();
    this.errorMsg = error;
    this.isShowWarning = (error && error.length >= 0);
    this.detectChange();
  }

  /* =====================================================================================================================
  * Private Part
  * ===================================================================================================================== */
  private init() {

    // close popover when click outside
    $('html').on('click', (e) => {
      if (!$(e.target).parents().is('.popover.in') && !$(e.target).parents().is('a')) {
        $('[rel="popover"]').popover('hide');
      }
    });

    $('.close-email').click((e) => {
      $('#emailPopover').popover('hide');
    });

    $('.close-address').click((e) => {
      $('#addressPopover').popover('hide');
    });

    $('.close-phone').click((e) => {
      $('#phonePopover').popover('hide');
    });

    // saves
    $('.save-email').click((e) => {
      $('#emailPopover').popover('hide');
      this.saveEmail();
    });

    $('.save-address').click((e) => {
      $('#addressPopover').popover('hide');
      this.saveAddress();
    });

    $('.save-phone').click((e) => {
      $('#phonePopover').popover('hide');
      this.savePhone();
    });

  }
}

enum AdminInfoEvent {
  GET_COMPANY_INFO,
  UPDATE_COMPANY_INFO,
  UPLOAD_LOGO
}
