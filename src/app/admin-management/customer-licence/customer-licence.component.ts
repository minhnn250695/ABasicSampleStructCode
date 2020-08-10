import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs/Observable';

// services
import { AdminService } from '../admin.service';

// components
import { BaseEventComponent } from '../../common/components/base-component';
import { LoadingSpinnerService } from '../../common/components/loading-spinner/loading-spinner.service';
// models
import { Result, UiEvent } from '../../common/models';
import { ConfigService } from '../../common/services/config-service';
import {
  LicencePackage} from '../models';
import { CustomerLicenceState } from './CustomerLicenceState';


@Component({
  selector: 'app-customer-licence',
  templateUrl: './customer-licence.component.html',
  styleUrls: ['./customer-licence.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerLicenceComponent extends BaseEventComponent implements OnInit, OnDestroy {
  @ViewChild("warningDeletemodal") modal: any;
  private state: CustomerLicenceState = new CustomerLicenceState();
  private isShowWarning: boolean = false;
  private errorMsg: string;

  constructor(private adminService: AdminService,
    private loadingService: LoadingSpinnerService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }


  ngOnInit() {
    super.onBaseInit();
    let customer = this.adminService.adminRouter.getSeletedCustomer();
    if (!customer) {
      this.adminService.adminRouter.gotoAdminLanding();
      return;
    }
    this.state.selectedCustomer = customer;
    this.proceedEvent(CustomerLicenceEvent.GET_LICENCE_INFO, customer);
  }

  ngOnDestroy() {
    super.onBaseDestroy();
  }

  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();
    this.loadingService.show();

    if (event.event === CustomerLicenceEvent.GET_LICENCE_INFO) {
      return this.adminService.getCustomerSummary(event.payload);
    }
    // save to state
    else if (event.event === CustomerLicenceEvent.SAVE_PACKAGE_TO_STATE) {
      return Observable.of(event.payload);
    }
    // update licence to server
    else if (event.event === CustomerLicenceEvent.UPDATE_LICENCE_TO_SERVER) {
      this.state.isPackagesUpdated = false;
      return this.adminService.updateLicencePackages(this.state.selectedCustomer, this.state.getLicensePackages());
    } // change expirte state
    else if (event.event === CustomerLicenceEvent.CHANGE_EXPIRE_STATE) {
      return this.adminService.updateStatus(this.state.selectedCustomer.id, event.payload);
    }
    else if (event.event === CustomerLicenceEvent.EXTEND_TRIAL) {
      return this.adminService.extendTrial(this.state.selectedCustomer, event.payload);
    }

    return Observable.empty();
  }

  handleEventResult(result: Result) {
    if (!result) return Observable.empty();
    this.loadingService.show();

    if (result.event === CustomerLicenceEvent.GET_LICENCE_INFO) {
      this.state.customerSummary = result.payload;
    }
    // save to state
    else if (result.event === CustomerLicenceEvent.SAVE_PACKAGE_TO_STATE) {
      this.state.updatePackage(result.payload);
      this.state.isPackagesUpdated = true;
    }
    // update to server result
    else if (result.event === CustomerLicenceEvent.UPDATE_LICENCE_TO_SERVER) {
      this.state.updateLicencePackages(result.payload);
      this.state.isPackagesUpdated = false;
    } // change expirte state
    else if (result.event === CustomerLicenceEvent.CHANGE_EXPIRE_STATE) {
      this.state.updateStatus(result.payload);
    }
    else if (result.event === CustomerLicenceEvent.EXTEND_TRIAL) {
      this.proceedEvent(CustomerLicenceEvent.GET_LICENCE_INFO, this.state.selectedCustomer);
    }

    this.detectChange();
  }

  handleError(result: any) {
    this.loadingService.show();
    let err = result && result.data && result.data.message;
    this.showWarning(err);
    this.proceedEvent(CustomerLicenceEvent.GET_LICENCE_INFO, this.state.selectedCustomer);
  }

  /* =====================================================================================================================
   *  VIEW ACTION
   * ===================================================================================================================== */
  private licenceStatusChanged(enable: boolean) {
    this.proceedEvent(CustomerLicenceEvent.CHANGE_EXPIRE_STATE, enable);
  }

  private licenceChanged(updatedLicense: LicencePackage) {
    this.proceedEvent(CustomerLicenceEvent.SAVE_PACKAGE_TO_STATE, updatedLicense);
  }

  private extendTrial(num: number) {
    this.proceedEvent(CustomerLicenceEvent.EXTEND_TRIAL, num);
  }

  private savePackagesToServer() {
    this.proceedEvent(CustomerLicenceEvent.UPDATE_LICENCE_TO_SERVER);
  }

  private showWarning(error: string) {
    // this.modal.show();
    this.errorMsg = error;
    this.isShowWarning = (error && error.length >= 0);
    this.detectChange();
  }
}

enum CustomerLicenceEvent {
  GET_LICENCE_INFO,
  UPDATE_LICENCE_TO_SERVER,
  SAVE_PACKAGE_TO_STATE,
  CHANGE_EXPIRE_STATE,
  EXTEND_TRIAL
}