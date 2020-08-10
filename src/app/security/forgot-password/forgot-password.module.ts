import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ForgotPasswordRoutingModule } from './forgot-password-routing.module';
import { CommonViewModule } from '../../common-view.module';

import { ForgotPasswordComponent } from './forgot-password.component';
import { SubmitEmailComponent } from './submit-email/submit-email.component';
import { ResetLinkComponent } from './reset-link/reset-link.component';
import { ResetSucessComponent } from './reset-sucess/reset-sucess.component';
import { ResetNewPassComponent } from './reset-new-pass/reset-new-pass.component';

@NgModule({
  imports: [
    CommonModule,
    ForgotPasswordRoutingModule,
    FormsModule,
    CommonViewModule
  ],
  exports: [
    ForgotPasswordComponent
  ],
  declarations: [ForgotPasswordComponent, SubmitEmailComponent, ResetLinkComponent, ResetSucessComponent, ResetNewPassComponent],
  providers: []
})
export class ForgotPasswordModule { }
