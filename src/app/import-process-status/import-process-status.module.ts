import { NgModule } from "@angular/core";
import { MaterialDefModule } from "../common/modules/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CommonViewModule } from "../common-view.module";
import { ImportRoutingModule } from "./import-routing.module";

import { TooltipModule } from 'ngx-tooltip';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ImportProcessStatusComponent } from './import-process-status.component';
// import { ConfirmationDialogService } from '../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { FileImportService } from '../file-import/file-import.service';
import { DataFeedStatusComponent } from '../import-process-status/data-feed-status/data-feed-status.component';
import { DataMigrationStatusComponent } from '../import-process-status/data-migration-status/data-migration-status.component';
import { from } from 'rxjs/observable/from';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ImportRoutingModule,
    CommonViewModule,
    MaterialDefModule,
    TooltipModule,
    InfiniteScrollModule, // using for scroll down each section    
  ],
  declarations: [
    ImportProcessStatusComponent,
    DataFeedStatusComponent,
    DataMigrationStatusComponent
  ],
  providers: [
    // ConfirmationDialogService, 
    FileImportService
  ]
})
export class ImportProcessStatusModule {
}
