import { Component, OnInit } from '@angular/core';
import { ForgotPasswordService } from '../forgot-password.service';
import { LocalStorageService } from 'ngx-webstorage';

declare var $: any;

@Component({
  selector: 'app-reset-link',
  templateUrl: './reset-link.component.html',
  styleUrls: ['./reset-link.component.css']
})
export class ResetLinkComponent implements OnInit {

  isMobile: boolean;
  email: string;
  companyLogoUrl: string;

  constructor() { }

  ngOnInit() {
    if (navigator.userAgent.includes("Mobile")) {
      this.isMobile = true;
      $('body').css('padding-top', '0');
    }
    else this.isMobile = false;
    this.email = sessionStorage.getItem('requestEmail');
  }

}
