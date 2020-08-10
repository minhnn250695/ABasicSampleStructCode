import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// main
import { ClientInsuranceComponent } from './client-insurance.component';
import { InsuranceOutcomeComponent } from './insurance-outcome/insurance-outcome.component';
import { InsuranceOverViewComponent } from './insurance-overview/insurance-overview.component';

const childRouters: Routes = [
  {
    path: '',
    component: InsuranceOverViewComponent
  },
];
const router: Routes = [
  {
    path: '',
    component: ClientInsuranceComponent,
    children: childRouters
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(router),
  ],
  declarations: [],
  exports: [RouterModule]
})
export class ClientAssetRoutingModule { }
