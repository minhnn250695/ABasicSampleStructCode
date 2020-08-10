import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { ImportProcessStatusComponent } from './import-process-status.component';

const childRouters: Routes = [];

const routes: Routes = [
  {
    path: "",
    component: ImportProcessStatusComponent,
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
export class ImportRoutingModule { }