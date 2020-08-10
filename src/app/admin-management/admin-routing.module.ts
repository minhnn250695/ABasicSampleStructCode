import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// components
import { GUARDS, MasterGuard } from '../common/guards';
import { AdminInfoComponent } from './admin-info/admin-info.component';
import { AdminLandingComponent } from './admin-landing/admin-landing.component';
import { AdminManagementComponent } from './admin-management.component';
import { AdminStaffReportComponent } from './admin-staff-report/admin-staff-report.component';
import { CustomerLicenceComponent } from './customer-licence/customer-licence.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerSummaryComponent } from './customer-summary/customer-summary.component';


const childRouters: Routes = [
  {
    path: "",
    redirectTo: "landing",
  },
  {
    path: "landing",
    component: AdminLandingComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'customer-list',
    component: CustomerListComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'customer-summary',
    component: CustomerSummaryComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'customer-licence',
    component: CustomerLicenceComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'staff-report',
    component: AdminStaffReportComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'admin-info',
    component: AdminInfoComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  }
];

const routes: Routes = [
  {
    path: '',
    component: AdminManagementComponent,
    children: childRouters
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AdminRoutingModule { }
