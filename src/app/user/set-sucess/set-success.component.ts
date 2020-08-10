import { Component, OnInit, OnDestroy } from '@angular/core';
import { BaseEventComponent } from '../../common/components/base-component/index';
import { Observable } from 'rxjs/Observable';
import { Result, UiEvent } from '../../common/models/index';
import { Router } from '@angular/router';
import { ConfigService } from '../../common/services/config-service';
import { SecurityService } from '../../security/security.service'
import { UserService } from '../user.service';
enum ResetSuccess {
  LOG_OUT
}
declare var $: any;
@Component({
  selector: 'app-set-success',
  templateUrl: './set-success.component.html',
  styleUrls: ['./set-success.component.css'],
  providers: [SecurityService]
})

export class SetSucessComponent extends BaseEventComponent implements OnInit, OnDestroy {

  companyLogoUrl: string;

  constructor(private router: Router,
    private userSerivce: UserService,
    private securityService: SecurityService,
    configService: ConfigService) {
    super(configService, null)
  }

  ngOnInit() {
    $('body').addClass('full');
    this.onBaseInit();
    if (!this.userSerivce.companyLogoUrl) {
      const companyId = sessionStorage.getItem("registerCompany");
      this.userSerivce.getCompanyLogo(companyId).subscribe(logo => {
        this.companyLogoUrl = logo.url;
      })
    } else
      this.companyLogoUrl = this.userSerivce.companyLogoUrl;
  }

  ngOnDestroy() {
    this.onBaseDestroy();
    $('body').removeClass('full');
  }

  btnSignInClick() {
    if (localStorage.getItem('token'))
      this.proceedEvent(ResetSuccess.LOG_OUT);
    else
      this.router.navigate(["/login"]);
  }

  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();

    if (event.event == ResetSuccess.LOG_OUT) {
      return this.securityService.logout();
    }
    // 
  }

  handleEventResult(result: Result) {
    if (result) {
      this.router.navigate(["/login"]);
    }
  }

  handleError(error: any) {

  }
}
