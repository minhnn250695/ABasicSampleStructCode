import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const SELECTED_CUSTOMER = "finpal_selected_customer";

// models
import {
  Customer
} from './models';

@Injectable()
export class AdminRouterService {

  constructor(private router: Router) { }


  gotoCustomerList() {
    this.router.navigate(["/admin/customer-list"]);
  }

  gotoCustomerSummary(customer: Customer) {
    if (!customer) {
      return;
    }
    this.saveCustomerToLocal(customer);
    this.router.navigate(["/admin/customer-summary"]);
  }

  gotoCustomerLicence() {
    this.router.navigate(["/admin/customer-licence"]);
  }

  gotoAdminLanding() {
    this.router.navigate(["/admin/landing"]);
  }


  /**
   * local storage
   */
  saveCustomerToLocal(customer: Customer) {
    let str = customer ? JSON.stringify(customer) : null;
    localStorage.setItem(SELECTED_CUSTOMER, str);
  }

  getSeletedCustomer(): Customer {
    let str = localStorage.getItem(SELECTED_CUSTOMER);
    return str ? JSON.parse(str) : null;
  }
}
