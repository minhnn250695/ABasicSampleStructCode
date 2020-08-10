import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


// main
import { SystemDetailsComponent } from './system-details.component';
const routes: Routes = [
  {
      path: '',
      component: SystemDetailsComponent,
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
export class SystemDetailsRoutingModule { }
