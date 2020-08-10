import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MobileLandingRoutingModule } from './mobile-landing-routing.module';
import { MobileLandingComponent } from './mobile-landing.component';
import { CommonViewModule } from '../common-view.module';

@NgModule({
  imports: [
    CommonModule,
    MobileLandingRoutingModule,
    CommonViewModule

  ],
  declarations: [MobileLandingComponent]
})
export class MobileLandingModule { }
