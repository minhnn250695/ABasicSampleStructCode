
import { Customer } from './customer.model';

export class GetCustomerData {
    customers: Customer[];
    limit: number;
    index: number;
    pages: number;
    paginated: boolean;
}