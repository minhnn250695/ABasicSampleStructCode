import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// services
import { CommonViewModule } from '../../common-view.module';

import { MaterialDefModule } from '../../common/modules/material.module';
import { ClientAssetModule } from '../client-asset/client-asset.module';
import { ClientDebtModule } from '../client-debt/client-debt.module';
// import { NguUtilityModule } from 'ngu-utility/dist';
import { ClientViewSharedModule } from '../client-view-shared.module';
import { ClientLandingRoutingModule } from './client-landing-routing.module';

// components
import { ThirdPartyService } from '../../third-party/third-party.service';
import { ClientCashFlowComponent } from './client-cash-flow/client-cash-flow.component';
import { ClientFamilyMembersComponent } from './client-family-members/client-family-members.component';
import { MemberCardComponent } from './client-family-members/member-card/member-card.component';
import { ClientLandingComponent } from './client-landing.component';
import { ClientRetirementComponent } from './client-retirement/client-retirement.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    CommonViewModule,
    ClientLandingRoutingModule,
    MaterialDefModule,
    ClientViewSharedModule,
    // NguUtilityModule,
    // for asset/debt projection
    ClientDebtModule,
    ClientAssetModule,
    FormsModule
  ],
  declarations: [ClientLandingComponent,
    ClientFamilyMembersComponent,
    MemberCardComponent,
    ClientCashFlowComponent,
    ClientRetirementComponent,
  ],
  exports: [ClientLandingComponent],
  providers: [ThirdPartyService]
})
export class ClientLandingModule { }
