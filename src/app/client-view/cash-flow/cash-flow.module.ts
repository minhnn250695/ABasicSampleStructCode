import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// module
import { CashFlowRoutingModule } from './cash-flow-routing.module';
import { CommonViewModule } from '../../common-view.module';
import { MaterialDefModule } from '../../common/modules/material.module';
import { ClientViewSharedModule } from '../client-view-shared.module';

import { CashFlowComponent } from './cash-flow.component';
// import { ClientHeaderComponent } from '../common/header/client-header.component';


@NgModule({
  imports: [
    CommonModule,
    CashFlowRoutingModule,
    CommonViewModule,
    MaterialDefModule,
    ClientViewSharedModule,
    // NguUtilityModule,
  ],

  declarations: [CashFlowComponent],
  providers: []
})
export class CashFlowModule { }
