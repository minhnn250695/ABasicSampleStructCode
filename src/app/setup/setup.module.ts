import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// modules
import { SetupRoutingModule } from './setup-routing.module';
import { CommonViewModule } from '../common-view.module';
import { MaterialDefModule } from './../common/modules/material.module';

// service
import { SetupService } from './setup.service';
// components
import { SetupComponent } from './setup.component';
import { SetupLandingComponent } from './landing/setup-landing.component';
import { SetupStep1Component } from './step1/setup-step1.component';
import { SetupStep2Component } from './step2/setup-step2.component';
import { SetupStep3Component } from './step3/setup-step3.component';
import { SetupCancelComponent } from './cancel/setup-cancel.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CommonViewModule,
        MaterialDefModule,
        SetupRoutingModule,
    ],
    declarations: [
        SetupComponent,
        SetupLandingComponent,
        SetupStep1Component,
        SetupStep2Component,
        SetupStep3Component,
        SetupCancelComponent
    ],
    exports: [
        SetupComponent,
        SetupLandingComponent,
        SetupStep1Component,
        SetupStep2Component,
        SetupStep3Component,
        SetupCancelComponent
    ],
    providers: [SetupService]
})
export class SetupModule { }
