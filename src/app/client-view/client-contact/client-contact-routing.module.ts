import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// components
// import { ClientContactComponent } from './client-contact.component';


// const childRouters : Routes = [
//   {
//     path: "",
//     redirectTo: "overview",
//   },
//   {
//     path: 'overview',
//     component: AssetOverViewComponent
//   },
//   {
//     path: 'history',
//     component: AssetHistoryComponent
//   },
//   {
//     path: 'projections',
//     component: AssetProjectionsComponent
//   }
// ];

// main
import { ClientContactComponent } from './client-contact.component';
const routes: Routes = [
  {
      path: '',
      component: ClientContactComponent,
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [],
  exports: [ RouterModule ]
})
export class ClientContactRoutingModule { }
