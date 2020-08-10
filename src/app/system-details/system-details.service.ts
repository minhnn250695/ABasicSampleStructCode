import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { LoaderService } from '../common/modules/loader';
import { SecurityService } from '../security/security.service';
import { SystemDetails } from './models/system-details.model';
import { SystemComponent } from './models/system-component.model';


@Injectable()
export class SystemDetailsService {


    constructor(private httpClient: HttpClient,
        private loaderService: LoaderService,
        private securityService: SecurityService) {
    }

    getSystemDetails(): Observable<SystemDetails> {
        let companyId = this.securityService.authenticatedUser().companyId;
        let apiUrl = 'api/companies/' + companyId + '/systemdetails';
        this.loaderService.show();
        return this.httpClient.get<SystemDetails>(apiUrl)
            .map(result => {
                let components: SystemComponent[] = [];
                for (var i = 0; i < result.components.length; i++) {
                    let c = result.components[i];
                    let component = new SystemComponent();
                    component.companyId = c.companyId;
                    component.lastUpdate = c.lastUpdate;
                    if (c.lastUpdate)
                        component.lastUpdate = new Date(c.lastUpdate);
                    component.name = c.name;
                    component.type = c.type;
                    component.updated = c.updated;
                    component.version = c.version;
                    component.whatsNewLink = c.whatsNewLink;
                    component.updateAllowed = c.updateAllowed;
                    components.push(component);
                }
                result.components = components;
                this.loaderService.hide();
                return result;
            });
    }

    getSystemComponent(componentType: number) {
        let companyId = this.securityService.authenticatedUser().companyId;
        let apiUrl = 'api/companies/' + companyId + '/systemdetails/'+componentType;
        this.loaderService.show();
        return this.httpClient.get<SystemComponent>(apiUrl).map(result => {
            this.loaderService.hide();
            if (result.lastUpdate)
                result.lastUpdate = new Date(result.lastUpdate);
            return result;
        });
    }

    updateAll() {

    }
}
