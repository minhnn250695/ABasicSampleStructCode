import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';

import { ClientInfo, GetClientRequest } from './models';
// services
import { ConfigService } from '../common/services/config-service';
import { BaseResponse, Pair } from '../admin-management/models/index';

@Injectable()
export class ClientListService {

  companyId: string;
  private loaderReplay: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  constructor(private httpClient: HttpClient, private configService: ConfigService) {
    this.companyId = configService.getCompanyPattern();
  }

  hideLoading() {
    if (this.loaderReplay) {
      this.loaderReplay.next(false);
    }
  }

  showLoading() {
    if (this.loaderReplay) {
      this.loaderReplay.next(true);
    }
  }

  /***
   * NEW CLIENTS APIS
   *
   */

  getAllNewClients(): Observable<ClientInfo[]> {
    let apiUrl = `api/${this.companyId}NewClients/`;
    return this.httpClient.get<BaseResponse<ClientInfo[]>>(apiUrl).map(res => {
      let data = res && res.data && res.data.data;
      return data;
    });
  }

  getNewClients(request: GetClientRequest): Observable<ClientInfo[]> {
    let apiUrl = `api/${this.companyId}NewClients/`;
    return this.httpClient.post<BaseResponse<ClientInfo[]>>(apiUrl, request).map(res => {
      let data = res && res.data && res.data.data;
      return data;
    });
  }

  addNewClients(request: any): Observable<ClientInfo[]> {
    let apiUrl = `api/${this.companyId}NewClients/Add`;
    return this.httpClient.post<BaseResponse<ClientInfo[]>>(apiUrl, request).map(res => {
      let data = res && res.data && res.data.data;
      return data;
    });
  }

  /**
   * CLIENTS APIS
   *
   */

  getAllClients(): Observable<ClientInfo[]> {
    let apiUrl = `api/${this.companyId}ClientAccounts/`;
    return this.httpClient.get<BaseResponse<ClientInfo[]>>(apiUrl).map(res => {
      let data = res && res.data && res.data.data;
      return data;
    });
  }

  getClients(request: GetClientRequest): Observable<ClientInfo[]> {
    let apiUrl = `api/${this.companyId}ClientAccounts/`;
    return this.httpClient.post<BaseResponse<ClientInfo[]>>(apiUrl, request).map(res => {
      let data = res && res.data && res.data.data;
      return data;
    });
  }

  /**
   * Delete client
   * @param request
   */
  deleteClients(request: any): Observable<ClientInfo[]> {
    let apiUrl = `api/${this.companyId}ClientAccounts/Delete`;
    return this.httpClient.post<BaseResponse<ClientInfo[]>>(apiUrl, request).map(res => {
      let data = res && res.data && res.data.data;
      return data;
    });
  }

  /**
   * Force change password
   * @param Username
   * @param Password
   */
  forceChangePassword(username: string, password: string): Observable<any> {
    let request = { username, password };

    let apiUrl = `api/${this.companyId}ForceChangePassword`;
    return this.httpClient.post<BaseResponse<any>>(apiUrl, request).map(res => {
      return res;
    });
  }

  getServiceCategory(): Observable<Pair[]> {
    let apiUrl = `api/${this.companyId}CRMData/ServiceCategories`;
    return this.httpClient.get<BaseResponse<Pair[]>>(apiUrl).map(res => {
      return res && res.data && res.data.data;
    });
  }

  sendInvitationEmail(request: any): Observable<any> {
    if (!request) { return; }
    let apiUrl = `api/${this.companyId}NewClients/ResendEmail`;
    return this.httpClient.post<BaseResponse<any>>(apiUrl, request);
    // return Observable.of(null);
  }
}
