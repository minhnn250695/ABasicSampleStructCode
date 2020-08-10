import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from "ngx-tooltip";

// module
import { CommonViewModule } from '../../common-view.module';
import { MaterialDefModule } from '../../common/modules/material.module';
import { ClientViewSharedModule } from '../client-view-shared.module';
import { ClientDebtRoutingModule } from "./client-debt-routing.module";
// services
import { DocStorageService } from '../client-doc-storage/doc-storage.service';
// components
import { ClientDebtComponent } from './client-debt.component';
import { DebtsOverviewComponent } from './debts-overview/debts-overview.component';
import { DebtsHistoryComponent} from './debts-history/debts-history.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule, CommonViewModule, MaterialDefModule,
    ClientViewSharedModule, ClientDebtRoutingModule, TooltipModule
  ],
  declarations: [ ClientDebtComponent, DebtsOverviewComponent, DebtsHistoryComponent],
  exports: [ ClientDebtComponent],
  providers: [ DocStorageService ]
})
export class ClientDebtModule { }
