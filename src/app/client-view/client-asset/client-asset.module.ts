import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// module
import { ClientAssetRoutingModule } from './client-asset-routing.module';
import { CommonViewModule } from '../../common-view.module';
import { MaterialDefModule } from '../../common/modules/material.module';
import { ClientViewSharedModule } from '../client-view-shared.module';
// services
import { DocStorageService } from '../client-doc-storage/doc-storage.service';
// components
import { ClientAssetComponent } from './client-asset.component'; 
import { AssetOverViewComponent } from './asset-overview/asset-overview.component';
import { AssetHistoryComponent } from './asset-history/asset-history.component';
import { ChartsModule } from 'ng2-charts/ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClientAssetRoutingModule,
    CommonViewModule,
    MaterialDefModule,
    ClientViewSharedModule,
    ChartsModule
  ],
  declarations: [
    ClientAssetComponent,
    AssetOverViewComponent,
    AssetHistoryComponent,
  ],
  exports: [
    ClientAssetComponent,
    AssetHistoryComponent,
  ],
  providers: [ DocStorageService ],
})
export class ClientAssetModule { }
