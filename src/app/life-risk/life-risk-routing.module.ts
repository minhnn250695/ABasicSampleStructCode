import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { LifeRiskComponent } from './life-risk.component';

const childRouters: Routes = [];

const routes: Routes = [
  {
    path: "",
    component: LifeRiskComponent,
    data: { preload: true },
    children: childRouters
  }
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  declarations: []
})
export class LifeRiskRoutingModule { }