import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'

import { TemplateManagerComponent } from './template-manager.component';

@NgModule({
    declarations: [
        TemplateManagerComponent
    ],
    imports: [
        HttpClientModule
    ],
    providers: [
    ],
    exports: [
        TemplateManagerComponent
    ]
})

export class TemplateManagerModule {}