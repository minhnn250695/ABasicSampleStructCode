import { CommonModule } from "@angular/common";
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LOCALE_ID, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { UIRouterModule } from '@uirouter/angular';
import { Ng2Webstorage } from 'ngx-webstorage';

// module
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { CommonUsedModule } from './common-used.module';
import { CommonViewModule } from './common-view.module';
import { ApiConfigInterceptor } from './common/api/api-config.interceptor';
import { MasterGuard } from './common/guards';
import { LoaderModule } from './common/modules/loader';
import { MaterialDefModule } from './common/modules/material.module';

// Components
import { AppComponent } from './app.component';

// Services
import { HeaderService } from './common/components/header/header.service';
import { SpinnerLoadingService } from './common/components/spinner-loading/spinner-loading.service';
import { LoadingSpinnerService } from './common/components/loading-spinner/loading-spinner.service';

import { ConfirmationDialogService } from './common/dialog/confirmation-dialog/confirmation-dialog.service';
import { LoadingService } from './common/dialog/loading-dialog/loading-dialog.service';
import { LoginGuardService } from './login-guard.service';
import { ImportProcessStatusService } from './import-process-status/import-process-status.service';
@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        HttpModule,
        FormsModule,
        Ng2Webstorage,
        AppRoutingModule,
        MaterialDefModule,
        CommonViewModule,
        CommonUsedModule.forRoot(),
        LoaderModule.forRoot(),
    ],
    exports: [
        AppComponent,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ApiConfigInterceptor,
            multi: true,
        },
        { provide: LOCALE_ID, useValue: 'en-AU' },
        MasterGuard,
        LoginGuardService,
        ConfirmationDialogService,
        HeaderService,
        SpinnerLoadingService,
        LoadingSpinnerService,
        LoadingService,
        ImportProcessStatusService
    ],
    // schemas: [ NO_ERRORS_SCHEMA ],
    bootstrap: [AppComponent]
})

export class AppModule { }