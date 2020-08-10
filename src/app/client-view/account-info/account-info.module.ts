import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountInfoComponent } from './account-info.component';
import { AccountInfoRoutingModule } from './account-info-routing.module';
import { FormsModule } from '@angular/forms';
import { CommonViewModule } from '../../common-view.module';
import { MaterialDefModule } from '../../common/modules/material.module';
import { ClientViewSharedModule } from '../client-view-shared.module';
import { TooltipModule } from 'ngx-tooltip';
import { ClientViewService } from '../client-view.service';
import { AccountInfoService } from './account-info.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CommonViewModule,
    MaterialDefModule,
    ClientViewSharedModule,
    AccountInfoRoutingModule,
    TooltipModule
  ],
  declarations: [AccountInfoComponent],
  providers: [AccountInfoService, ClientViewService]
})
export class AccountInfoModule { }
