import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// components
import { SetupComponent } from './setup.component';
import { SetupLandingComponent } from './landing/setup-landing.component';
import { SetupStep1Component } from './step1/setup-step1.component';
import { SetupStep2Component } from './step2/setup-step2.component';
import { SetupStep3Component } from './step3/setup-step3.component';
import { SetupCancelComponent } from './cancel/setup-cancel.component';

const childRouters: Routes = [
    {
        path: "",
        redirectTo: "landing",
    },
    {
        path: 'landing',
        component: SetupLandingComponent
    },
    {
        path: 'step1',
        component: SetupStep1Component
    },
    {
        path: 'step2',
        component: SetupStep2Component
    },
    {
        path: 'step3',
        component: SetupStep3Component
    },
    {
        path: 'cancel',
        component: SetupCancelComponent
    }
];

const routes: Routes = [
    {
        path: '',
        component: SetupComponent,
        children: childRouters
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ],
    declarations: [],
    exports: [
        RouterModule
    ]
})
export class SetupRoutingModule { }
