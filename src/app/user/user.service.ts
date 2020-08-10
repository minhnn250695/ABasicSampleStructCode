import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';

// models
import { ActivateUserRequest } from './models';

//services
import { ConfigService } from '../common/services/config-service';
import { BaseResponse, Pair } from '../admin-management/models/index';

@Injectable()
export class UserService {
  companyId: string;
  companyLogoUrl: string = "../../../../assets/img/miplan-logo-large.png";

  constructor(private httpClient: HttpClient, private configService: ConfigService) {
    this.companyId = configService.getCompanyPattern();
  }

  activateUser(request: ActivateUserRequest) {
    let apiUrl = `api/ChangePassword/CompleteActivateUser`;
    return this.httpClient.post<BaseResponse<any>>(apiUrl, request).flatMap(res => {
      if (res && res.success) {
        return Observable.of(res.success);
      }
      return Observable.throw(res.error);
    })
  }

  getEmailAddress(token: string, companyId: string): Observable<any> {
    let apiUrl = `api/NewClientsUserContact/companies/${companyId}/token/${token}/GetActiveEmail`;
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
