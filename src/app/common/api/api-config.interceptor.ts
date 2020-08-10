import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { SecurityToken } from './../../security/security-token.model';
import * as jwtDecode from "jwt-decode";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { Router } from '@angular/router';

@Injectable()
export class ApiConfigInterceptor implements HttpInterceptor {

    private apiUrl = "<api-url>";

    constructor(private localStorage: LocalStorageService, private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        let headers = req.headers;
        if (req.url.indexOf('/templateFiles') == -1 &&
            req.url.indexOf('/ftpConfigCertificate') == -1 &&
            req.url.indexOf('/logo') == -1) { // TODO
            headers = req.headers.set('Content-Type', 'application/json');
        }

        //disable IE ajax request caching
        headers = headers.set('If-Modified-Since', 'Mon, 26 Jul 1997 05:00:00 GMT');
        // extra
        headers = headers.set('Cache-Control', 'no-cache');
        headers = headers.set('Pragma', 'no-cache');

        let token = JSON.parse(localStorage.getItem('token'));
        if (token) {
            // Check token expired
            if (token && (jwtDecode(token.value).exp >= Math.floor(Date.now() / 1000))) {
                headers = headers.set('Authorization', 'Bearer ' + token.value);
            }
            else {
                this.router.navigate(['/login']);
            }
        }

        // add company id to url
        let companyId = localStorage.getItem('companyId');
        let newUrl: string = req.url;

        if (companyId && newUrl.indexOf("<company-id>") != -1) {
            let additionalUrl = `companies/${companyId}`
            newUrl = newUrl.replace("<company-id>", additionalUrl)
        }

        const newReq = req.clone({
            headers: headers,
            withCredentials: true,
            url: this.apiUrl + newUrl
        });

        return next.handle(newReq);
    }
}