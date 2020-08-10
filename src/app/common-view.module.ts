import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialDefModule } from './common/modules/material.module';

import { AutoCompleteInputComponent } from './common/components/auto-complete-input/auto-complete-input.component';
import { BtnUploadFileComponent } from './common/components/btn-upload-file/btn-upload-file.component';
import { CropImageComponent } from './common/components/crop-image/crop-image.component';
import { CustomAutocomplete } from './common/components/custom-autocomplete/custom-autocomplete.component';
import { DragAndDropFileDirectiveDirective } from './common/components/directives/drag-and-drop-file-directive.directive';
import { DropDownSearchBoxComponent } from './common/components/drop-down-search-box/drop-down-search-box.component';
import { DropPickFileComponent } from './common/components/drop-pick-file/drop-pick-file.component';
import { FooterMinComponent } from './common/components/footer-min/footer-min.component';
import { FooterComponent } from './common/components/footer/footer.component';
import { HeaderComponent } from './common/components/header/header.component';
import { LoadingComponent } from './common/components/loading/loading.component';
import { ProgressBarComponent } from './common/components/progress-bar/progress-bar.component';
import { ProgressStepComponent } from './common/components/progress-step/progress-step.component';
import { SearchBoxComponent } from './common/components/search-box/search-box.component';
import { LoadingDialog } from './common/dialog/loading-dialog/loading-dialog.component';
import { LoaderModule } from './common/modules/loader';
import { SecurityService } from './security/security.service';

import { HomePhonePipe } from './common/pipes/home-phone.pipe';
import { MobilePhonePipe } from './common/pipes/mobile-phone.pipe';

// directives
import { AutoResizeDirective } from './common/directives/auto-resize.directive';
import { ClickOutsideDirective } from "./common/directives/click-outside.directive";
import { ComponentHostDirective } from './common/directives/component-host.directive';
import { FolderModifyPermission } from './common/directives/folders-modify-permission.directive';
import { OnlyNumberDirective } from './common/directives/only-number.directive';
import { EqualValidator } from './common/directives/password-equal-validator.directive';

// modals
import { MyDatePickerModule } from 'mydatepicker';
import { DatePickerComponent } from './common/components/date-picker/date-picker.component';
import { DatepickerComponent } from './common/components/datepicker/datepicker.component';
import { NotFound404Component } from './common/components/not-found-404/not-found-404.component';
import { PagingComponent } from './common/components/paging/paging.component';
import { SpinnerLoadingComponent } from './common/components/spinner-loading/spinner-loading.component';
import { LoadingSpinnerComponent } from './common/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from './common/dialog/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialog } from './common/dialog/error-dialog/error-dialog.component';
import { SuccessDialog } from './common/dialog/success-dialog/success-dialog.component';
import { UploadCompletedDialog } from './common/dialog/upload-completed-dialog/upload-completed-dialog.component';
import { BasicModalComponent } from './common/modal';
import { BirthDayPipe } from './common/pipes/birthday.pipe';
import { ExportExcelDirective } from './common/directives/export-excel-file.directive';


// Angular material
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MaterialDefModule,
    FormsModule, ReactiveFormsModule,
    LoaderModule, MyDatePickerModule,

    // Angular Material Component
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  declarations: [
    LoadingComponent,
    FooterComponent,
    FooterMinComponent,
    HeaderComponent,
    DropPickFileComponent,
    ProgressStepComponent,
    ProgressBarComponent,
    SearchBoxComponent,
    DropDownSearchBoxComponent,
    AutoCompleteInputComponent,
    CustomAutocomplete,
    LoadingDialog,
    BasicModalComponent,
    BtnUploadFileComponent,
    PagingComponent,
    CropImageComponent,
    EqualValidator,
    UploadCompletedDialog,
    ConfirmationDialogComponent,
    ErrorDialog,
    SuccessDialog,
    SpinnerLoadingComponent,
    LoadingSpinnerComponent,
    DatePickerComponent,
    DatepickerComponent,
    NotFound404Component,
    MobilePhonePipe,
    BirthDayPipe,
    HomePhonePipe,
    OnlyNumberDirective,
    ComponentHostDirective,
    DragAndDropFileDirectiveDirective,
    ClickOutsideDirective,
    AutoResizeDirective,
    FolderModifyPermission,
    ExportExcelDirective
  ],
  exports: [
    LoadingComponent,
    FooterComponent,
    FooterMinComponent,
    HeaderComponent,
    DropPickFileComponent,
    ProgressStepComponent,
    ProgressBarComponent,
    SearchBoxComponent,
    DropDownSearchBoxComponent,
    AutoCompleteInputComponent,
    CustomAutocomplete,
    LoadingDialog,
    BasicModalComponent,
    BtnUploadFileComponent,
    PagingComponent,
    CropImageComponent,
    EqualValidator,
    UploadCompletedDialog,
    ConfirmationDialogComponent,
    ErrorDialog,
    SuccessDialog,
    SpinnerLoadingComponent,
    LoadingSpinnerComponent,
    DatePickerComponent,
    DatepickerComponent,
    NotFound404Component,
    MobilePhonePipe,
    BirthDayPipe,
    HomePhonePipe,
    OnlyNumberDirective,
    ComponentHostDirective,
    DragAndDropFileDirectiveDirective,
    ClickOutsideDirective,
    AutoResizeDirective,
    FolderModifyPermission,

    // Angular Material Component
    MatFormFieldModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    FolderModifyPermission,
    ExportExcelDirective
  ],

  providers: [SecurityService]
})
export class CommonViewModule { }
