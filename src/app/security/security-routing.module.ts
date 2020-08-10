import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


import { LoginContainerComponent } from './login-container/login-container.component';
import { InvalidUserComponent } from './errors/invalid-user/invalid-user.component';
import { InvalidUserPermissionsComponent } from './errors/invalid-user-permissions/invalid-user-permissions.component';
import { InvalidSetupUserComponent } from './errors/invalid-setup-user/invalid-setup-user.component';
import { InvalidCompany } from './errors/invalid-company/invalid-company.component';

const routes: Routes = [
    {
        path: '',
        component: LoginContainerComponent,
        data: { preload: true },
    },
    {
        path: 'invalid-user',
        component: InvalidUserComponent,
        data: { preload: true },
    },
    {
        path: 'invalid-company',
        component: InvalidCompany,
        data: { preload: true },
    },
    {
        path: 'invalid-setup-user',
        component: InvalidSetupUserComponent,
        data: { preload: true },
    },
    {
        path: 'invalid-user-permissions',
        component: InvalidUserPermissionsComponent,
        data: { preload: true },
    }
];
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
    declarations: [
        InvalidUserComponent,
        InvalidUserPermissionsComponent,
        InvalidCompany,
        InvalidSetupUserComponent]
})
export class SecurityRoutingModule { }
