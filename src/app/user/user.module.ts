import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// modules
import { CommonViewModule } from '../common-view.module';
import { UserRoutingModule } from './user-routing.module';
// components
import { UserComponent } from './user.component';
import { UserRegisterComponent } from './user-register/user-register.component';
import { SetSucessComponent } from './set-sucess/set-success.component';
// services
import { UserService } from './user.service';

@NgModule({
  imports: [
    CommonModule,
    CommonViewModule,
    UserRoutingModule,
    FormsModule
  ],
  declarations: [UserComponent, UserRegisterComponent, SetSucessComponent],
  providers: [UserService]
})
export class UserModule { }
