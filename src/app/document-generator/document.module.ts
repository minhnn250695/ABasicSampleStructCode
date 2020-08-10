import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';

// module
import { CommonViewModule } from './../common-view.module';
import { MaterialDefModule } from './../common/modules/material.module';
import { DocumentRoutingModule } from './document-routing.module';

// component
import { DocumentGeneratorComponent } from './document-generator.component';
import { TemplateManagerComponent } from './template-manager/template-manager.component';
import { ReportManagerComponent } from './report-manager/report-manager.component';
import { TemplateEditorComponent } from './template-editor/template-editor.component';
import { UploadTemplateComponent } from './upload-template/upload-template.component';
import { GenerateReportComponent } from './generate-report/generate-report.component';
// service
import { TemplateManagerService } from './template-manager/template-manager.service'

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    CommonViewModule,
    MaterialDefModule,
    DocumentRoutingModule
  ],
  declarations: [
    DocumentGeneratorComponent, TemplateManagerComponent, TemplateEditorComponent, 
      UploadTemplateComponent, GenerateReportComponent, ReportManagerComponent,
      // ErrorDialog
    ],
  entryComponents: [
      // ErrorDialog
  ],
  providers: [ ]
})
export class DocumentGeneratorModule { }
