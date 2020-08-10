import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { LoaderService } from '../common/modules/loader';
import { SecurityService } from '../security/security.service';

//model
import { SetupStep1, SetupStep2, SetupStep3, CompanyLogo } from './models';
import { ApiResult } from '../common/api/api-result';
import { ApiDataResult } from '../common/api/api-data-result';

@Injectable()
export class SetupService {

    constructor(private httpClient: HttpClient,
        private loaderService: LoaderService,
        private securityService: SecurityService) {
    }

    getStatusStep2(processId: string): Observable<SetupStep2> {
        let companyId = this.securityService.authenticatedUser().companyId;
        let apiUrl = 'api/companies/' + companyId + '/setupStep2/' + processId;
        this.loaderService.show();
        return this.httpClient.get<SetupStep2>(apiUrl)
            .map(result => {
                this.loaderService.hide();
                return result;
            });
    }

    continueStep2(componentType?: number): Observable<ApiDataResult<string>> {
        let companyId = this.securityService.authenticatedUser().companyId;
        let apiUrl = 'api/companies/' + companyId + '/setupStep2';
        if (componentType)
            apiUrl += "/" + componentType;

        this.loaderService.show();
        return this.httpClient.post<ApiDataResult<string>>(apiUrl, null)
            .map(result => {
                this.loaderService.hide();
                return result;
            });
    }

    getSetupStep1(): Observable<SetupStep1> {
        let userName = this.securityService.authenticatedUser().userName;
        let apiUrl = 'api/users/' + userName + '/setupStep1';
        this.loaderService.show();
        return this.httpClient.get<SetupStep1>(apiUrl)
            .map(result => {
                this.loaderService.hide();
                return result;
            });
    }

    saveSetupStep1(step1: SetupStep1): Observable<ApiDataResult<boolean>> {
        let apiUrl = 'api/companies/setupStep1';
        this.loaderService.show();
        return this.httpClient.post<ApiDataResult<boolean>>(apiUrl, JSON.stringify(step1))
            .map(result => {
                this.loaderService.hide();
                return result;
            });
    }

    getSetupStep3(): Observable<SetupStep3> {
        let companyId = this.securityService.authenticatedUser().companyId;
        let apiUrl = 'api/companies/' + companyId + '/setupStep3';
        this.loaderService.show();
        return this.httpClient.get<SetupStep3>(apiUrl)
            .map(result => {
                this.loaderService.hide();
                return result;
            });
    }

    saveSetupStep3(step3: SetupStep3): Observable<ApiDataResult<boolean>> {
        let apiUrl = 'api/setupStep3';
        this.loaderService.show();
        return this.httpClient.post<ApiDataResult<boolean>>(apiUrl, JSON.stringify(step3))
            .map(result => {
                this.loaderService.hide();
                return result;
            });
    }

    uploadLogo(file: File) {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/logo';
        let formData = new FormData();
        formData.append('file', file, file.name);
        this.loaderService.show();
        return this.httpClient.post<ApiDataResult<CompanyLogo>>(apiUrl, formData).map(result => {
            this.loaderService.hide();
            return result;
        });
    }


}
