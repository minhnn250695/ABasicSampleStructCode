import { Pair } from '../../common/models';
import { Customer, CustomerRequest, GetCustomerData } from '../models';
export class CustomerState {
  customerList: Customer[];
  activecustomerList: Customer[];
  disabledCustomerList: Customer[];
  trialCustomerList: Customer[];
  findCustomerList: Customer[];
  allCustomers: Customer[];
  totalPage: number = 0;
  customerRequest: CustomerRequest = new CustomerRequest();
  private currentPage: number = 0;
  private readonly limit = 10;
  private isPaginated: boolean = false;
  constructor() {
    this.customerRequest.limit = this.limit;
    this.customerRequest.index = this.currentPage;
    this.customerRequest.orderBy = "ASC";
    this.customerRequest.sortBy = "name";
  }
  getOrderIcon(sortBy: string): string {
    if (this.customerRequest.sortBy !== sortBy) {
      return 'fa fa-sort';
    }
    if (this.customerRequest.orderBy === "ASC") {
      return 'fa fa-sort-up';
    }
    return 'fa fa-sort-desc';
  }
  toggleOrder() {
    let newOrder = this.customerRequest.orderBy === "ASC" ? "DESC" : "ASC";
    this.customerRequest.orderBy = newOrder;
  }
  defaultOrder() {
    this.customerRequest.orderBy = "ASC";
  }
  getFoundCustomerPairs(): Pair[] {
    return this.findCustomerList && this.findCustomerList.map(item => new Pair(item.id, item.name)) || [];
  }
  getCustomerPairs(): Pair[] {
    return this.allCustomers && this.allCustomers.map(item => new Pair(item.id, item.name)) || [];
  }
  getCustomerByPair(pair: Pair): Customer {
    return this.allCustomers && this.allCustomers.find(item => item.id === pair.id);
  }
  getOffset(page: number): number {
    return this.limit * (page || 0);
  }
  getCurrentPage() {
    return this.currentPage || 0;
  }
  getPageList(): number[] {
    let length = this.totalPage;
    return Array.apply(null, { length }).map(Number.call, Number);
  }
  /**
   *
   */
  updateData(data: GetCustomerData) {
    this.customerList = data && data.customers;
    if (this.customerList) {
      this.activecustomerList = this.customerList.filter(customer => customer.status === "Active");
      this.disabledCustomerList = this.customerList.filter(customer => customer.status === "Disabled");
      this.trialCustomerList = this.customerList.filter(customer => customer.status === "Trial");
    }
    this.totalPage = data.pages;
    this.isPaginated = data.paginated;
    this.currentPage = data.index;
  }
  isShowPagination(): boolean {
    return (this.totalPage || 0) >= 2; // this.isPaginated;
  }
  updatePage(page: number): number {
    return this.currentPage = page >= 0 ? page : 0;
  }
  nextPage(): number {
    return this.updatePage(this.currentPage + 1);
  }
  previousPage(): number {
    return this.updatePage(this.currentPage - 1);
  }
  isFirstPage(): boolean {
    return this.currentPage === 0;
  }
  isLastPage(): boolean {
    return this.totalPage - 1 === this.currentPage;
  }
}
