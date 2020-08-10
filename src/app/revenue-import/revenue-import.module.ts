import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { RevenueRoutingModule } from './revenue-routing.module';
import { TooltipModule } from "ngx-tooltip";
// component
import { RevenueImportComponent } from './revenue-import.component';
import { UploadFileComponent } from './main/upload-file/upload-file.component';
import { CheckMatchProgressComponent } from './main/check-match-progress/check-match-progress.component';
import { RevenueMatchDataComponent } from './main/revenue-match-data/revenue-match-data.component';
import { MatchCompletedComponent } from './main/match-completed/match-completed.component';
import { MatchDialogComponent } from './main/revenue-match-data/matched-data/matched-dialog/matched-dialog.component'
import { UnmatchDialogComponent } from './main/revenue-match-data/unmatched-data/unmatched-dialog/unmatched-dialog.component'
// import { RowContentComponent } from './main/revenue-match-data/match-dialog/row-content/row-content.component';
// import { MatchMdDialogComponent } from './main/revenue-match-data/match-md-dialog/match-md-dialog.component';
// module
import { CommonViewModule } from './../common-view.module';
import { MaterialDefModule } from './../common/modules/material.module';
// dialog
// import { GeneralDialog } from './../common/dialog/general-dialog/general-dialog.component';
// import { ErrorDialog } from './../common/dialog/error-dialog/error-dialog.component';
import { RowContentMatchedComponent } from './main/revenue-match-data/matched-data/matched-dialog/row-content-matched/row-content-matched.component';
import { RowContentUnmatchedComponent } from './main/revenue-match-data/unmatched-data/unmatched-dialog/row-content-unmatched/row-content-unmatched.component';
import { MatchedRevenueComponent } from "../revenue-import/main/revenue-match-data/matched-data/matched-data.component";
import { UnmatchedRevenueComponent } from "../revenue-import/main/revenue-match-data/unmatched-data/unmatched-data.component";
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RevenueRoutingModule,
    CommonViewModule,
    MaterialDefModule,
    TooltipModule
  ],
  declarations: [
    RevenueImportComponent,
    UploadFileComponent,
    CheckMatchProgressComponent,
    RevenueMatchDataComponent,
    MatchCompletedComponent,
    MatchDialogComponent,
    UnmatchDialogComponent,
    RowContentMatchedComponent,
    RowContentUnmatchedComponent,
    MatchedRevenueComponent,
    UnmatchedRevenueComponent
  ],
  entryComponents: [ ],
  providers: [ ]
})
export class RevenueImportModule {
 }
