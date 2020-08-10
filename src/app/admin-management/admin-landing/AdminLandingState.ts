import { Pair } from '../../common/models';
import { Customer } from '../models';
export class AdminLandingState {
  customerList: Customer[];
  recentCustomers: Customer[];
  getCustomerPairs(): Pair[] {
    return this.customerList && this.customerList.map(item => new Pair(item.id, item.name));
  }
  getCustomerByPair(pair: Pair): Customer {
    return this.customerList && this.customerList.find(item => item.id === pair.id);
  }
  getStatusIcon(customer: Customer): string {
    if (!customer) {
      return '';
    }
    if (customer.status === "Active") {
      return 'fas fa-check-circle fa-lg green-color';
    }
    else if (customer.status === "Trial") {
      return 'fas fa-clock fa-lg light-orange';
    }
    else if (customer.status === "Inactive") {
      return 'fas fa-lock fa-lg red';
    }
    return '';
  }
  getLicenseIcon(customer: Customer) {
    if (!customer) {
      return '';
    }
    if (customer.license === "Custom") {
      return 'fa fa-circle fa-lg light-blue';
    }
    else if (customer.license === "Standard") {
      return 'fa fa-circle-o fa-lg dark-blue';
    }
    return '';
  }
}
