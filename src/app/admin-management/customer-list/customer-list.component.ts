import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// services
import { AdminService } from '../admin.service';

// components
import { BaseEventComponent } from '../../common/components/base-component';
import { PagingComponent } from '../../common/components/paging/paging.component';
import { LoadingSpinnerService } from '../../common/components/loading-spinner/loading-spinner.service';
// models
import { Pair, Result, UiEvent } from '../../common/models';
import { ConfigService } from '../../common/services/config-service';
import { Customer } from '../models';
import { CustomerState } from './CustomerState';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerListComponent extends BaseEventComponent implements OnInit, OnDestroy {
  @ViewChild("paging") paging: PagingComponent;

  private state: CustomerState = new CustomerState();

  //
  constructor(private adminService: AdminService,
    private loadingService: LoadingSpinnerService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    super.onBaseInit();
    this.proceedEvent(CustomerListEvent.GET_CUSTOMERS, this.state.getCurrentPage());
    this.proceedEvent(CustomerListEvent.GET_All_CUSTOMERS);
  }

  ngOnDestroy() {
    super.onBaseDestroy();
  }

  /* =====================================================================================================================
   * EVENT Handling
   * ===================================================================================================================== */
  /**
   *
   * @param event
   */
  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();

    this.loadingService.show();
    if (event.event === CustomerListEvent.GET_CUSTOMERS) {
      let page = event.payload || 0;
      this.state.customerRequest.index = page;

      return this.adminService.getCustomers(this.state.customerRequest);
    } else if (event.event === CustomerListEvent.CUSTOMER_SELECTED) {
      this.adminService.addCustomerToRecent(event.payload).subscribe(() => { });
      return Observable.of(event.payload);
    }
    else if (event.event === CustomerListEvent.GET_All_CUSTOMERS) {
      return this.adminService.getAllCustomers();
    }
    return Observable.empty();
  }

  /**
   *
   * @param result
   */
  handleEventResult(result: Result) {
    if (!result) return;

    this.loadingService.hide();
    if (result.event === CustomerListEvent.GET_CUSTOMERS) {
      this.state.updateData(result.payload);
      if (this.state.isShowPagination()) {
        this.paging.initPages(this.state.totalPage);
      }

    } else if (result.event === CustomerListEvent.CUSTOMER_SELECTED) {
      this.adminService.adminRouter.gotoCustomerSummary(result.payload);
    }
    else if (result.event === CustomerListEvent.GET_All_CUSTOMERS) {
      this.state.allCustomers = result.payload;
    }

    this.detectChange();
  }

  handleError(result: any) {
    this.loadingService.hide();
  }

  getStatusIcon(customer: Customer): string {
    if (!customer) { return ''; }
    if (customer.status === "Active") {
      return 'fas fa-check-circle fa-lg green-color';
    }
    else if (customer.status === "Trial") {
      return 'fas fa-clock fa-lg light-orange';
    }
    else if (customer.status === "Disabled") {
      return 'fas fa-lock fa-lg red';
    }
    return 'fas fa-question-circle fa-lg light-orange';
  }

  /* =====================================================================================================================
   *  VIEW ACTION
   * ===================================================================================================================== */
  private customerItemSelected(customer: Customer) {
    this.proceedEvent(CustomerListEvent.CUSTOMER_SELECTED, customer);
  }

  private previousPage() {
    this.proceedEvent(CustomerListEvent.GET_CUSTOMERS, this.state.previousPage());
  }

  private nextPage() {
    this.proceedEvent(CustomerListEvent.GET_CUSTOMERS, this.state.nextPage());
  }

  private gotoPage(page: number) {
    this.proceedEvent(CustomerListEvent.GET_CUSTOMERS, this.state.updatePage(page));
  }

  private getClientsFromPage(page) {
    this.proceedEvent(CustomerListEvent.GET_CUSTOMERS, this.state.updatePage(page - 1));
  }

  private sortBy(by: string) {
    if (this.state.customerRequest.sortBy && (this.state.customerRequest.sortBy === by)) {
      this.state.toggleOrder();
    } else {
      this.state.defaultOrder();
    }

    this.state.customerRequest.sortBy = by;
    this.proceedEvent(CustomerListEvent.GET_CUSTOMERS, 0);
  }

  private onFindClientValueChange(value: Pair) {
    let customer = this.state.getCustomerByPair(value);
    this.proceedEvent(CustomerListEvent.CUSTOMER_SELECTED, customer);
  }


  /* =====================================================================================================================
  * Private Part
  * ===================================================================================================================== */
  private getLicenseIcon(customer: Customer) {
    if (!customer) { return ''; }
    if (customer.license === "Custom") {
      return 'fas fa-circle fa-lg light-blue';
    }
    else if (customer.license === "Standard") {
      return 'fas fa-circle-o fa-lg dark-blue';
    }

    return '';
  }

}


enum CustomerListEvent {
  GET_CUSTOMERS,
  CUSTOMER_SELECTED,
  FIND_CUSTOMER,
  GET_All_CUSTOMERS
}