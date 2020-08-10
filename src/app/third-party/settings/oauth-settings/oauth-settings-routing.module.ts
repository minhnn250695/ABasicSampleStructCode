import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// components
import { OauthSettingsComponent } from './oauth-settings.component';
import { ClassComponent } from './class/class-settings.component';

const childRouters = [
    {
        path: "",
        redirectTo: "class",
    }
    ,
    {
        path: "class",
        component: ClassComponent
    }
]

const routes: Routes = [
    {
        path: '',
        component: OauthSettingsComponent,
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
export class OauthSettingsRoutingModule { }