import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdviceStrategyDetailsComponent } from "./advice-strategy-details/advice-strategy-details.component";

import { GUARDS, MasterGuard } from '../../common/guards';
// main
import { AdviceBuilderComponent } from './advice-builder.component';
import { CashflowDetailsComponent, InsuranceProjectionDetailsComponent, AssetProjectionsDetailComponent } from '../common';
import { DebtProjectionDetailsComponent } from '../common/debt-projection-details/debt-projection-details.component';
import { CompareStrategiesComponent } from './compare-strategies/compare-strategies.component';


const routes: Routes = [
  {
      path: '',
      component: AdviceBuilderComponent,
  },
  {
    path: 'strategy-details',
    component: AdviceStrategyDetailsComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard,  GUARDS.IsClientAdminStaffGuard]
    }
  },
  {
    path: 'cash-flow-details',
    component: CashflowDetailsComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard,  GUARDS.IsClientAdminStaffGuard]
    }
  },
  {
    path: 'debt-projection-details',
    component: DebtProjectionDetailsComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard,  GUARDS.IsClientAdminStaffGuard]
    }
  },
  {
    path: 'insurance-projection-details',
    component: InsuranceProjectionDetailsComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard,  GUARDS.IsClientAdminStaffGuard]
    }
  },
  {
    path: 'asset-projections-detail',
    component: AssetProjectionsDetailComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard,  GUARDS.IsClientAdminStaffGuard]
    }
  },
  {
    path: 'compare-strategies',
    component: CompareStrategiesComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard,  GUARDS.IsClientAdminStaffGuard]
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [],
  exports: [ RouterModule ]
})
export class AdviceBuilderRoutingModule { }
