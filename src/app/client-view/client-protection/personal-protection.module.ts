import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from "ngx-tooltip";

// module
import { CommonViewModule } from '../../common-view.module';
import { MaterialDefModule } from '../../common/modules/material.module';
// services
import { DocStorageService } from '../client-doc-storage/doc-storage.service';
import { ClientViewSharedModule } from '../client-view-shared.module';
// components
import { ClientProtectionComponent } from './client-protection.component';
import { InsuranceOutcomeComponent } from './insurance-outcome/insurance-outcome.component';
// import { InsuranceSummaryComponent } from './insurance-outcome/insurance-summary/insurance-summary.component';
import { PersonalOverviewTileComponent } from './personal-overview-tile/personal-overview-tile.component';
import { PersonalOverviewComponent } from './personal-overview/personal-overview.component';
import { PersonalProtectionRoutingModule } from './personal-protection-routing.module';
import { PolicyDetailsV2Component } from './policy-details-v2/policy-details-v2.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CommonViewModule,
    MaterialDefModule,
    ClientViewSharedModule,
    PersonalProtectionRoutingModule,
    TooltipModule
  ],
  declarations: [PersonalOverviewComponent, ClientProtectionComponent, PersonalOverviewTileComponent,
    InsuranceOutcomeComponent, PolicyDetailsV2Component,
    // InsuranceSummaryComponent
  ],

  providers: [DocStorageService],
})
export class PersonalProtectionModule { }
