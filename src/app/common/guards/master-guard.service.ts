import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// services
import { SecurityService } from '../../security/security.service'
import { SecurityToken } from '../../security/security-token.model';
import { LocalStorageService } from 'ngx-webstorage';

// guards
import { IsClientAdminGuard } from './is-client-admin.service';
import { IsClientAdminStaffGuard } from './is-client-admin-staff.service';
import { IsClientGuard } from './is-client.service';
import { IsFinpalAdminGuard } from './is-finpal-admin.service';
import { LoginGuard } from './login-guard.service';
import { GUARDS, IsPortalBusinessGuard } from './index'

@Injectable()
export class MasterGuard implements CanActivate {
    private route: ActivatedRouteSnapshot;
    private state: RouterStateSnapshot;
    constructor(private router: Router,
        private securityService: SecurityService,
        private localStorage: LocalStorageService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        this.route = route;
        this.state = state;

        if (!route.data) {
            return Promise.resolve(true);
        }

        //this.route.data.guards is an array of strings set in routing configuration

        if (!this.route.data.guards || !this.route.data.guards.length) {
            return Promise.resolve(true);
        }
        return this.executeGuards();
    }

    //Execute the guards sent in the route data 
    private executeGuards(guardIndex: number = 0): Promise<boolean> {
        return this.activateGuard(this.route.data.guards[guardIndex])
            .then((isActive) => {
                //  
                if (!isActive) return Promise.resolve(false);
                // continue checking for the others
                if (guardIndex < this.route.data.guards.length - 1) {
                    return this.executeGuards(guardIndex + 1);
                } else {
                    return Promise.resolve(true);
                }
            })
            .catch((err) => {
                return Promise.resolve(false);
            });
    }

    //Create an instance of the guard and fire canActivate method returning a promise
    private activateGuard(guardKey: string): Promise<boolean> {
        let guard: any;
        switch (guardKey) {
            case GUARDS.IsClientAdminGuard:
                guard = new IsClientAdminGuard(this.router, this.securityService);
                break;
            case GUARDS.IsClientAdminStaffGuard:
                guard = new IsClientAdminStaffGuard(this.router, this.securityService);
                break;
            case GUARDS.IsClientGuard:
                guard = new IsClientGuard(this.router, this.securityService);
                break;
            case GUARDS.IsPortalBusinessGuard:
                guard = new IsPortalBusinessGuard(this.router, this.securityService);
                break;
            case GUARDS.IsFinpalAdminGuard:
                guard = new IsFinpalAdminGuard(this.router, this.securityService);
                break;
            case GUARDS.LoginGuard:
                guard = new LoginGuard(this.router, this.securityService);
                break;
            default:
                break;
        }
        return guard.canActivate(this.route, this.state);
    }
}
