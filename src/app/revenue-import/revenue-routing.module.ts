import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";

import { RevenueImportComponent } from "./revenue-import.component";
import { UploadFileComponent } from "./main/upload-file/upload-file.component";
import { CheckMatchProgressComponent } from "./main/check-match-progress/check-match-progress.component";
import { RevenueMatchDataComponent } from "./main/revenue-match-data/revenue-match-data.component";
import { MatchCompletedComponent } from "./main/match-completed/match-completed.component";
import { GUARDS, MasterGuard } from "../common/guards";

const childRouters: Routes = [
  {
    path: "",
    redirectTo: "upload",
  },
  {
    path: "upload",
    component: UploadFileComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: "check-progress",
    component: CheckMatchProgressComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: "match-data",
    component: RevenueMatchDataComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: "match-completed",
    component: MatchCompletedComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  }

];

const routes: Routes = [
  {
    path: "",
    component: RevenueImportComponent,
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
export class RevenueRoutingModule { }
