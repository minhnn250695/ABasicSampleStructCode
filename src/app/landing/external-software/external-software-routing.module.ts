import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { ExternalSoftwareComponent } from "./external-software.component";
import { GUARDS, MasterGuard } from "../../common/guards";
import { ExternalSoftwareLandingComponent } from "./external-software-landing/external-software-landing.component";

const childRouters: Routes = [
  {
    path: "",
    redirectTo: "landing",
  },
  {
    path: "landing",
    component: ExternalSoftwareLandingComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  }
];

const routes: Routes = [
  {
    path: "",
    component: ExternalSoftwareComponent,
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
export class ExternalSoftwareRoutingModule { }