import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// main
import { ClientAssetComponent } from './client-asset.component';
import { AssetHistoryComponent } from './asset-history/asset-history.component';
import { AssetOverViewComponent } from './asset-overview/asset-overview.component';
const childRouters: Routes = [  
  {
    path: "",
    redirectTo: "overview",
  },
  {
    path: 'overview',
    component: AssetOverViewComponent
  },
  {
    path: 'history',
    component: AssetHistoryComponent
  }
];
const router: Routes = [
  {
    path: '',
    component: ClientAssetComponent,
    children: childRouters
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(router),
  ],
  declarations: [],
  exports: [RouterModule]
})
export class ClientAssetRoutingModule { }
