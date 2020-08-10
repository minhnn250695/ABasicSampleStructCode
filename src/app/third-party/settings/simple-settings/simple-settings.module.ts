import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// module
import { SimpleSettingsRoutingModule } from './simple-settings-routing.module';

// components
import { SimpleSettingsComponent } from './simple-settings.component';
import { CafeXComponent } from './cafex/cafex-settings.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,      
        SimpleSettingsRoutingModule
    ],
    declarations: [
        SimpleSettingsComponent,
        CafeXComponent
    ],
    exports:[],
    providers:[]
})

export class SimpleSettingsModule {}