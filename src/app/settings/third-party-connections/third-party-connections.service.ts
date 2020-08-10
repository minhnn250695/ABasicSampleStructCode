import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { FTPConfig } from './ftpConfig.model';
import { ApiResult } from '../../common/api/api-result';
import { ApiDataResult } from '../../common/api/api-data-result';
import { SecurityService } from '../../security/security.service';

@Injectable()
export class ThirdPartyConnectionsService {

    constructor(private http: HttpClient, private securityService: SecurityService) { }

    getFTPConfig(providerName: string): Observable<FTPConfig> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/ftpconfig/' + providerName;

        return this.http.get<FTPConfig>(apiUrl);
    }

    postFTPConfig(ftpConfig: FTPConfig): Observable<ApiResult> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/ftpconfig';

        return this.http.post<ApiResult>(apiUrl, JSON.stringify(ftpConfig));
    }

    putFTPConfig(ftpConfig: FTPConfig): Observable<ApiResult> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/ftpconfig';

        return this.http.put<ApiResult>(apiUrl, JSON.stringify(ftpConfig));
    }

    uploadCertificate(providerName: string, file: File): Observable<ApiDataResult<string>> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/ftpConfigCertificate/' + providerName;
        let formData = new FormData();
        formData.set('file', file, file.name);

        return this.http.post<ApiDataResult<string>>(apiUrl, formData);
    }

}
