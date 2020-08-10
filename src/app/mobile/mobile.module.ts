import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// modules
import { CommonViewModule } from '../common-view.module';
import { MobileRoutingModule } from './mobile-routing.module';
// components
import { MobileComponent } from './mobile.component';

@NgModule({
  imports: [
    CommonModule,
    CommonViewModule,
    MobileRoutingModule
  ],
  declarations: [MobileComponent,]
})
export class MobileModule { }
