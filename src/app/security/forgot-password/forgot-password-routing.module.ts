import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password.component';
import { SubmitEmailComponent } from './submit-email/submit-email.component';
import { ResetLinkComponent } from './reset-link/reset-link.component';
import { ResetSucessComponent } from './reset-sucess/reset-sucess.component';
import { ResetNewPassComponent } from './reset-new-pass/reset-new-pass.component';

const childrenRoutes: Routes = [
  {
    path: '',
    redirectTo: 'check-email'
  },
  {
    path: 'check-email',
    component: SubmitEmailComponent
  },
  {
    path: 'send-reset-link',
    component: ResetLinkComponent
  },
  {
    path: 'reset-password/:token/companyId/:companyId',
    component: ResetNewPassComponent
  },
  {
    path: 'reset-successed',
    component: ResetSucessComponent
  }
]

const routes: Routes = [
  {
    path: '',
    component: ForgotPasswordComponent,
    children: childrenRoutes
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForgotPasswordRoutingModule { }
