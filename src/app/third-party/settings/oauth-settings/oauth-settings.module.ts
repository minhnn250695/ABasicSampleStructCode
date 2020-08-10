import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// module
import { OauthSettingsRoutingModule } from './oauth-settings-routing.module';

// components
import { OauthSettingsComponent } from './oauth-settings.component';
import { ClassComponent } from './class/class-settings.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,      
        OauthSettingsRoutingModule
    ],
    declarations: [
        OauthSettingsComponent,
        ClassComponent
    ],
    exports:[],
    providers:[]
})

export class OauthSettingsModule {}