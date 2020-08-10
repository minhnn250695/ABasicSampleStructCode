import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// https://github.com/valor-software/ng2-charts
// https://www.angularjs4u.com/angularjs2/top-20-angular-2-charts-graphs/
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { CommonViewModule } from '../common-view.module';
import { LoaderModule, LoaderService } from '../common/modules/loader';
import { MaterialDefModule } from './../common/modules/material.module';
import { ClientViewRoutingModule } from './client-view-routing.module';
import { ClientViewSharedModule } from './client-view-shared.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
// https://github.com/uttesh/ngu-utility
// import { NguUtilityModule } from 'ngu-utility';
// import {
//     MatButtonModule,
//     MatButtonToggleModule,
//     MatCardModule,
//     MatCheckboxModule,
//     MatChipsModule,
//     MatDatepickerModule,
//     MatDialogModule,
//     MatExpansionModule,
//     MatFormFieldModule,
//     MatGridListModule,
//     MatIconModule,
//     MatInputModule,
//     MatListModule,
//     MatMenuModule,
//     MatNativeDateModule,
//     MatPaginatorModule,
//     MatProgressBarModule,
//     MatProgressSpinnerModule,
//     MatRadioModule,
//     MatRippleModule,
//     MatSelectModule,
//     MatSidenavModule,
//     MatSliderModule,
//     MatSlideToggleModule,
//     MatSnackBarModule,
//     MatSortModule,
//     MatStepperModule,
//     MatTableModule,
//     MatTabsModule,
//     MatToolbarModule,
//     MatTooltipModule,
// } from '@angular/material';
// services
import { RefreshService } from '../common/services/refresh.service';
import { ClientViewService } from './client-view.service';

// children
import { TooltipModule } from 'ngx-tooltip';
import { RetirementReportComponent } from './client-retirement-report/retirement-report.component';
import { ClientViewComponent } from './client-view.component';
import { ClientHeaderComponent } from './common/header/client-header.component';
@NgModule({
    imports: [
        CommonModule,
        CommonViewModule,
        ClientViewRoutingModule,
        ChartsModule,
        ClientViewRoutingModule,
        MaterialDefModule,
        FormsModule,
        ReactiveFormsModule,
        // NguUtilityModule,
        ClientViewSharedModule,
        LoaderModule,
        TooltipModule,
        // MatButtonModule,
        // MatButtonToggleModule,
        // MatCardModule,
        // MatCheckboxModule,
        // MatChipsModule,
        // MatDatepickerModule,
        // MatDialogModule,
        // MatExpansionModule,
        // MatFormFieldModule,
        // MatGridListModule,
        // MatIconModule,
        // MatInputModule,
        // MatListModule,
        // MatMenuModule,
        // MatNativeDateModule,
        // MatPaginatorModule,
        // MatProgressBarModule,
        // MatProgressSpinnerModule,
        // MatRadioModule,
        // MatRippleModule,
        // MatSelectModule,
        // MatSidenavModule,
        // MatSliderModule,
        // MatSlideToggleModule,
        // MatSnackBarModule,
        // MatSortModule,
        // MatStepperModule,
        // MatTableModule,
        // MatTabsModule,
        // MatToolbarModule,
        // MatTooltipModule,
        Ng2SearchPipeModule
    ],
    declarations: [
        ClientHeaderComponent,
        ClientViewComponent,
        RetirementReportComponent,
    ],
    exports: [
        ClientViewComponent,
        // MatSidenavModule
    ],
    providers: [
        LoaderService,
        ClientViewService,
        RefreshService
    ]
})
export class ClientViewModule { }