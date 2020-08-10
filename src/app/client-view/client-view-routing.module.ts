import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GUARDS, MasterGuard } from '../common/guards';
// children
import { RetirementReportComponent } from './client-retirement-report/retirement-report.component';
import { ClientViewComponent } from './client-view.component';
const childRouters: Routes = [
  {
    path: "",
    redirectTo: "landing",
  },
  {
    path: 'landing',
    loadChildren: './client-landing/client-landing.module#ClientLandingModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'cash-flow-detail',
    loadChildren: './cash-flow/cash-flow.module#CashFlowModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'personal',
    loadChildren: './client-personal/client-personal.module#ClientPersonalModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'protection',
    loadChildren: './client-protection/personal-protection.module#PersonalProtectionModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'insurance',
    loadChildren: './client-insurance/client-insurance.module#ClientInsuranceModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'asset',
    loadChildren: './client-asset/client-asset.module#ClientAssetModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'debt',
    loadChildren: './client-debt/client-debt.module#ClientDebtModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'doc-storage',
    loadChildren: './client-doc-storage/doc-storage.module#DocStorageModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'contact',
    loadChildren: './client-contact/client-contact.module#ClientContactModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'advice-builder',
    loadChildren: './advice-builder/advice-builder.module#AdviceBuilderModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsClientAdminStaffGuard]
    }
  },
  {
    path: 'account',
    loadChildren: './account-info/account-info.module#AccountInfoModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsClientGuard]
    }
  },
  {
    path: 'retirement-report',
    component: RetirementReportComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  }
];

// main
const routes: Routes = [
  {
    path: '',
    component: ClientViewComponent,
    data: { preload: true },
    children: childRouters
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [],
  exports: [RouterModule]
})
export class ClientViewRoutingModule { }
