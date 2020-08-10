import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SecurityService } from '../../../security/security.service';


import { RecentTemplate } from './recent-template.model';

@Injectable()
export class DocumentsGenService {

    constructor(private http: HttpClient, private securityService: SecurityService) { }

    getRecentTemplates(): Observable<RecentTemplate[]> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/recentTemplates';
        return this.http.get<RecentTemplate[]>(apiUrl);
    }

}
