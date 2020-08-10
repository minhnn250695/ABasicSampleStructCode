import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// sub 
import { UserRegisterComponent } from './user-register/user-register.component';
import { SetSucessComponent} from './set-sucess/set-success.component';
// components
const childRouters: Routes = [
  {
    // path: "register/:token",
    path: "register/:token/companyId/:companyId",
    component: UserRegisterComponent,
  },
  {
    path: "register-success",
    component: SetSucessComponent,
  },
];
// components
import { UserComponent } from './user.component';
const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    children: childRouters
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
