import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// components
import { PersonalOverviewComponent } from './personal-overview/personal-overview.component';
import { InsuranceOutcomeComponent } from './insurance-outcome/insurance-outcome.component';
// import { PolicyDetailsComponent } from './policy-details/policy-details.component';
import { PolicyDetailsV2Component } from './policy-details-v2/policy-details-v2.component';

const childRoutes: Routes = [
  {
    path: "",
    redirectTo: "overview",
  },
  {
    path: 'overview',
    component: PersonalOverviewComponent
  },
  {
    path: 'outcome',
    component: InsuranceOutcomeComponent
  }, 
  {
    path: 'policy-details',
    component: PolicyDetailsV2Component
  }

];
  

import { ClientProtectionComponent } from './client-protection.component';
const routes: Routes = [
  {
    path: '',
    component: ClientProtectionComponent,
    children: childRoutes
  }];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [],
  exports: [ RouterModule ]
})
export class PersonalProtectionRoutingModule { }
