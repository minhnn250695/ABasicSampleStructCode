import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// module
import { ClientAssetRoutingModule } from './client-insurance-routing.module';
import { CommonViewModule } from '../../common-view.module';
import { MaterialDefModule } from '../../common/modules/material.module';
// import { NguUtilityModule } from 'ngu-utility/dist';
import { ClientViewSharedModule } from '../client-view-shared.module';
// services
import { DocStorageService } from '../client-doc-storage/doc-storage.service';
// components
import { InsuranceMemberComponent } from '../client-insurance/insurance-overview/insurance-member/insurance-member.component';
import { ClientInsuranceComponent } from './client-insurance.component';
import { InsuranceOverViewComponent } from './insurance-overview/insurance-overview.component';
import { InsuranceDetailsComponent } from './insurance-details/insurance-details.component';
import { InsuranceOutcomeComponent } from './insurance-outcome/insurance-outcome.component';
import { ChartsModule } from 'ng2-charts/ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClientAssetRoutingModule,
    CommonViewModule,
    MaterialDefModule,
    ClientViewSharedModule,
    ChartsModule
  ],
  declarations: [
    ClientInsuranceComponent,
    InsuranceDetailsComponent,
    InsuranceOverViewComponent,
    InsuranceOutcomeComponent,
    InsuranceMemberComponent,
  ],
  exports: [
    ClientInsuranceComponent,
    InsuranceDetailsComponent,
    InsuranceOverViewComponent,
    InsuranceOutcomeComponent,
    InsuranceMemberComponent,
  ],
  providers: [DocStorageService],
})
export class ClientInsuranceModule { }
