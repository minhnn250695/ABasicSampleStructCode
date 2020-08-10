import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MobileLandingComponent } from './mobile-landing.component';

const routes: Routes = [
  {
    path: '',
    component: MobileLandingComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MobileLandingRoutingModule { }
