import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

//
import { CommonViewModule } from '../../common-view.module';
import { MaterialDefModule } from '../../common/modules/material.module';
// import { NguUtilityModule } from 'ngu-utility/dist';
import { ClientViewSharedModule } from '../client-view-shared.module';
// import { LoaderModule, LoaderService } from '../../common/modules/loader';
import { ClientPersonalRoutingModule } from './client-personal-routing.module';

// components
import { ClientPersonalComponent } from './client-personal.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { MobilePersonalInfoComponent } from './mobile-personal-info/mobile-personal-info.component';

@NgModule({
  imports: [
    CommonModule,
    CommonViewModule,
    MaterialDefModule,
    ClientViewSharedModule,
    // NguUtilityModule,
    // LoaderModule,
    ClientPersonalRoutingModule,
    FormsModule
  ],
  declarations: [
    ClientPersonalComponent,
    PersonalInfoComponent,
    MobilePersonalInfoComponent ],
  providers: [  ]
})
export class ClientPersonalModule { }
