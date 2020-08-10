import { Component, OnInit } from '@angular/core';
import { BaseComponentComponent } from '../../common/components/base-component';

declare var $: any;

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent extends BaseComponentComponent implements OnInit {

  isMobile: boolean;
  constructor() {
    super();
  }

  ngOnInit() {
    $('body').addClass('full');
    this.checkUsingMobile();
  }

}
