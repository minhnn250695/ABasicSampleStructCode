import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { ISubscription } from 'rxjs/Subscription';
import { ApiDataResult } from '../common/api/api-data-result';
import { RoleAccess } from '../common/models';
import { LoginResponse } from './login-response.model';
import { SecurityToken } from './security-token.model';
import { UserAccount } from './user-account.model';

@Injectable()
export class SecurityService {

    constructor(private http: HttpClient, localStorage: LocalStorageService) { }

    getAuthenticatedUser(): Observable<any> {
        return this.http.get<any>('api/login/');
    }

    login(username: string, password: string): Observable<any> {

        let data = { username, password };

        return this.http.post('api/login/', JSON.stringify(data))
            .map((result: ApiDataResult<LoginResponse>) => {
                if (result.success) {
                    // store token
                    localStorage.setItem('token', JSON.stringify(result.data.token));
                    if (result.data && result.data.user) {
                        this.storeUserToStorage(result.data.user);

                    }
                    return result.data.user;
                    // if (!result.data.user.isAdmin)
                    //     localStorage.setItem("selected_client_id_in_client_view", result.data.user.id);
                    // localStorage.setItem('authenticatedUser', JSON.stringify(result.data.user));
                    // localStorage.setItem('token', JSON.stringify(result.data.token));
                    // localStorage.setItem('companyId', result.data.user.companyId);
                    // localStorage.setItem('profileImage', result.data.user.profileImage);
                }
                return result;
            });
        // .map((result: ApiDataResult<LoginResponse>) => {
        //     return result && result.data && result.data.user;
        // });
    }

    logout(): Observable<object> {
        localStorage.clear();
        return this.http.delete('api/login');
    }

    clearAuthenticatedUserInfo() {
        localStorage.setItem('authenticatedUser', null);
        localStorage.setItem('token', null);
        localStorage.setItem('companyId', null);
        localStorage.setItem('selected_client_id_in_client_view', null);
    }

    authorize(roles: string[]): boolean {

        if (roles.length === 0) {
            return true;
        }
        else {
            let authUser = this.authenticatedUser();
            if (authUser != null) {

                for (let role of roles) {
                    if (authUser.roles.indexOf(role) > 0) {
                        return true;
                    }
                }
            }

            return false;
        }
    }

    authenticatedUser(): UserAccount {

        let item = JSON.parse(localStorage.getItem('authenticatedUser'));
        if (item != null) {
            if (localStorage.getItem('companyId') === "null") {
                localStorage.setItem('companyId', item.companyId);
            }
            return item;
        }
        return new UserAccount();
    }

    getUserInfo(): Observable<UserAccount> {
        let userId = localStorage.getItem('selected_client_id_in_client_view');
        if (!userId) { return; }
        let apiUrl = `api/users/${userId}`;

        return this.http.get<UserAccount>(apiUrl);
    }

    saveAuthenticatedUser(userAccount: UserAccount) {
        localStorage.setItem('authenticatedUser', JSON.stringify(userAccount));
    }

    token(): SecurityToken {
        let item = localStorage.getItem('token');
        return item ? JSON.parse(item) : null;
    }

    getCompanyId(): String {
        let account = this.authenticatedUser();
        return account && account.companyId;
    }

    getLogoUrl(): Observable<any> {
        let account = this.authenticatedUser();
        let apiUrl = `api/users/${account.userName}/companylogos`;

        return this.http.get(apiUrl);
    }

    getCompanyInfo(): Observable<any> {
        let companyId = localStorage.getItem('companyId');
        if (companyId) {
            let apiUrl = `api/Companies/${companyId}`;
            return this.http.get<any>(apiUrl);
        }
    }

    isTokenInvalid(): boolean {
        let token: SecurityToken = JSON.parse(localStorage.getItem('token'));
        if (!token) { return true; }

        let now = Date.now();
        let expire = (new Date(token.expiration)).getTime();
        let remainingTime = (expire - now) / 1000; // in second
        return remainingTime <= 0;
    }

    getTokenForSSOCase(): Promise<UserAccount> {
        return this.http.get('api/token/').toPromise()
            .then(token => {
                if (token) {
                    localStorage.setItem('token', JSON.stringify(token));
                }
                return Promise.resolve(this.authenticatedUser());
            });
    }

    checkAuthenticatedUser(): Promise<UserAccount> {
        if (this.authenticatedUser() && !this.isTokenInvalid()) {
            return Promise.resolve(this.authenticatedUser());
        }

        return this.getAuthenticatedUser()
            .toPromise()
            .then(result => {
                if (result.error && result.error.errorCode) {
                    localStorage.removeItem('authenticatedUser');
                    localStorage.removeItem('companyId');
                    localStorage.removeItem('profileImage');
                    return Promise.resolve(result);
                }
                else if (result && result.success) {
                    // Save the authenticated user
                    localStorage.setItem('authenticatedUser', JSON.stringify(result.data));
                    localStorage.setItem('companyId', result.data.companyId);
                    localStorage.setItem('profileImage', result.data.profileImage);
                    // For SSO scenario users can be authenticated but don't have a token so we need to request it
                    if (this.isTokenInvalid()) {
                        return this.getTokenForSSOCase();
                    }
                    return Promise.resolve(result);
                }
                return Promise.resolve(null);
            });
    }

    storeUserToStorage(user: UserAccount) {
        if (!user.isAdmin)
            localStorage.setItem("selected_client_id_in_client_view", user.id);
        localStorage.setItem('authenticatedUser', JSON.stringify(user));
        localStorage.setItem('companyId', user.companyId);
        localStorage.setItem('profileImage', user.profileImage);
    }

    isClientAdminOrStaff() {
        let user = this.authenticatedUser();
        let role = user && user.roleAccess && user.roleAccess[0];
        return role && role.name && (role.name === RoleAccess.PORTAL_BUSINESS_ADMIN
            || role.name === RoleAccess.PORTAL_BUSINESS_STAFF);
    }

    isClientAdmin() {
        let user = this.authenticatedUser();
        let role = user && user.roleAccess && user.roleAccess[0];
        return role && role.name && (role.name === RoleAccess.PORTAL_BUSINESS_ADMIN);
    }

    isPortalBusinessAccount() {
        let user = this.authenticatedUser();
        let role = user && user.roleAccess && user.roleAccess[0];
        return role && role.name && (role.name === RoleAccess.PORTAL_BUSINESS_ADMIN ||
            role.name === RoleAccess.PORTAL_BUSINESS_STAFF ||
            role.name === RoleAccess.PORTAL_BUSINESS_CLIENT);
    }

    isClient() {
        let user = this.authenticatedUser();
        let role = user && user.roleAccess && user.roleAccess[0];
        return role && role.name && (role.name === RoleAccess.PORTAL_BUSINESS_CLIENT);
    }

    isPortalAdmin() {
        let user = this.authenticatedUser();
        let role = user && user.roleAccess && user.roleAccess[0];
        return role && role.name && (role.name === RoleAccess.PORTAL_FINPAL_ADMIN ||
            role.name === RoleAccess.PORTAL_FINPAL_STAFF);
    }
}