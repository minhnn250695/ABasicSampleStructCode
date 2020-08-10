import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// components
import { ThirdPartyComponent } from './third-party.component';
import { ThirdPartyLandingComponent } from './third-party-landing/third-party-landing.component';
import { SftpSettingsComponent } from './settings/sftp-settings/sftp-settings.component';
import { NetwealthComponent } from './settings/sftp-settings/netwealth/netwealth-settings.component';
import { WebServiceSettingsComponent } from './settings/web-service-settings/web-service-settings.component';
import { RestApiModule } from './settings/rest-api-settings/rest-api-settings.module';
import { SimpleSettingsModule } from './settings/simple-settings/simple-settings.module';
import { MasterGuard, GUARDS } from '../common/guards';
import { SoapSettingsModule } from './settings/soap-settings/soap-settings.module';
import { OauthSettingsModule } from './settings/oauth-settings/oauth-settings.module';

const childRouters: Routes = [
  {
    path: "",
    redirectTo: "landing",
  },
  {
    path: 'landing',
    component: ThirdPartyLandingComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  }, {
    path: "sftp-settings",
    component: SftpSettingsComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
      path: "netwealth-settings",
      component: NetwealthComponent,
      canActivate: [MasterGuard],
      data: {
          guards: [GUARDS.LoginGuard]
      }
  },
  {
    path: "web-service-settings",
    component: WebServiceSettingsComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: "rest-api-settings",
    loadChildren: () => RestApiModule,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
      path: "simple-settings",
      loadChildren: () => SimpleSettingsModule,
      canActivate: [MasterGuard],
      data: {
          guards: [GUARDS.LoginGuard]
      }
  },
  {
    path: "soap-settings",
    loadChildren: () => SoapSettingsModule,
    canActivate: [MasterGuard],
    data: {
        guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: "oauth-settings",
    loadChildren: () => OauthSettingsModule,
    canActivate: [MasterGuard],
    data: {
        guards: [GUARDS.LoginGuard]
    }
  }
];

const routes: Routes = [
  {
    path: '',
    component: ThirdPartyComponent,
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
export class ThirdPartyRoutingModule { }