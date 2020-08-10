import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http, ResponseContentType } from '@angular/http';
import { saveAs as importedSaveAs } from 'file-saver';
import { ReplaySubject } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { LoaderService } from '../common/modules/loader';
import { ConfigService } from '../common/services/config-service';
import { SecurityService } from '../security/security.service';

// model
import { provideConfig } from 'ngx-webstorage';
import { ApiDataResult } from '../common/api/api-data-result';
import { ApiResult } from '../common/api/api-result';
import {
    BaseResponse, ThirdParty,
    ThirdPartyConnection, ThirdPartyInfo, ThirdPartySettings, UserAccount,
} from './models';

@Injectable()
export class ThirdPartyService {
    selectedProvider: ThirdPartyInfo;
    readonly userAccount: UserAccount;
    private baseApiUrl: string;

    constructor(private http: Http,
        private httpClient: HttpClient,
        private configService: ConfigService,
        private loaderService: LoaderService,
        private securityService: SecurityService) {
        this.baseApiUrl = configService.getApiUrl();
        this.userAccount = securityService.authenticatedUser();
    }

    generateAndDownloadCertificate(providerName: string) {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/ftpcertificate/' + providerName;

        this.loaderService.show();

        this.httpClient.get(apiUrl, { responseType: 'blob' })
            .subscribe((res) => {
                importedSaveAs(res, "certificate.zip");
            }, (err) => {
                console.log("could not generate and download certificated file");
            }, () => {
                this.loaderService.hide();
            });
    }

    updateThirdParty(thirdParty: ThirdParty<ThirdPartySettings, ThirdPartyConnection>): Observable<any> {
        let apiUrl = 'api/thirdparty';
        this.loaderService.show();
        return this.httpClient.put<ApiResult>(apiUrl, JSON.stringify(thirdParty))
            .map((response) => {
                this.loaderService.hide();
                return response;
            });
    }

    getThirdParty(name: string): Observable<ThirdParty<ThirdPartySettings, ThirdPartyConnection>> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/thirdparty/' + name;
        return this.httpClient.get<ThirdParty<ThirdPartySettings, ThirdPartyConnection>>(apiUrl);
    }

    getThirdPartyInfo(name: string): Observable<ThirdPartyInfo> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/thirdpartyinfo/' + name;
        return this.httpClient.get<ThirdPartyInfo>(apiUrl);
    }

    getThirdParties(): Observable<ThirdPartyInfo[]> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/thirdpartyinfo';

        return this.httpClient.get<ThirdPartyInfo[]>(apiUrl);
    }

    getThirdPartyConfig(providerName: string, adviserCode: string): Observable<ThirdParty<ThirdPartySettings, ThirdPartyConnection>> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = `api/companies/${user.companyId}/thirdparty/${providerName}/advisers/${adviserCode}`;
        return this.httpClient.get<ThirdParty<ThirdPartySettings, ThirdPartyConnection>>(apiUrl);
    }

    addAdviserToThirdParty(adviserCode: string, providerName: string): Observable<ApiResult> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = `api/companies/${user.companyId}/thirdparty/${providerName}/advisers/${adviserCode}`;
        this.loaderService.show();
        return this.httpClient.post<ApiResult>(apiUrl, null)
            .map((response) => {
                this.loaderService.hide();
                return response;
            });
    }

    removeAdviserFromThirdParty(adviserCode: string, providerName: string): Observable<ApiResult> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = `api/companies/${user.companyId}/thirdparty/${providerName}/advisers/${adviserCode}`;
        this.loaderService.show();
        return this.httpClient.delete<ApiResult>(apiUrl)
            .map((response) => {
                this.loaderService.hide();
                return response;
            });
    }

    haveLoginAuthenticateToThirdParty(adviserCode: string): Observable<any> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = `api/companies/${user.companyId}/ClassLoginAuthenticate/advisers/${adviserCode}/status`;
        return this.httpClient.get(apiUrl);
    }
}
