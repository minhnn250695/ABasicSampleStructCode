import { Component, ComponentFactoryResolver, OnDestroy, OnInit } from '@angular/core';

// components
import { MobileDetectComponent } from '../../common/components/mobile-detect/mobile-detect.component';
import { LoginComponent } from './login-desk/login.component';
import { LoginMobileComponent } from './login-mobile/login-mobile.component';

declare var $: any;

@Component({
  selector: 'app-login-container',
  templateUrl: './login-container.component.html',
  styleUrls: ['./login-container.component.css']
})
export class LoginContainerComponent extends MobileDetectComponent implements OnInit, OnDestroy {

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
   }

  ngOnInit() {
    super.ngOnInit();
    $('body').addClass('full');
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    $('body').removeClass('full');
  }

  mobileComponent() {
    return LoginMobileComponent;
  }

  deskComponent() {
    return LoginComponent;
  }

}
