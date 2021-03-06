import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

// main
import { AccountInfoComponent } from "./account-info.component";

const routes: Routes = [
  {
      path: "",
      component: AccountInfoComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [],
  exports: [ RouterModule ],
})
export class AccountRoutingModule { }
