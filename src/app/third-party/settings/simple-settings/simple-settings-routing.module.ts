import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// components
import { SimpleSettingsComponent } from './simple-settings.component';
import { CafeXComponent } from './cafex/cafex-settings.component';

const childRouters = [
    {
        path: "",
        redirectTo: "cafex",
    },
    {
        path: "cafex",
        component: CafeXComponent
    }
]

const routes: Routes = [
    {
        path: '',
        component: SimpleSettingsComponent,
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
export class SimpleSettingsRoutingModule { }
