import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ClientViewSharedModule } from "../client-view/client-view-shared.module";
import { CommonViewModule } from "../common-view.module";
import { MaterialDefModule } from "../common/modules/material.module";
// components
import { AccountInfoComponent } from "./account-info.component";
// modules
import { AccountRoutingModule } from "./account-routing.module";
import { AccountService } from "./account.service";

@NgModule({
  imports: [
    CommonModule,
    AccountRoutingModule,
    CommonViewModule,
    MaterialDefModule,
    ClientViewSharedModule,
    FormsModule,
  ],
  declarations: [
    AccountInfoComponent,
  ],
  providers: [AccountService],
})
export class AccountInfoModule { }
