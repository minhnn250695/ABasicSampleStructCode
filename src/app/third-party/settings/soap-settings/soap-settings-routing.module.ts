import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// components
import { SoapSettingsComponent } from './soap-settings.component';
import { Hub24Component } from './hub24/hub24-settings.component';
import { MacquariebankComponent } from './macquariebank/macquariebank.component';

const childRouters = [
    {
        path: "",
        redirectTo: "hub24",
    },
    {
        path: "hub24",
        component: Hub24Component
    },
    {
        path: "macquariebank",
        component: MacquariebankComponent
    }
]

const routes: Routes = [
    {
        path: '',
        component: SoapSettingsComponent,
        children: childRouters
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ],
    declarations: [],
    exports: [
        RouterModule
    ]
})
export class SoapSettingsRoutingModule { }
