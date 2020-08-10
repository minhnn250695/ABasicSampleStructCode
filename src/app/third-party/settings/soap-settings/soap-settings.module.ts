import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// module
import { SoapSettingsRoutingModule } from './soap-settings-routing.module';

// components
import { SoapSettingsComponent } from './soap-settings.component';
import { Hub24Component } from './hub24/hub24-settings.component';
import { MacquariebankComponent } from './macquariebank/macquariebank.component'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,      
        SoapSettingsRoutingModule
    ],
    declarations: [
        SoapSettingsComponent,
        Hub24Component,
        MacquariebankComponent
    ],
    exports:[],
    providers:[]
})

export class SoapSettingsModule {}