import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// component
import { GUARDS, MasterGuard } from '../common/guards';
import { DataFeedsHomeComponent } from './data-feeds-home/data-feed-home.component';
import { DataFeedsComponent } from './data-feeds.component';
import { DesktopBrokerManualMatchComponent } from './manual-match/desktop-broker-manual-match/desktop-broker-manual-match.component';
import { Hub24ManualMatchComponent } from './manual-match/Hub24-manual-match/hub24-manual-match.component';
import { MacquarieManualMatchComponent } from './manual-match/Macquarie-manual-match/macquarie-manual-match.component';
import { ClientAssetManualMatchComponent } from './manual-match/MnS-client-asset-manual-match/client-asset-manual-match.component';
import { NetwealthManualMatchComponent } from './manual-match/Netwealth-manual-match/netwealth-manual-match.component';
import { PersonalManualMatchComponent } from './manual-match/Tal-personal-manual-match/personal-manual-match.component';
import { ClassManualMatchComponent } from "./manual-match/Class-manual-match/class-manual-match.component";

const childRouters: Routes = [
  {
    path: "",
    redirectTo: "home-feeds",
  },
  {
    path: 'home-feeds',
    component: DataFeedsHomeComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard],
    },
  },
  // {
  //   path: 'import-file',
  //   component: ImportFileComponent,
  //   canActivate: [MasterGuard],
  //   data: {
  //     guards: [GUARDS.LoginGuard],
  //   },
  // },
  // {
  //   path: 'manual-import',
  //   component: ManualMatchingFeedsComponent,
  //   canActivate: [MasterGuard],
  //   data: {
  //     guards: [GUARDS.LoginGuard],
  //   },
  // },
  { // Tal
    path: 'personal-insurance',
    component: PersonalManualMatchComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard],
    },
  },
  {// Money Soft client
    path: 'client',
    // component: ClientManualMatchComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard],
    },
  },
  {// Money Soft client asset
    path: 'client-asset',
    component: ClientAssetManualMatchComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard],
    },
  },
  {
    path: 'hub24',
    component: Hub24ManualMatchComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard],
    },
  },
  {
    path: 'macquarie',
    component: MacquarieManualMatchComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard],
    },
  },
  {
    path: 'netwealth',
    component: NetwealthManualMatchComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard],
    },
  },
  {
    path: 'desktopbroker',
    component: DesktopBrokerManualMatchComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard],
    },
  },
  {
    path: 'class',
    component: ClassManualMatchComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard],
    },
  },
];

const routes: Routes = [
  {
    path: '',
    component: DataFeedsComponent,
    children: childRouters,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [],
  exports: [
    RouterModule,
  ],
})
export class DataFeedsRoutingModule { }
