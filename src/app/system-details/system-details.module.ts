import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// modules
import { SystemDetailsRoutingModule } from './system-details-routing.module';
import { CommonViewModule } from '../common-view.module';
import { MaterialDefModule } from '../common/modules/material.module';
import { SetupModule } from '../setup/setup.module';


// services
import { SystemDetailsService } from './system-details.service';
import { SetupService } from '../setup/setup.service';

// components
import { SystemDetailsComponent } from './system-details.component';

@NgModule({
    imports: [
        CommonModule,
        SystemDetailsRoutingModule,
        CommonViewModule,
        MaterialDefModule,
        FormsModule,
        SetupModule
    ],
    declarations: [
        SystemDetailsComponent
    ],
    providers: [SystemDetailsService, SetupService]
})
export class SystemDetailsModule { }
