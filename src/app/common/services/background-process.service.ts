import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ApiResult } from '../api/api-result';
import { ApiDataResult } from '../api/api-data-result';
import { SecurityService } from '../../security/security.service';
import { LoaderService } from '../modules/loader';
import { BackgroundProcess } from '../models/index';
import { ConfigService } from '../../common/services/config-service';


@Injectable()
export class BackgroundProcessService {

    private checkProcessStatusInterval: any;
    private attempts: number;
    constructor(private http: HttpClient,
        private securityService: SecurityService,
        private loaderService: LoaderService,
        private configService: ConfigService) {
        // this.companyPattern = configService.getCompanyPattern();
    }

    private getProcess(processId: string, isScenarioReport: boolean): Observable<BackgroundProcess> {
        let apiUrl = "";
        if (isScenarioReport) {
            let companyPattern = this.configService.getCompanyPattern();
            apiUrl = 'api/' + companyPattern + 'backgroundprocess/' + processId;
        }
        else {
            let user = this.securityService.authenticatedUser();
            apiUrl = 'api/companies/' + user.companyId + '/backgroundprocess/' + processId;
        }
        return this.http.get<BackgroundProcess>(apiUrl);
    }

    waitProcessComplete(processId: string, interval: number, maxAttempts: number, isScenarioReport: boolean): Promise<BackgroundProcess> {
        let self = this;
        this.attempts = 0;
        let promise = new Promise<BackgroundProcess>((resolve, reject) => {
            this.checkProcessStatusInterval = setInterval(function () {
                self.getProcess(processId, isScenarioReport).subscribe(result => {
                    if (result.finished || result.failed) {
                        clearInterval(self.checkProcessStatusInterval);
                        resolve(result);
                    }
                });
                self.attempts++;
                if (self.attempts >= maxAttempts) {
                    clearInterval(self.checkProcessStatusInterval);
                    reject("time out");
                }
            }, interval);
        });

        return promise;
    }
}
