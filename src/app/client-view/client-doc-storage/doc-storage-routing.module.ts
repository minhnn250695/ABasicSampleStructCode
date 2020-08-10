import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// components
import { DocumentStorageComponent } from './client-doc-storage.component';
import { DocsOverviewComponent } from './docs-overview/docs-overview.component';

const childRouters: Routes = [
  {
    path: "",
    redirectTo: "overview",
  },
  {
    path: "overview",
    component: DocsOverviewComponent,
  },
];

const router: Routes = [
  {
      path: '',
      component: DocumentStorageComponent,
      children: childRouters
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(router),
  ],
  exports: [ RouterModule ]
})
export class DocStorageRoutingModule { }
