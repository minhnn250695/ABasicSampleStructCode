import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { SecurityService } from '../../security/security.service'
import { RoleAccess } from '../models'

@Injectable()
export class IsFinpalAdminGuard implements CanActivate {

  constructor(private router: Router, private securityService: SecurityService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    if (this.securityService.isPortalAdmin()) {
      return Promise.resolve(true);
    }
    // this.router.navigate(["/login"])
    return Promise.resolve(false);
  }
}
