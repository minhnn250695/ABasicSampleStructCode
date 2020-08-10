import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";

import { LoginComponent } from './login-container/login-desk/login.component';
// import { LoadingDialog } from './../common/dialog/loading-dialog/loading-dialog.component';
import { SecurityRoutingModule } from './security-routing.module';
import { CommonViewModule } from '../common-view.module';
import { ResponsiveModule } from 'ng2-responsive';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiConfigInterceptor } from './../common/api/api-config.interceptor';
import { LoginContainerComponent } from './login-container/login-container.component';
import { LoginMobileComponent } from './login-container/login-mobile/login-mobile.component';

@NgModule({
    declarations: [
        LoginComponent,
        LoginContainerComponent,
        LoginMobileComponent
        // LoadingDialog,
    ],
    imports: [
        HttpClientModule,
        FormsModule,
        CommonModule,
        SecurityRoutingModule,
        CommonViewModule,
        ResponsiveModule
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ApiConfigInterceptor,
            multi: true
        }
    ],
    exports: [
        LoginComponent
    ],
    entryComponents: [
        LoginComponent,
        LoginMobileComponent
    ]
})

export class SecurityModule {}