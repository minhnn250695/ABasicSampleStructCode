import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// main
import { ClientPersonalComponent } from './client-personal.component';
const routes: Routes = [
  {
      path: '',
      component: ClientPersonalComponent,
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
export class ClientPersonalRoutingModule { }
