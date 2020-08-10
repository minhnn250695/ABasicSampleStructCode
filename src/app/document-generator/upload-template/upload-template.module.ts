import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { UploadTemplateComponent } from './upload-template.component';

@NgModule({
    declarations: [
        UploadTemplateComponent
    ],
    imports: [
        HttpClientModule
    ],
    providers: [
    ],
    exports: [
        UploadTemplateComponent
    ]
})

export class UploadTemplateModule {}