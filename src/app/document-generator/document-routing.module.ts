import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// component
import { DocumentGeneratorComponent } from './document-generator.component';
import { TemplateManagerComponent } from './template-manager/template-manager.component';
import { ReportManagerComponent } from './report-manager/report-manager.component';
import { TemplateEditorComponent } from './template-editor/template-editor.component';
import { UploadTemplateComponent } from './upload-template/upload-template.component';
import { GenerateReportComponent } from './generate-report/generate-report.component';
import { MasterGuard, GUARDS } from '../common/guards';



const childRouters: Routes = [
  {
    path: "",
    redirectTo: "generate-report",
  },
  {
    path: 'template-manager',
    component: TemplateManagerComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'template-editor',
    component: TemplateEditorComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'upload-template',
    component: UploadTemplateComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'generate-report',
    component: GenerateReportComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  },
  {
    path: 'report-manager',
    component: ReportManagerComponent,
    canActivate: [MasterGuard],
    data: {
      guards: [GUARDS.LoginGuard]
    }
  }
];

const routes: Routes = [
  {
    path: '',
    component: DocumentGeneratorComponent,
    children: childRouters
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [],
  exports: [
    RouterModule
  ]
})
export class DocumentRoutingModule { }
