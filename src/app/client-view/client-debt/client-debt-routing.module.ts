import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
// components
import { ClientDebtComponent } from './client-debt.component';
import { DebtsOverviewComponent } from './debts-overview/debts-overview.component';
import { DebtsHistoryComponent } from './debts-history/debts-history.component';

const childRouters: Routes = [
  {
    path: "",
    redirectTo: "overview",
  },
  {
    path: 'overview',
    component: DebtsOverviewComponent
  },
  {
    path: 'history',
    component: DebtsHistoryComponent
  }
];

const router: Routes = [
  {
    path: '',
    component: ClientDebtComponent,
    children: childRouters
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(router),
  ],
  exports: [RouterModule]
})
export class ClientDebtRoutingModule { }
