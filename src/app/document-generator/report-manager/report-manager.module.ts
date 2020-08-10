import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'

import { ReportManagerComponent } from './report-manager.component';

@NgModule({
    declarations: [
        ReportManagerComponent
    ],
    imports: [
        HttpClientModule
    ],
    providers: [
    ],
    exports: [
        ReportManagerComponent
    ]
})

export class ReportManagerModule {}