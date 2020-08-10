import { NgModule } from "@angular/core";
import { MaterialDefModule } from "../common/modules/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CommonViewModule } from "../common-view.module";
import { LifeRiskRoutingModule } from "./life-risk-routing.module";

import { TooltipModule } from 'ngx-tooltip';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { LifeRiskComponent } from './life-risk.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LifeRiskRoutingModule,
    CommonViewModule,
    MaterialDefModule,
    TooltipModule,
    InfiniteScrollModule, // using for scroll down each section 

  ],
  declarations: [
    LifeRiskComponent,
  ],
  providers: [ ]
})
export class LifeRiskModule {
}
