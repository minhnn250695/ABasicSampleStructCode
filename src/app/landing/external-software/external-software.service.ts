import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';
// services
import { ConfigService } from '../../common/services/config-service';
// components
import { DataImportFromFile } from "./models/data-imports-from-file.model";
import { DataImportsEntityManualMap, MatchedRecord, UnMatchedRecord, UnmappedFields, InvalidRecord, EntityImportResponse } from './models';
import { ImportEntityTemplate } from './models/entity-template.model';
import { BaseResponse } from '../../client-view/models';
import { Pairs } from '../../revenue-import/models';

@Injectable()
export class ExternalSoftwareService {
    private companyPattern: string;
    private reloadRequest = new Subject<any>();
    private loadPageRequest = new Subject<any>();
    private errorDialogRequest = new Subject<any>();
    // state data    
    templateFields: string[] = [];
    targetNames: string[] = [];
    entityFields: { displayName: string, targetName: string }[] = [];
    crmResource: Pairs[] = [];
    searchContacts: Pairs[] = [];
    searchAccounts: Pairs[] = [];
    searchSystemUsers: Pairs[] = [];

    file: File;
    entityName: string;
    importTemplate: ImportEntityTemplate;
    uploadResponse: DataImportFromFile;
    isLoadingData = false;
    pageSize = 100;

    constructor(private http: Http,
        private httpClient: HttpClient,
        private configService: ConfigService,
    ) {
        this.companyPattern = configService.getCompanyPattern();
    }

    /*--------------------------- Start API method  --------------------------- */
    xPlanDataImportExecutions(user: string, pass: string, u: string): Observable<any>{
        let apiUrl = `api/XPlanDataImportExecutions`;
        let body = { "UserName": user, "Password": pass, "Url": u };
        return this.httpClient.post(apiUrl, body);
    }

    /*--------------------------- End API method     --------------------------- */
    
    /*--------------------------- Start Handle Request --------------------------- */

    handleReloadDataRequest() {
        return this.reloadRequest.asObservable();
    }

    handleLoadPageRequest() {
        return this.loadPageRequest.asObservable();
    }

    handleShowErrorDialog() {
        return this.errorDialogRequest.asObservable();
    }

    showErrorDialog(message: any) {
        this.errorDialogRequest.next(message);
    }
    /*---------------------------  End Handle Request --------------------------- */
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /*--------------------------- Some Other Function --------------------------- */
}
