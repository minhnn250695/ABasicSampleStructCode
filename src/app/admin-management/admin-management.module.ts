import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// modules
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderService } from '../common/modules/loader';
import { LoaderModule } from '../common/modules/loader/loader.module';
import { MaterialDefModule } from '../common/modules/material.module';
import { CommonViewModule } from './../common-view.module';
import { AdminRouterService } from './admin-router.service';
import { AdminRoutingModule } from './admin-routing.module';
// services
import { AdminService } from './admin.service';


// components
import { TooltipModule } from 'ngx-tooltip';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { AdminInfoComponent } from './admin-info/admin-info.component';
import { AdminLandingComponent } from './admin-landing/admin-landing.component';
import { AdminManagementComponent } from './admin-management.component';
import { AdminStaffReportComponent } from './admin-staff-report/admin-staff-report.component';
import { CustomerLicenceComponent } from './customer-licence/customer-licence.component';
import { LicenceTileComponent } from './customer-licence/licence-tile/licence-tile.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerSummaryComponent } from './customer-summary/customer-summary.component';
import { LicenceStatusComponent } from './customer-summary/licence-status/licence-status.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule, MaterialDefModule,
    AdminRoutingModule,
    CommonViewModule,
    LoaderModule,
    TooltipModule
  ],
  declarations: [AdminManagementComponent,
    AdminLandingComponent,
    AdminHeaderComponent,
    CustomerListComponent,
    AdminStaffReportComponent,
    AdminInfoComponent,
    CustomerSummaryComponent,
    CustomerLicenceComponent,
    LicenceTileComponent,
    LicenceStatusComponent],
  providers: [
    AdminService,
    AdminRouterService,
    LoaderService,
  ]
})
export class AdminManagementModule { }
