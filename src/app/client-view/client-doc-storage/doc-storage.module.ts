import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// module
import { CommonViewModule } from '../../common-view.module';
import { MaterialDefModule } from '../../common/modules/material.module';
import { ClientViewSharedModule } from '../client-view-shared.module';
import { DocStorageRoutingModule } from './doc-storage-routing.module';
import { LoaderModule, LoaderService } from '../../common/modules/loader';
// service
import { DocStorageService } from './doc-storage.service';

// components
import { DocumentStorageComponent } from './client-doc-storage.component';
import { DocsOverviewComponent } from './docs-overview/docs-overview.component';
import { TooltipModule } from 'ngx-tooltip';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  imports: [
    CommonModule,
    CommonViewModule,
    MaterialDefModule,
    ClientViewSharedModule,
    DocStorageRoutingModule,
    LoaderModule,
    TooltipModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule
  ],
  declarations: [
    DocumentStorageComponent,
    DocsOverviewComponent,
  ],
  exports: [
    DocumentStorageComponent,
  ],
  providers: [ DocStorageService, LoaderService ]
})
export class DocStorageModule { }
