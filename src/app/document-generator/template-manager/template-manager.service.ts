import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';

import { Template } from './template.model';
import { DuplicatedTemplate } from './duplicated-template.model';
import { Author } from './author.model';
import { DocumentGeneratorConfig } from './document-generator-config.model';
import { ApiResult } from '../../common/api/api-result';
import { ApiDataResult } from '../../common/api/api-data-result';
import { SecurityService } from '../../security/security.service';
import { LoaderService } from '../../common/modules/loader';


@Injectable()
export class TemplateManagerService {

    private selectedTemplate: Template;
    private documentGeneratorConfig: DocumentGeneratorConfig;

    constructor(private http: HttpClient,
        private securityService: SecurityService,
        private loaderService: LoaderService) { }

    getTemplates(): Observable<Template[]> {
        this.loaderService.show();
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/templates';
        return this.http.get<Template[]>(apiUrl)
            .map((result: Template[]) => {
                let templates: Template[] = [];
                result.forEach((t: Template) => {
                    templates.push(new Template(t));
                });
                this.loaderService.hide();
                return templates;
            });
    }

    getAuthors(): Observable<Author[]> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/authors';
        return this.http.get<Author[]>(apiUrl).map(result => {
            return result;
        });
    }

    copyTemplate(template: Template): Observable<ApiDataResult<Template>> {
        this.loaderService.show();
        let user = this.securityService.authenticatedUser();
        let duplicatedTemplate = new DuplicatedTemplate(template, user.id);
        let apiUrl = 'api/companies/' + user.companyId + '/duplicatedtemplates';
        return this.http.post<ApiDataResult<Template>>(apiUrl, JSON.stringify(duplicatedTemplate)).map(result => {
            this.loaderService.hide();
            return result;
        });
    }

    deleteTemplate(template: Template): Observable<ApiResult> {
        this.loaderService.show();
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/templates/' + template.id;
        return this.http.delete<ApiResult>(apiUrl).map(result => {
            this.loaderService.hide();
            return result;
        });
    }

    selectTemplate(template: Template): void {
        if (template == null) {
            template = this.documentGeneratorConfig.defaultTemplate;
            template.isNew = true;
        }
        if (template.authorId == '00000000-0000-0000-0000-000000000000') {
            template.authorId = this.securityService.authenticatedUser().id;
        }
        this.selectedTemplate = template;
    }

    getSelectedTemplate(): Template {
        return this.selectedTemplate;
    }

    getDocumentGeneratorUrl(): string {
        let token = this.securityService.token();
        let user = this.securityService.authenticatedUser();
        let params = new URLSearchParams();
        for (let key in this.selectedTemplate) {
            params.set(key, this.selectedTemplate[key]);
        }
        let url = this.documentGeneratorConfig.hostUrl + '?' + params.toString() + '&token=' + token.value + '&companyId=' + user.companyId;
        return url;
    }

    getDocumentGeneratorConfig(): Observable<DocumentGeneratorConfig> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/users/' + user.id + '/documentgeneratorconfig';
        return this.http.get<DocumentGeneratorConfig>(apiUrl).map(result => this.documentGeneratorConfig = result);
    }

}
