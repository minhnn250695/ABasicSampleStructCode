import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { SecurityService } from './security/security.service'
import { SecurityToken } from './security/security-token.model';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable()
export class LoginGuardService implements CanActivate {

  constructor(private router: Router, private securityService: SecurityService, 
              private localStorage: LocalStorageService) { }

  canActivate() {
    let user = this.securityService.authenticatedUser();
    
    // if user not found or token is invalid (expire, ..)
    // we ask user for logging in again
    if (!user || this.securityService.isTokenInvalid()) {
      this.router.navigate(["/login"]);
      return false;
    }
    return true;
  }
}
 