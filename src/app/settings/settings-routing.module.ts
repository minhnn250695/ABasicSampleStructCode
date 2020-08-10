import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// component
import { SettingsComponent } from './settings.component';
import { ThirdPartyConnectionsComponent } from './third-party-connections/third-party-connections.component';
import { ThirdPartyHomeComponent } from './third-party-home/third-party-home.component';

const childRouters: Routes = [
    {
        path: "",
        redirectTo: "landing",
    },
    {
        path: 'landing',
        component: ThirdPartyHomeComponent
    },
    {
        path: 'third-party-connections',
        component: ThirdPartyConnectionsComponent
    }

];

const routes: Routes = [
    {
        path: '',
        component: SettingsComponent,
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
export class SettingsRoutingModule { }
