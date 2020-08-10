import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { FileImportComponent } from "./file-import.component";
import { GUARDS, MasterGuard } from "../common/guards";
import { UploadFileComponent } from "./upload-file/upload-file.component";
import { AutoMatchDataComponent } from "./auto-match-data/auto-match-data.component";
import { MatchCompletedComponent } from "./match-completed/match-completed.component";
import { MatchFieldsNameComponent } from "./match-fields-name/match-fields-name.component";
import { ManualMatchDataComponent } from "./manual-match-data/manual-match-data.component";

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
    path: "auto-match-data",
    component: AutoMatchDataComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: "match-fields-name",
    component: MatchFieldsNameComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: "manual-match-data",
    component: ManualMatchDataComponent,
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
    component: FileImportComponent,
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
export class FileRoutingModule { }