import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// modules
import { ClientListRoutingModule } from './client-list-routing.module';
import { CommonViewModule } from '../common-view.module';
import { MaterialDefModule } from '../common/modules/material.module';
// import { ClientViewSharedModule } from '../client-view-shared.module';

// services
import { ClientListService } from './client-list.service'
// components
import { ClientListComponent } from './client-list.component';
import { ClientAccessComponent } from './client-access/client-access.component';
import { ClientFilterComponent } from './client-filter/client-filter.component';
import { ClientActionComponent } from './client-access/client-action/client-action.component';
import { ClientNewComponent } from './client-new/client-new.component';

@NgModule({
  imports: [
    CommonModule,
    ClientListRoutingModule,
    CommonViewModule,
    MaterialDefModule,
    // ClientViewSharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [ClientListComponent, ClientAccessComponent, ClientFilterComponent, ClientActionComponent, ClientNewComponent],
  providers: [ ClientListService ]
})
export class ClientListModule { }
