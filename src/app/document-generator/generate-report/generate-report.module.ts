import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { GenerateReportComponent } from './generate-report.component';

@NgModule({
    declarations: [
        GenerateReportComponent
    ],
    imports: [
        HttpClientModule
    ],
    providers: [
    ],
    exports: [
        GenerateReportComponent
    ]
})

export class GenerateReportModule {}