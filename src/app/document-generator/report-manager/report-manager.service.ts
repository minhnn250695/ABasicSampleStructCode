import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';

import { Report } from './report.model';
import { Author } from '../template-manager/author.model';
import { ApiResult } from '../../common/api/api-result';
import { ApiDataResult } from '../../common/api/api-data-result';
import { SecurityService } from '../../security/security.service';
import { LoaderService } from '../../common/modules/loader';


@Injectable()
export class ReportManagerService {

    constructor(private http: HttpClient, 
        private securityService: SecurityService,
        private loaderService: LoaderService) { }

    getReports(): Observable<Report[]> {
        this.loaderService.show();
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/reports';
        return this.http.get<Report[]>(apiUrl)
            .map((result: Report[]) => {
                result.forEach((report: Report) => {
                    report.creationDate = new Date(report.creationDate);
                });
                this.loaderService.hide();
                return result;
            });
    }

    deleteReport(reportId: string): Observable<ApiResult> {
        this.loaderService.show();
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/reports/' + reportId;
        return this.http.delete<ApiResult>(apiUrl).map(result => {
            this.loaderService.hide();
            return result;
        });
    }

    downloadReport(id: string): Observable<Blob> {
        this.loaderService.show();
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/reports/' + id;
        return this.http.get(apiUrl, { responseType: 'blob' }).map(result => {
            this.loaderService.hide();
            return result;
        });
    }
}
