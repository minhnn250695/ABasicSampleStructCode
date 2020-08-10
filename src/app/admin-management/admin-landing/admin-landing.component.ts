import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Observable } from 'rxjs/Observable';

// services
import { LoaderService } from '../../common/modules/loader';
import { AdminService } from '../admin.service';

// components
import { BaseEventComponent } from '../../common/components/base-component';
import { LoadingSpinnerService } from '../../common/components/loading-spinner/loading-spinner.service';
// models
import { Client, Pair, Result, UiEvent } from '../../common/models';
import { ConfigService } from '../../common/services/config-service';
import { Customer } from '../models';
import { AdminLandingState } from './AdminLandingState';

@Component({
  selector: 'app-admin-landing',
  templateUrl: './admin-landing.component.html',
  styleUrls: ['./admin-landing.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AdminLandingComponent extends BaseEventComponent implements OnInit, OnDestroy {
  private state: AdminLandingState = new AdminLandingState();
  private clientPairs: Pair[];
  private customerList: Customer[];

  constructor(private adminService: AdminService,
    private loadingService: LoadingSpinnerService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    super.onBaseInit();
    this.proceedEvent(LandingEvent.GET_RECENT_CUSTOMERS);
    this.proceedEvent(LandingEvent.GET_CUSTOMERS);
  }

  ngOnDestroy() {
    super.onBaseDestroy();
    this.loadingService.hide();
  }

  /* =====================================================================================================================
  * Private Part
  * ===================================================================================================================== */
  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();
    this.loadingService.show();

    switch (event.event) {
      case LandingEvent.GET_CUSTOMERS:
        return this.adminService.getAllCustomers();
      case LandingEvent.GET_RECENT_CUSTOMERS:
        return this.adminService.getRecentCustomers();
      case LandingEvent.CLIENT_SELECTED:
        return Observable.of(event.payload);
      default:
        return Observable.empty();
    }
  }

  handleEventResult(result: Result) {

    if (!result) return;

    let event = result.event;
    let data = result.payload;

    if (event === LandingEvent.GET_CUSTOMERS) {
      this.state.customerList = data;
    }
    else if (event === LandingEvent.GET_RECENT_CUSTOMERS) {
      this.loadingService.hide(); // need to be fixed later
      this.state.recentCustomers = data;
    }
    else if (event === LandingEvent.CLIENT_SELECTED) {
      this.addToRecent(data);
      this.adminService.adminRouter.gotoCustomerSummary(data);
    }
    this.detectChange();

  }

  handleError(result: any) {
    this.loadingService.hide();
  }


  private addToRecent(customer: Customer) {
    if (!customer) return;
    this.adminService.addCustomerToRecent(customer).subscribe(() => { });
  }


  /* =====================================================================================================================
   *  VIEW ACTION
   * ===================================================================================================================== */
  private onClientItemSelected(event: Pair) {
    this.proceedEvent(LandingEvent.CLIENT_SELECTED, this.state.getCustomerByPair(event));
  }

  private gotoCustomerSummary(customer: Customer) {
    this.proceedEvent(LandingEvent.CLIENT_SELECTED, customer);
  }

}


/**
 *
 */
enum LandingEvent {
  GET_CUSTOMERS,
  GET_RECENT_CUSTOMERS,
  CLIENT_SELECTED
}
