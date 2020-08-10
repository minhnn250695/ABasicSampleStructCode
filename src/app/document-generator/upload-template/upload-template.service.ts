import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ApiResult } from '../../common/api/api-result';
import { ApiDataResult } from '../../common/api/api-data-result';
import { Template } from '../template-manager/template.model';
import { SecurityService } from '../../security/security.service';


@Injectable()
export class UploadTemplateService {


    constructor(private http: HttpClient, private securityService: SecurityService) { }

    uploadFile(file: File): Observable<ApiDataResult<Template>> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/users/' + user.id + '/templateFiles';
        let formData = new FormData();
        formData.append('file', file, file.name);

        return this.http.post<ApiDataResult<Template>>(apiUrl, formData);
    }
}
