import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// module
import { RestApiRoutingModule } from './rest-api-routing.module';
// import { ThirdPartyModule } from './../../third-party.module';
// components
import { RestApiComponent } from './rest-api-settings.component';
import { MoneySoftComponent } from './moneysoft/moneysoft-settings.component';
import { InvestfitComponent } from './investfit/investfit-settings.component';
import { XplanComponent } from './xplan/xplan-settings.component';
import { DesktopBrokerComponent } from './desktopbroker/desktopbroker-settings.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,      
        RestApiRoutingModule,
        // ThirdPartyModule
    ],
    declarations: [
        RestApiComponent,
        MoneySoftComponent,
        InvestfitComponent,
        XplanComponent,
        DesktopBrokerComponent
    ],
    exports:[],
    providers:[]
})

export class RestApiModule {}