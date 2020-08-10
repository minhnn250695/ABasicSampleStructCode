import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit,
  QueryList, ViewChild, ViewChildren
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
// services
import { AdminService } from '../admin.service';

// components
import { BaseEventComponent } from '../../common/components/base-component';
import { LoadingSpinnerService } from '../../common/components/loading-spinner/loading-spinner.service';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';
// models
import { Result, UiEvent } from '../../common/models';
import { ConfigService } from '../../common/services/config-service';
import {
  CompanyMember, LicencePackageType, LicenceStatus,
  UpdatePermissionRequest} from '../models';
import { CustomerSummaryState } from './CustomerSummaryState';
declare var $: any;

@Component({
  selector: 'app-customer-summary',
  templateUrl: './customer-summary.component.html',
  styleUrls: ['./customer-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerSummaryComponent extends BaseEventComponent implements OnInit, OnDestroy {
  @ViewChildren('checkboxChild') checkboxChildren: QueryList<any>;
  @ViewChild('licenceStatus') licenceStatus: any;

  private state: CustomerSummaryState = new CustomerSummaryState();

  constructor(
    private adminService: AdminService,
    private loadingService: LoadingSpinnerService,
    private confirmationDialogService: ConfirmationDialogService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }
  ngOnInit() {
    // super.onBaseInit();
    let customer = this.adminService.adminRouter.getSeletedCustomer();
    if (!customer) {
      this.adminService.adminRouter.gotoAdminLanding();
      return;
    }
    this.state.selectedCustomer = customer;

    this.proceedEvent(CustomerSummaryEvent.INITIAL_DATA, customer);
  }

  ngOnDestroy() {
    this.loadingService.hide();
    super.onBaseDestroy();
  }

  /* =====================================================================================================================
   * EVENT Handling
   * ===================================================================================================================== */
  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();
    this.loadingService.show();

    if (event.event === CustomerSummaryEvent.INITIAL_DATA) {
      return this.adminService.getCustomerSummary(event.payload);
    }
    // change expirte state
    else if (event.event === CustomerSummaryEvent.CHANGE_EXPIRE_STATE) {
      return this.adminService.updateStatus(this.state.selectedCustomer.id, event.payload);
    }
    // assigned crm/portal license
    else if (event.event === CustomerSummaryEvent.UPDATE_USER_PERMISSION) {
      this.state.updatePermission(event.payload);
      return this.adminService.updateUserPermission(event.payload);
    }
    else if (event.event === CustomerSummaryEvent.EXTEND_TRIAL) {
      return this.adminService.extendTrial(this.state.selectedCustomer, event.payload);
    }
    return Observable.empty();
  }

  handleEventResult(result: Result) {
    if (!result) return;

    this.loadingService.hide();

    let payload = result.payload;

    if (result.event === CustomerSummaryEvent.INITIAL_DATA) {
      this.state.customerSummary = payload;
    }
    // change expirte state
    else if (result.event === CustomerSummaryEvent.CHANGE_EXPIRE_STATE) {
      // this.state.isActive = result.payload
      this.state.updateStatus(result.payload);
    }
    // crm license
    else if (result.event === CustomerSummaryEvent.UPDATE_USER_PERMISSION) {
      if (result.payload.code !== 200)
        this.confirmationDialogService.showModal({
          title: "Error #" + result.payload.code,
          message: result.payload.message,
          btnOkText: "OK"
        });

      this.state.updatePermission(result.payload.previousRequest);

    }
    else if (result.event === CustomerSummaryEvent.EXTEND_TRIAL) {
      this.proceedEvent(CustomerSummaryEvent.INITIAL_DATA, this.state.selectedCustomer);
    }

    this.licenceStatus.detectChange();
    this.detectChange();
  }

  handleError(result: any) {
    this.loadingService.hide();
    this.proceedEvent(CustomerSummaryEvent.INITIAL_DATA, this.state.selectedCustomer);
  }

  /* =====================================================================================================================
    *  VIEW ACTION
    * ===================================================================================================================== */
  private onPermissionChange(event, member: CompanyMember, key: string) {
    if (!member || key && key !== 'crm' && key !== 'portal') {
      return;
    }
    let isChecked = event && event.target && event.target.checked;
    let type = (key === 'crm') ? LicencePackageType.CRM : LicencePackageType.PORTAL;
    if (this.isAllowUpdatePermission(type, isChecked)) {
      let request = new UpdatePermissionRequest(member.id, member.userName, this.state.selectedCustomer.id, type, isChecked);
      this.proceedEvent(CustomerSummaryEvent.UPDATE_USER_PERMISSION, request);
    }
    else {
      event.target.checked = false;
    }
  }

  private changeLicence(enable: boolean) {
    this.proceedEvent(CustomerSummaryEvent.CHANGE_EXPIRE_STATE, enable);
  }

  private licenceDetails() {
    this.adminService.adminRouter.gotoCustomerLicence();
  }

  private extendTrial(num: number) {
    this.proceedEvent(CustomerSummaryEvent.EXTEND_TRIAL, num);
  }

  /* =====================================================================================================================
  * Private Part
  * ===================================================================================================================== */
  private getFullName(member: CompanyMember) {
    if (!member) return '';
    return `${member.firstName || ''} ${member.lastName || ''}`;
  }

  private isAllowUpdatePermission(type: number, isEnable: boolean = false) {
    if (!isEnable) return true;
    if (type === LicencePackageType.CRM) {
      return !this.state.isMaxCrmLicense();
    }
    if (type === LicencePackageType.PORTAL) {
      return !this.state.isMaxPortalLicense();
    }
  }

  private clearCheckBox() {
    this.checkboxChildren.forEach(e => {
      if (e.nativeElement) e.nativeElement.checked = false;
    });
  }
}


enum CustomerSummaryEvent {
  INITIAL_DATA,
  CHANGE_EXPIRE_STATE,
  UPDATE_USER_PERMISSION,
  EXTEND_TRIAL
}

