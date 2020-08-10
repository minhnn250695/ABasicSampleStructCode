import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiConfigInterceptor } from '../common/api/api-config.interceptor';

// component
import { LandingComponent } from './landing.component';
// module
import { AdminViewModule } from './admin-view/admin-view.module';
// import { ClientViewModule } from './client-view/client-view.module';
import { LandingRoutingModule } from './landing-routing.module';
import { CommonViewModule } from '../common-view.module';
import { LandingService } from './landing.service';
import { OnBoardingService } from '../on-boarding/on-boarding.service';
@NgModule({
    declarations: [
        LandingComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        LandingRoutingModule,
        AdminViewModule,
        CommonViewModule
    ],
    providers: [
        { // TODO
            provide: HTTP_INTERCEPTORS,
            useClass: ApiConfigInterceptor,
            multi: true
        },
        LandingService,
        OnBoardingService
    ],
    exports: [
        LandingComponent
    ]
})

export class LandingModule { }