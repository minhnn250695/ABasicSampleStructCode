import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


// main
import { ClientLandingComponent } from './client-landing.component';
const routes: Routes = [
  {
      path: '',
      component: ClientLandingComponent,
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
export class ClientLandingRoutingModule { }
