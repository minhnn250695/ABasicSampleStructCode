import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// module
import { ClientContactRoutingModule } from './client-contact-routing.module';
import { CommonViewModule } from '../../common-view.module';
import { MaterialDefModule } from '../../common/modules/material.module';
import { ClientViewSharedModule } from '../client-view-shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

// components
import { ClientContactComponent } from './client-contact.component';
import { FormsModule } from '@angular/forms';
import { ClientContactService } from './client-contact.service';
import { ThirdPartyService } from '../../third-party/third-party.service';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    CommonViewModule,
    MaterialDefModule,
    ClientViewSharedModule,
    ClientContactRoutingModule,
    CKEditorModule
  ],
  declarations: [
    ClientContactComponent,
  ],
  exports: [
    ClientContactComponent,
  ],
  providers: [
    ClientContactService,
    ThirdPartyService
  ]
})
export class ClientContactModule { }
