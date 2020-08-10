import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, } from '@angular/common/http';
import { Http, ResponseContentType } from '@angular/http';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';
import { ConfigService } from '../common/services/config-service';

// models
import {
  Customer, CompanyInfo, CompanyMember, BaseResponse, Client, Pair,
  CustomerSummary, UpdatePermissionRequest, UpdateStatusData, LicencePackage,
  UpdateLicenceData, GetCustomerData, CustomerRequest
} from './models';

// services
import { AdminRouterService } from './admin-router.service';
import { ɵPRE_STYLE } from '@angular/animations';

@Injectable()
export class AdminService {
  private companyPattern: string;

  constructor(private httpClient: HttpClient,
    private http: Http,
    public adminRouter: AdminRouterService,
    private configService: ConfigService) {
    this.companyPattern = configService.getCompanyPattern();
  }

  /**
   * 
   */
  getCustomerList(): Observable<Customer[]> {
    let apiUrl = "api/Customers"
    return this.httpClient.get<BaseResponse<Customer[]>>(apiUrl)
      .map((result) => {
        let list = result && result.data && result.data.data;
        return list
      });
  }

  /**
   * Recent list
   */
  getRecentCustomers(): Observable<Customer[]> {
    let apiUrl = "api/RecentCustomers"
    let request = { index: 0, limit: 20 };
    return this.httpClient.post<BaseResponse<GetCustomerData>>(apiUrl, request)
      .map((result: BaseResponse<GetCustomerData>) => {
        let list = result && result.data && result.data.data;
        return list && list.customers;
      });
  }

  addCustomerToRecent(customer: Customer): Observable<any> {
    if (!customer) return Observable.empty();

    let apiUrl = "api/RecentCustomers/Update"
    let request = { id: customer.id, name: customer.name };
    return this.httpClient.post<any>(apiUrl, request)
  }


  getCustomerSummary(customer: Customer): Observable<CustomerSummary> {
    let apiUrl = `api/Customers/${customer.id}/Summary`
    return this.httpClient.get<BaseResponse<CustomerSummary>>(apiUrl)
      .map(result => {
        return result && result.data && result.data.data
      })
  }

  getCustomers(request: CustomerRequest): Observable<GetCustomerData> {
    let apiUrl = "api/Customers";
    return this.httpClient.post<BaseResponse<GetCustomerData>>(apiUrl, request)
      .flatMap(this.extraData);
  }

  /**
   * Get all customers
   */
  getAllCustomers(): Observable<Customer[]> {
    let apiUrl = "api/Customers"
    return this.httpClient.get<BaseResponse<Customer[]>>(apiUrl)
      .map((result) => {
        let list = result && result.data && result.data.data;
        list = list.map(element => {
        element.status == "Inactive" ? element.status = "Disabled" : element.status;
          return element;
        })        
        return list
      });
  }

  /**
   * 
   */
  updateUserPermission(request: UpdatePermissionRequest) {
    let apiUrl = `/api/CustomerLicenses/UpdatePermission`;
    return this.httpClient.post<BaseResponse<any>>(apiUrl, request)
      .flatMap((result: BaseResponse<any>) => {
        if (result && result.data) {

          if (result.data.code != 200)
            request.enabled = !request.enabled;

          let response = {
            code: result.data.code,
            message: result.data.message,
            previousRequest: request
          }

          return Observable.of(response)

        }
      })
  }

  /**
   * Update status
   */
  updateStatus(customerId: string, enabled: boolean): Observable<UpdateStatusData> {
    let apiUrl = `/api/Customers/UpdateStatus`;
    let request = { customerId, enabled }
    return this.httpClient.post<BaseResponse<UpdateStatusData>>(apiUrl, request)
      .flatMap(this.extraData)
  }

  /**
   * Update Licence package info
   */
  updateLicencePackages(customer: Customer, licence: LicencePackage[]): Observable<LicencePackage[]> {
    let apiUrl = `/api/CustomerLicenses`;
    let request = {
      id: customer.id,
      packages: licence,
    }
    return this.httpClient.post<BaseResponse<UpdateLicenceData>>(apiUrl, request)
      .flatMap((result: BaseResponse<UpdateLicenceData>) => {
        if (result && result.data && result.data.code == 200) {
          let packages = result.data.data && result.data.data.packages;
          return Observable.of(packages)
        }
        else {
          // error case
          return Observable.throw(result)
        }
      })
  }

  /**
   * get company info
   */
  getCompaniesInfo(id: string) {
    if (!id) return Observable.empty();

    let apiUrl = `api/Companies/${id}`;
    return this.httpClient.get<CompanyInfo>(apiUrl);
  }


  /**
   * update company info
   */
  updateCompanyInfo(info: CompanyInfo): Observable<CompanyInfo> {
    if (!info) return Observable.empty();
    let apiUrl = `api/Companies/${info.id}`;

    return this.httpClient.put<any>(apiUrl, info)
      .flatMap((result: BaseResponse<CompanyInfo>) => {
        if (result && result.data && result.data.code == 200) {
          return Observable.of(result && result.data && result.data.data)
        }
        else {
          // error case
          return Observable.throw(result)
        }
      })
  }

  uploadCompanyLogo(id: string, file: File) {
    let apiUrl = `${this.configService.getApiUrl()}/api/companies/${id}/logo`;

    let formData = new FormData()
    formData.append('files', file, file.name);
    return this.http.post(apiUrl, formData, { headers: this.configService.getHeaders() })
      .map(res => {
        let json = res && res.json();
        return json;
      })
      .flatMap((result) => {
        if (result && result.success) {
          return Observable.of(result && result.data && result.data.url)
        }
        else {
          // error case
          return Observable.throw(result)
        }
      });
  }

  extendTrial(customer: Customer, days: number): Observable<any> {
    if (!customer) { return Observable.empty() }

    let apiUrl = `api/CustomerLicenses/Extend`;
    let request = {
      id: customer.id,
      days
    };
    return this.httpClient.post<any>(apiUrl, request)
      .flatMap((result: BaseResponse<any>) => {
        if (result && result.data && result.data.code == 200) {
          return Observable.of(result && result.data && result.data.data)
        }
        else {
          // error case
          return Observable.throw(result)
        }
      })
  }


  /**
   * 
   * @param result 
   */
  private extraData(result: BaseResponse<any>) {
    let response = result.data.data;
    if (result && result.data && result.data.code == 200) {      
      response.customers = response.customers.map(element => {
        element.status == "Inactive" ? element.status = "Disabled" : element.status;
          return element;
        })       
      return Observable.of(response)
    }
    else {
      // error case
      return Observable.throw(result)
    }
  }
} 
