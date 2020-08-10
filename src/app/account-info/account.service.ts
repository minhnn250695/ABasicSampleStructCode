import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";

import { Http } from "@angular/http";
import { ConfigService } from "../common/services/config-service";
import { BaseResponse } from "../revenue-import/models/index";

@Injectable()
export class AccountService {

  private baseApiUrl: string;
  private companyPattern: string;
  private companyId: string;

  constructor(private httpClient: HttpClient, private configService: ConfigService, private http: Http) {
    this.baseApiUrl = configService.getApiUrl();
    this.companyPattern = configService.getCompanyPattern();
    this.companyId = localStorage.getItem("companyId");
  }

  updateLoginEmail(email: string): Observable<any> {
    return Observable.of("done");
  }

  updatePassword({ oldPass, newPass }): Observable<any> {
    let apiUrl = `api/${this.companyPattern}ChangePassword`;
    let user = JSON.parse(localStorage.getItem("authenticatedUser"));
    let token = JSON.parse(localStorage.getItem("token"));
    let form = {
      Username: user.userName,
      OldPassword: oldPass,
      NewPassword: newPass,
      Token: token.value,
    };

    return this.httpClient.post<BaseResponse<any>>(apiUrl, form)
      .map((res) => {
        let data = res && res.data && res.data.data;
        return data;
      });
  }

  updateProfilePhoto(file: File): Observable<any> {
    let userId = JSON.parse(localStorage.getItem("authenticatedUser")).id;
    let apiUrl = `api/users/${userId}/profileimage`;

    let formData: FormData = new FormData();
    formData.append("File", file);

    return this.http.post(this.baseApiUrl + apiUrl, formData, { headers: this.configService.getHeaders() })
      .map((res) => res.json())
      .map((response) => {
        let imageUrl = response.imageUrl;
        localStorage.setItem("profileImage", imageUrl);
        return response;
      });
  }

  updateCompanyLogo(file: File): Observable<any> {
    let apiUrl = `api/companies/${this.companyId}/logo`;

    let formData: FormData = new FormData();
    formData.append("File", file);

    return this.http.post(this.baseApiUrl + apiUrl, formData, { headers: this.configService.getHeaders() })
      .map((res) => res.json())
      .map((response) => {
        return response;
      });
  }

  updateCompanyInfo(update: any): Observable<any> {
    let apiUrl = `api/Companies/${this.companyId}`;
    return this.httpClient.put(apiUrl, update);
  }

  getCompaniesInfo(): Observable<any> {
    let apiUrl = `api/Companies/${this.companyId}`;
    return this.httpClient.get<any>(apiUrl);
  }

}
