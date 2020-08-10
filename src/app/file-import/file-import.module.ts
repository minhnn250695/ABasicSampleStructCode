import { NgModule } from "@angular/core";
import { MaterialDefModule } from "../common/modules/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CommonViewModule } from "../common-view.module";
import { FileRoutingModule } from "./file-routing.module";
import { FileImportComponent } from "./file-import.component";
import { UploadFileComponent } from "./upload-file/upload-file.component";
import { MatchCompletedComponent } from "./match-completed/match-completed.component";
import { AutoMatchDataComponent } from "./auto-match-data/auto-match-data.component";
import { MatchFieldsNameComponent } from "./match-fields-name/match-fields-name.component";
import { ManualMatchDataComponent } from "./manual-match-data/manual-match-data.component";
import { FileImportService } from "./file-import.service";
import { TooltipModule } from 'ngx-tooltip';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { UnmatchedSearchBoxComponent } from './manual-match-data/unmatched-record-component/unmatched-search-box/unmatched-search-box.component';

import { ContactsUnmatchedComponent } from './manual-match-data/unmatched-record-component/contacts-unmatched/contacts-unmatched.component';
import { ContactsMatchedComponent } from './manual-match-data/matched-record-component/contacts-matched/contacts-matched.component';
import { ContactsNewRecordComponent } from './manual-match-data/new-record-component/contacts-new-record/contacts-new-record.component';
import { ContactsInvalidComponent } from './manual-match-data/invalid-record-component/contacts-invalid/contacts-invalid.component';

import { HouseHoldsMatchedComponent } from './manual-match-data/matched-record-component/households-matched/households-matched.component';
import { HouseHoldsUnmatchedComponent } from './manual-match-data/unmatched-record-component/households-unmatched/households-unmatched.component';
import { HouseHoldsNewRecordComponent } from './manual-match-data/new-record-component/households-new-record/households-new-record.component';
import { HouseHoldsInvalidComponent } from './manual-match-data/invalid-record-component/households-invalid/households-invalid.component';

import { InsuranceBenefitsMatchedComponent } from './manual-match-data/matched-record-component/insurance-benefits-matched/insurance-benefits-matched.component';
import { InsuranceBenefitsUnmatchedComponent } from './manual-match-data/unmatched-record-component/insurance-benefits/insurance-benefits.component';
import { InsuranceBenefitsNewComponent } from './manual-match-data/new-record-component/insurance-benefits/insurance-benefits.component';
import { InsuranceBenefitsInvalidComponent } from './manual-match-data/invalid-record-component/insurance-benefits-invalid/insurance-benefits-invalid.component';

import { InsurancePoliciesMatchedComponent } from './manual-match-data/matched-record-component/insurance-policies-matched/insurance-policies-matched.component';
import { InsurancePoliciesUnmatchedComponent } from './manual-match-data/unmatched-record-component/insurance-policies/insurance-policies.component';
import { InsurancePoliciesNewComponent } from './manual-match-data/new-record-component/insurance-policies/insurance-policies.component';
import { InsurancePoliciesInvalidComponent } from './manual-match-data/invalid-record-component/insurance-policies-invalid/insurance-policies-invalid.component';

import { CompaniesMatchedComponent } from './manual-match-data/matched-record-component/companies-matched/companies-matched.component';
import { CompaniesUnmatchedComponent } from './manual-match-data/unmatched-record-component/companies/companies.component';
import { CompaniesNewComponent } from './manual-match-data/new-record-component/companies/companies.component';
import { CompaniesInvalidComponent } from './manual-match-data/invalid-record-component/companies-invalid/companies-invalid.component';

import { ClientAssetsMatchedComponent } from './manual-match-data/matched-record-component/client-assets-matched/client-assets-matched.component';
import { ClientAssetsUnmatchedComponent } from './manual-match-data/unmatched-record-component/client-assets/client-assets.component';
import { ClientAssetsNewComponent } from './manual-match-data/new-record-component/client-assets/client-assets.component';
import { ClientAssetsInvalidComponent } from './manual-match-data/invalid-record-component/client-assets-invalid/client-assets-invalid.component';

import { ClientDebtsMatchedComponent } from './manual-match-data/matched-record-component/client-debts-matched/client-debts-matched.component';
import { ClientDebtsUnmatchedComponent } from './manual-match-data/unmatched-record-component/client-debts/client-debts.component';
import { ClientDebtsNewComponent } from './manual-match-data/new-record-component/client-debts/client-debts.component';
import { ClientDebtsInvalidComponent } from './manual-match-data/invalid-record-component/client-debts-invalid/client-debts-invalid.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FileRoutingModule,
    CommonViewModule,
    MaterialDefModule,
    TooltipModule,
    InfiniteScrollModule // using for scroll down each section

  ],
  declarations: [
    FileImportComponent,
    UploadFileComponent,
    MatchCompletedComponent,
    AutoMatchDataComponent,
    MatchFieldsNameComponent,
    ManualMatchDataComponent,
    UnmatchedSearchBoxComponent,

    HouseHoldsMatchedComponent,
    ContactsMatchedComponent,
    CompaniesMatchedComponent,
    ClientAssetsMatchedComponent,
    ClientDebtsMatchedComponent,
    InsurancePoliciesMatchedComponent,
    InsuranceBenefitsMatchedComponent,

    HouseHoldsUnmatchedComponent,
    ContactsUnmatchedComponent,
    CompaniesUnmatchedComponent,
    ClientAssetsUnmatchedComponent,
    ClientDebtsUnmatchedComponent,
    InsurancePoliciesUnmatchedComponent,
    InsuranceBenefitsUnmatchedComponent,


    HouseHoldsNewRecordComponent,
    ContactsNewRecordComponent,
    CompaniesNewComponent,
    ClientAssetsNewComponent,
    ClientDebtsNewComponent,
    InsurancePoliciesNewComponent,
    InsuranceBenefitsNewComponent,

    HouseHoldsInvalidComponent,
    ContactsInvalidComponent,
    CompaniesInvalidComponent,
    ClientAssetsInvalidComponent,
    ClientDebtsInvalidComponent,
    InsurancePoliciesInvalidComponent,
    InsuranceBenefitsInvalidComponent
  ],
  providers: [
    FileImportService,
  ]
})
export class FileImportModule {
}
