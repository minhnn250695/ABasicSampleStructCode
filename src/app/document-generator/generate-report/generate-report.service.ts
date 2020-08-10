import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ApiResult } from '../../common/api/api-result';
import { ApiDataResult } from '../../common/api/api-data-result';
import { SecurityService } from '../../security/security.service';
import { Client } from '../../common/models';
import { Report } from './report.model';
import { Pair } from '../../common/models/pair.model';
import { BaseResponse } from '../../common/api/base-response.model';
import { LoaderService } from '../../common/modules/loader';


@Injectable()
export class GenerateReportService {


    constructor(private http: HttpClient, 
        private securityService: SecurityService,
        private loaderService: LoaderService) { }

    getClients(): Observable<Client[]> {
        this.loaderService.show();
        let apiUrl = 'api/clients';
        return this.http.get<Client[]>(apiUrl).map(result => {
            this.loaderService.hide();
            return result;
        });
    }

    getRecentClients(): Observable<Client[]> {
        this.loaderService.show();
        let user = this.securityService.authenticatedUser();
        let apiUrl = `api/companies/${user.companyId}/CRMData/RecentClients/${user.id}`;
        return this.http.get<BaseResponse<Pair[]>>(apiUrl).map(res => {
            this.loaderService.hide();
            return res.data.data.map(item => new Client(item.id, item.value));
        });
    }

    generateReport(report: Report): Observable<ApiDataResult<string>> {
        let user = this.securityService.authenticatedUser();
        report.userId = user.id;
        let apiUrl = 'api/companies/' + user.companyId + '/reports';
        return this.http.post<ApiDataResult<string>>(apiUrl, JSON.stringify(report));
    }

    

    addToRecentClients(client: Pair) {
        this.loaderService.show();
        let user = this.securityService.authenticatedUser();
        let apiUrl = `api/companies/${user.companyId}/CRMData/RecentClient`;
        let payload = {
            userid: user.id,
            clientid: client.id,
            clientname: client.value
        };

        return this.http.post<any>(apiUrl, payload).map(result => {
            this.loaderService.hide();
            return result;
        });
    }
}
