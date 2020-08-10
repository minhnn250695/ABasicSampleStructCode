import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DocumentsGenComponent } from './card-documents-gen/documents-gen.component';
import { FindClientComponent } from './card-find-client/find-client.component';
import { RevenueComponent } from './card-revenue/revenue.component';
import { AdminViewComponent } from './admin-view.component';
import { CommonViewModule } from './../../common-view.module';
import { MaterialDefModule } from '../../common/modules/material.module';
// services
import { ClientViewService } from '../../client-view/client-view.service';
import { DataFeedsService } from '../../data-feeds/data-feeds.service';
import { DataFeedsStorage } from '../../data-feeds/data-feeds-storage.service';
import { ThirdPartyService } from '../../third-party/third-party.service';
import { CardDatafeedsComponent } from './card-datafeeds/card-datafeeds.component';
import { FileImportService } from '../../file-import/file-import.service';
// import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';

@NgModule({
    imports: [
        CommonModule,
        CommonViewModule,
        MaterialDefModule,
        FormsModule, ReactiveFormsModule,
    ],
    declarations: [
        DocumentsGenComponent,
        FindClientComponent,
        RevenueComponent,
        AdminViewComponent,
        CardDatafeedsComponent
    ],
    exports: [
        DocumentsGenComponent,
        FindClientComponent,
        RevenueComponent,
        AdminViewComponent
    ],
    providers: [
        ClientViewService,
        DataFeedsService,
        DataFeedsStorage,
        ThirdPartyService,
        FileImportService,
        // ConfirmationDialogService
    ]
})
export class AdminViewModule { }
