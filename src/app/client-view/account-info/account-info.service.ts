import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ConfigService } from '../../common/services/config-service';
import { BaseResponse } from '../models';

@Injectable()
export class AccountInfoService {

  private baseApiUrl: string;
  private companyPattern: string;
  private companyId: string;

  constructor(private httpClient: HttpClient, private configService: ConfigService, private http: Http) {
    this.baseApiUrl = configService.getApiUrl();
    this.companyPattern = configService.getCompanyPattern();
    this.companyId = localStorage.getItem('companyId');
  }

  updatePassword({ userName, oldPass, newPass }): Observable<any> {
    let apiUrl = `api/${this.companyPattern}ChangePassword`;
    let token = JSON.parse(localStorage.getItem("token"));
    let form = {
      Username: userName,
      OldPassword: oldPass,
      NewPassword: newPass,
      Token: token.value,
    };

    return this.httpClient.post<BaseResponse<any>>(apiUrl, form);
  }

  updateProfilePhoto(file: File): Observable<any> {
    let userId = JSON.parse(localStorage.getItem("authenticatedUser")).id;
    let apiUrl = `api/users/${userId}/profileimage`;

    let formData: FormData = new FormData();
    formData.append('File', file);

    return this.http.post(this.baseApiUrl + apiUrl, formData, { headers: this.configService.getHeaders() })
      .map((res) => res.json())
      .map((response) => {
        let imageUrl = response.imageUrl;
        localStorage.setItem('profileImage', imageUrl);
        return response;
      });
  }
}
