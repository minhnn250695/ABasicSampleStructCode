import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable()
export class ForgotPasswordService {
  companyLogoUrl: string;

  constructor(private httpClient: HttpClient) { }

  submitForgotPassEmail(email: string): Observable<any> {
    if (!email) return;
    let apiUrl = `api/ForgotPassword`;
    sessionStorage.setItem('requestEmail', email);
    return this.httpClient.post(apiUrl, { UserName: email });
  }

  resetNewPass(newPass: string, token: string, email: string): Observable<any> {
    // return Observable.of("reset sucess");
    if (!newPass || !token || !email) return;
    let apiUrl = `api/ResetPassword`;
    let form = { UserName: email, Password: newPass, Token: token };
    return this.httpClient.post(apiUrl, form);
  }

  getEmailAddress(token: string, companyId: string): Observable<any> {
    let apiUrl = `api/NewClientsUserContact/companies/${companyId}/token/${token}/GetActiveEmailResetPasword`;
    return this.httpClient.get(apiUrl);
  }


  getCompanyLogo(companyId: string): Observable<any> {
    if (companyId) {
      let apiUrl = `api/CompanyLogos/${companyId}`;
      return this.httpClient.get(apiUrl).map((response: any) => {
        this.companyLogoUrl = response && response.url;
        return response;
      });
    }
  }

}
