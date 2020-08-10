import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SecurityService } from '../../security/security.service'
import { SecurityToken } from '../../security/security-token.model';

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(private router: Router, private securityService: SecurityService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    let user = this.securityService.authenticatedUser();
    
    // if user not found or token is invalid (expire, ..)
    // we ask user for logging in again
    if (!user || this.securityService.isTokenInvalid()) {
      this.router.navigate(["/login"]);
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }
}
 