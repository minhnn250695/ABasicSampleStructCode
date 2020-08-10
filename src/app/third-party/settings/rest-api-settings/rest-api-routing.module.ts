import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// components
import { RestApiComponent } from './rest-api-settings.component';
import { MoneySoftComponent } from './moneysoft/moneysoft-settings.component';
import { InvestfitComponent } from './investfit/investfit-settings.component';
import { XplanComponent } from './xplan/xplan-settings.component';
import { DesktopBrokerComponent } from './desktopbroker/desktopbroker-settings.component';

const childRouters = [
    {
        path: "",
        redirectTo: "moneysoft",
    },
    {
        path: "moneysoft",
        component: MoneySoftComponent
    },
    {
        path: "investfit",
        component: InvestfitComponent
    },
    {
        path: "xplan",
        component: XplanComponent
    },
    {
        path: "desktopbroker",
        component: DesktopBrokerComponent
    }
]

const routes: Routes = [
    {
        path: '',
        component: RestApiComponent,
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
export class RestApiRoutingModule { }
