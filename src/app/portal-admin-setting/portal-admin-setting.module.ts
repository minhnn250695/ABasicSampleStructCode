import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonViewModule } from '../common-view.module';
import { PortalAdminSettingComponent } from './portal-admin-setting.component';
import { RouterModule, Routes } from '@angular/router';
import { AccountService } from '../account-info/account.service';
import { RevenueImportService } from './portal-admin-setting.service';

const portalAdminRoutes: Routes = [
    { path: '', component: PortalAdminSettingComponent }
]

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CommonViewModule,
        RouterModule.forChild(
            portalAdminRoutes
        ),
    ],
    declarations: [
        PortalAdminSettingComponent
    ],
    providers: [
        AccountService,
        RevenueImportService
    ]
})
export class PortalAdminSettingModule {
}