import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TooltipModule } from "ngx-tooltip";
// module
import { CommonViewModule } from "./../common-view.module";
import { MaterialDefModule } from "./../common/modules/material.module";
// module
import { DataFeedsRoutingModule } from "./data-feeds-routing.module";

// service
import { DataFeedsStorage } from "./data-feeds-storage.service";
import { DataFeedsService } from "./data-feeds.service";
import { ClassManualMatchService } from "./manual-match/Class-manual-match/class-manual-match.service";


// components
import { DataFeedsBaseComponent } from "./data-feeds-base-components.component";
import { DataFeedsHomeComponent } from "./data-feeds-home/data-feed-home.component";
import { DataFeedsComponent } from "./data-feeds.component";

// Import file
// import { ImportFileComponent } from "./import-file/import-file.component";

// manual import
// import { ManualMatchingFeedsComponent } from "./import-file/manual-import/manual-match.component";
// import { MatchRecordsComponent } from "./import-file/manual-import/match-records/match-records.component";
// import { UnMatchRecordsComponent } from "./import-file/manual-import/unmatch-records/unmatch-records.component";

// personal insurance
import { PersonalMatchComponent } from "./manual-match/Tal-personal-manual-match/match-records/match-records.component";
import { PersonalManualMatchComponent } from "./manual-match/Tal-personal-manual-match/personal-manual-match.component";
import { PersonalUnMatchComponent } from "./manual-match/Tal-personal-manual-match/unmatch-records/unmatch-records.component";

// client
// import { ClientManualMatchComponent } from "./manual-match/MnS-client-manual-match/client-manual-match.component";
// import { ClientMatchComponent } from "./manual-match/MnS-client-manual-match/match-records/match-records.component";
// import { ClientUnMatchComponent } from "./manual-match/MnS-client-manual-match/unmatch-records/unmatch-records.component";

// hub24
import { Hub24ManualMatchComponent } from "./manual-match/Hub24-manual-match/hub24-manual-match.component";
import { Hub24MatchComponent } from "./manual-match/Hub24-manual-match/match-records/hub24-match-records.component";
import { Hub24UnMatchComponent } from "./manual-match/Hub24-manual-match/unmatch-records/hub24-unmatch-records.component";

//Macquarie
import { MacquarieManualMatchComponent } from "./manual-match/Macquarie-manual-match/macquarie-manual-match.component";
import { MacquarieMatchComponent } from "./manual-match/Macquarie-manual-match/match-records/macquarie-match-records.component";
import { MacquarieUnMatchComponent } from "./manual-match/Macquarie-manual-match/unmatch-records/macquarie-unmatch-records.component";

// netwealth
import { NetwealthManualMatchComponent } from "./manual-match/Netwealth-manual-match/netwealth-manual-match.component";
import { NetwealthMatchComponent } from "./manual-match/Netwealth-manual-match/netwealth-match-records/netwealth-match-records.component";
import { NetwealthUnMatchComponent } from "./manual-match/Netwealth-manual-match/netwealth-unmatch-records/netwealth-unmatch-records.component";

import { ClientAssetManualMatchComponent } from "./manual-match/MnS-client-asset-manual-match/client-asset-manual-match.component";
import { ClientAssetIgnoreRecordsComponent } from "./manual-match/MnS-client-asset-manual-match/ignore-records/client-asset-ignore-records.component";
import { ClientAssetMatchRecordsComponent } from "./manual-match/MnS-client-asset-manual-match/match-records/client-asset-match-records.component";
import { ClientAssetUnmatchRecordsComponent } from "./manual-match/MnS-client-asset-manual-match/unmatch-records/client-asset-unmatch-records.component";

// desktopbroker
import { DesktopBrokerManualMatchComponent } from "./manual-match/desktop-broker-manual-match/desktop-broker-manual-match.component";
import { DesktopBrokerMatchComponent } from "./manual-match/desktop-broker-manual-match/desktop-broker-match/desktop-broker-match.component";
import { DesktopBrokerUnmatchComponent } from "./manual-match/desktop-broker-manual-match/desktop-broker-unmatch/desktop-broker-unmatch.component";

// class
import { ClassManualMatchComponent } from "./manual-match/Class-manual-match/class-manual-match.component";
import { ClassMatchComponent } from './manual-match/Class-manual-match/class-match/class-match.component';
import { ClassUnmatchComponent } from './manual-match/Class-manual-match/class-unmatch/class-unmatch.component';
import { ClassIgnoreComponent } from './manual-match/Class-manual-match/class-ignore/class-ignore.component';

@NgModule({
  imports: [
    CommonModule,
    DataFeedsRoutingModule,
    CommonViewModule,
    MaterialDefModule,
    FormsModule, ReactiveFormsModule,
    TooltipModule,
  ],
  declarations: [
    DataFeedsComponent,
    DataFeedsHomeComponent,
    DataFeedsBaseComponent,

    // Import file
    // ImportFileComponent,

    // Manual import
    // ManualMatchingFeedsComponent,
    // MatchRecordsComponent,
    // UnMatchRecordsComponent,

    // Personal insurance
    PersonalManualMatchComponent,
    PersonalMatchComponent,
    PersonalUnMatchComponent,

    // Client insurance
    // ClientManualMatchComponent,
    // ClientMatchComponent,
    // ClientUnMatchComponent,
    ClientAssetManualMatchComponent,
    ClientAssetMatchRecordsComponent,
    ClientAssetUnmatchRecordsComponent,
    ClientAssetIgnoreRecordsComponent,

    // Macquarie manual match
    MacquarieManualMatchComponent,
    MacquarieMatchComponent,
    MacquarieUnMatchComponent,

    // Hub24 manual match
    Hub24ManualMatchComponent,
    Hub24MatchComponent,
    Hub24UnMatchComponent,

    // Netwealth manual match
    NetwealthManualMatchComponent,
    NetwealthMatchComponent,
    NetwealthUnMatchComponent,

    // DesktopBroker manual match
    DesktopBrokerManualMatchComponent,
    DesktopBrokerMatchComponent,
    DesktopBrokerUnmatchComponent,

    // Class manual match
    ClassManualMatchComponent,
    ClassMatchComponent,
    ClassUnmatchComponent,
    ClassIgnoreComponent,
  ],
  providers: [
    DataFeedsService,
    DataFeedsStorage,
    ClassManualMatchService
  ],
})
export class DataFeedsModule { }
