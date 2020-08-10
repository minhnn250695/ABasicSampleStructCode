import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SettingsComponent } from './settings.component';
import { ThirdPartyConnectionsComponent } from './third-party-connections/third-party-connections.component';
import { ThirdPartyHomeComponent } from './third-party-home/third-party-home.component';
import { CommonViewModule } from '../common-view.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { MaterialDefModule } from './../common/modules/material.module';

@NgModule({
    imports: [
        CommonModule,
        CommonViewModule,
        SettingsRoutingModule,
        MaterialDefModule,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        SettingsComponent,
        ThirdPartyConnectionsComponent,
        ThirdPartyHomeComponent
    ],
    exports: [
        SettingsComponent,
        ThirdPartyConnectionsComponent,
        ThirdPartyHomeComponent
    ],
    providers: []
})
export class SettingsModule { }
