import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GUARDS, MasterGuard } from '../common/guards';

import { LandingComponent } from './landing.component';


const routes: Routes = [
    {
        path: 'external-software',
        loadChildren: './external-software/external-software.module#ExternalSoftwareModule',
        canActivate: [MasterGuard],
        data: {
            guards: [GUARDS.LoginGuard, GUARDS.IsClientAdminStaffGuard],
            preload: true
        }
    },
    {
        path: '',
        component: LandingComponent,
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
    ],
    exports: [RouterModule],
    declarations: []
})
export class LandingRoutingModule { }
