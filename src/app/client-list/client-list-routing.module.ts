import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

// components
import { ClientListComponent } from './client-list.component';
import { ClientAccessComponent } from './client-access/client-access.component';
import { ClientNewComponent } from './client-new/client-new.component';
import { MasterGuard, GUARDS } from '../common/guards';

const childRouters: Routes = [
  {
    path: "",
    redirectTo: "access",
  },
  {
    path: "access",
    component: ClientAccessComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: "new",
    component: ClientNewComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
];

const routes: Routes = [
  {
    path: '',
    component: ClientListComponent,
    children: childRouters
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class ClientListRoutingModule { }
