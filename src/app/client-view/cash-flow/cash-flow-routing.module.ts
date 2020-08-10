import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


// main
import { CashFlowComponent } from './cash-flow.component';
const routes: Routes = [
  {
      path: '',
      component: CashFlowComponent,
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
export class CashFlowRoutingModule { }
