import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GUARDS, MasterGuard } from './common/guards';
import { NotFound404Component } from './common/components/not-found-404/not-found-404.component';
import { CustomPreloading } from './custom-preloading';
import { LifeRiskModule } from './life-risk/life-risk.module';


const appRoutes: Routes = [
  {
    path: '',
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: 'login',
    loadChildren: './security/security.module#SecurityModule',
    data: { preload: true }
  },
  {
    path: 'forgot-password',
    loadChildren: './security/forgot-password/forgot-password.module#ForgotPasswordModule'
  },
  {
    path: 'life-risk',
    loadChildren: () => LifeRiskModule,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsClientAdminStaffGuard]
    }
  },
  {
    path: 'landing',
    loadChildren: './landing/landing.module#LandingModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsClientAdminStaffGuard],
      preload: true
    }
  },
  {
    path: 'revenue',
    loadChildren: './revenue-import/revenue-import.module#RevenueImportModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsClientAdminStaffGuard]
    }
  },
  {
    path: 'file-import',
    loadChildren: './file-import/file-import.module#FileImportModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsClientAdminStaffGuard],
      preload: true
    }
  },
  {
    path: 'import-process-status',
    loadChildren: './import-process-status/import-process-status.module#ImportProcessStatusModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsClientAdminStaffGuard]
    }
  },
  {
    path: 'document',
    loadChildren: './document-generator/document.module#DocumentGeneratorModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsClientAdminStaffGuard]
    }
  },
  {
    path: 'data-feeds',
    loadChildren: './data-feeds/data-feeds.module#DataFeedsModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsClientAdminStaffGuard],
      preload: true
    }
  },
  {
    path: 'portal-admin-setting',
    loadChildren: './portal-admin-setting/portal-admin-setting.module#PortalAdminSettingModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsClientAdminStaffGuard]
    }
  },
  {
    path: 'client-view',
    loadChildren: './client-view/client-view.module#ClientViewModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsPortalBusinessGuard],
      preload: true
    }
  },
  {
    path: 'on-boarding',
    loadChildren: './on-boarding/on-boarding.module#OnBoardingModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsPortalBusinessGuard]
    }
  },
  {
    path: 'mobile-on-boarding',
    loadChildren: './mobile-on-boarding/mobile-on-boarding.module#MobileOnBoardingModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsPortalBusinessGuard]
    }
  },
  {
    path: 'client-list',
    loadChildren: './client-list/client-list.module#ClientListModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsPortalBusinessGuard]
    }
  },
  {
    path: 'third-party',
    loadChildren: './third-party/third-party.module#ThirdPartyModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsClientAdminStaffGuard]
    }
  },
  {
    path: 'admin',
    loadChildren: './admin-management/admin-management.module#AdminManagementModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsFinpalAdminGuard]
    }
  },
  {
    path: 'setup',
    loadChildren: './setup/setup.module#SetupModule',
    canActivate: [MasterGuard],
    data: {
      guards: []
    }
  },
  {
    path: 'users',
    loadChildren: './user/user.module#UserModule',
  },
  {
    path: 'system-details',
    loadChildren: './system-details/system-details.module#SystemDetailsModule',
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard, GUARDS.IsClientAdminGuard]
    }
  },
  { path: 'page-not-found', component: NotFound404Component },
  { path: '**', redirectTo: '/page-not-found' }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false, useHash: true, preloadingStrategy: CustomPreloading },
    ),
  ],
  exports: [
    RouterModule
  ],
  providers: [CustomPreloading]
})
export class AppRoutingModule { }
