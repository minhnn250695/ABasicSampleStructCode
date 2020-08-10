import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// modules
import { ThirdPartyRoutingModule } from './third-party-routing.module';
import { CommonViewModule } from '../common-view.module';
import { MaterialDefModule } from './../common/modules/material.module';

// service
import { ThirdPartyService } from './third-party.service';

// components
import { ThirdPartyComponent } from './third-party.component';
import { ThirdPartyLandingComponent } from './third-party-landing/third-party-landing.component';
import { ThirdPartyHeaderComponent } from './third-party-header/third-party-header.component';
import { SftpSettingsComponent } from './settings/sftp-settings/sftp-settings.component';
import { NetwealthComponent } from './settings/sftp-settings/netwealth/netwealth-settings.component';
import { WebServiceSettingsComponent } from './settings/web-service-settings/web-service-settings.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CommonViewModule,
        MaterialDefModule,
        ThirdPartyRoutingModule,
    ],
    declarations: [
        ThirdPartyComponent,
        ThirdPartyLandingComponent,
        ThirdPartyHeaderComponent,
        SftpSettingsComponent,
        NetwealthComponent,
        WebServiceSettingsComponent,
    ],
    exports: [
        ThirdPartyComponent,
        ThirdPartyLandingComponent,
        ThirdPartyHeaderComponent,
        NetwealthComponent,
        SftpSettingsComponent,
    ],
    providers: [
        ThirdPartyService,
    ]
})
export class ThirdPartyModule { }
