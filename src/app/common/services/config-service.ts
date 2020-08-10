import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable()
export class ConfigService {

    private apiUrl = "<api-url>";
    private appUrl = "<app-url>";

    constructor(private localStorage: LocalStorageService) {

    }

    getApiUrl(): string {

        return this.apiUrl;
    }

    getAppUrl(): string {
        return window.location.origin + "/";
    }

    getCompanyPattern() {
        return "<company-id>/";
    }

    getHeaders() {
        let token = JSON.parse(localStorage.getItem('token'));
        let headers = new Headers();
        if (token) {
            headers.set('Authorization', 'Bearer ' + token.value);
        }
        // disable IE ajax request caching
        headers.set('If-Modified-Since', 'Mon, 26 Jul 1997 05:00:00 GMT');
        // extra
        headers.set('Cache-Control', 'no-cache');
        headers.set('Pragma', 'no-cache');

        return headers;
    }

    companyId() {
        return localStorage.getItem('companyId');
    }

    addCompanyIdToUrl(url: string, includeBaseUrl: boolean = false): string {
        if (!url) { return url; }
        let companyId = localStorage.getItem('companyId');

        if (companyId) {
            let additionalUrl = `companies/${companyId}`;
            let list = url.split("/");
            let pos = list.findIndex((item) => item === "api");
            if (pos !== -1) {
                list.splice(pos + 1, 0, additionalUrl);
            }
            let result = list.join("/");
            return includeBaseUrl ? this.getApiUrl() + result : result;
        }

        return includeBaseUrl ? this.getApiUrl() + url : url;
    }
}