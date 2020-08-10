
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';
import { BaseResponse, CustomerSummary} from '../admin-management/models';

@Injectable()
export class RevenueImportService {
    constructor(private httpClient: HttpClient) {

    }

    getCustomerSummary(companyId: string): Observable<CustomerSummary> {
        let apiUrl = `api/Customers/${companyId}/Summary`
        return this.httpClient.get<BaseResponse<CustomerSummary>>(apiUrl)
            .map(result => {
                return result && result.data && result.data.data;
            })
    }

    // update user's role is admin or not
    updatePortalRole(userId: string, isAdmin: boolean, companyId: string): Observable<any> {
        let apiUrl = `api/Customers/${companyId}/UpdatePortalRole`;
        return this.httpClient.put<any>(apiUrl, {
            UserId: userId,
            IsPortalAdmin: isAdmin
        })
    }
}