import { NgModule } from "@angular/core";
import { MaterialDefModule } from "../../common/modules/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CommonViewModule } from "../../common-view.module";
import { ExternalSoftwareRoutingModule } from "./external-software-routing.module";
import { ExternalSoftwareComponent } from "./external-software.component";
import { ExternalSoftwareLandingComponent } from "./external-software-landing/external-software-landing.component";

import { ExternalSoftwareService } from "./external-software.service";
import { ThirdPartyService } from '../../third-party/third-party.service';
import { TooltipModule } from 'ngx-tooltip';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExternalSoftwareRoutingModule,
    CommonViewModule,
    MaterialDefModule,
    TooltipModule,
    InfiniteScrollModule // using for scroll down each section

  ],
  declarations: [
    ExternalSoftwareComponent,
    ExternalSoftwareLandingComponent
  ],
  providers: [
    ExternalSoftwareService,
    ThirdPartyService
  ]
})
export class ExternalSoftwareModule {
}
