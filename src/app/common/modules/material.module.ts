import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatPaginatorModule
} from '@angular/material';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CdkTableModule } from '@angular/cdk/table';


@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatProgressBarModule,
        MatSelectModule,
        MatTableModule,
        MatInputModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatPaginatorModule,
        CdkTableModule,
    ],

    exports: [
        CommonModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatProgressBarModule,
        MatSelectModule,
        MatTableModule,
        MatInputModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatPaginatorModule,
        CdkTableModule,
    ],
    declarations: []
})
export class MaterialDefModule { }
