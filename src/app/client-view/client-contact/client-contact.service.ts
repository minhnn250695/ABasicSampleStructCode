import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ClientContactService {

  constructor(private httpClient: HttpClient, localStorage: LocalStorageService) { }

  // getContactInfo() {
  //   let companyId = localStorage.getItem('companyId');
  //   let apiUrl = `api/companies/${companyId}`;
  //   return this.httpClient.get(apiUrl);
  // }

  sendMessage(request: any): Observable<any> {
    if (!request) return;
    let apiUrl = `api/ContactUs`;
    return this.httpClient.post<Observable<any>>(apiUrl, request);
  }

}
