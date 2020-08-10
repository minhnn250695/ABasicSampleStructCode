import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TemplateEditorComponent } from './template-editor.component';

@NgModule({
    declarations: [
        TemplateEditorComponent
    ],
    imports: [
        HttpClientModule
    ],
    providers: [
    ],
    exports: [
        TemplateEditorComponent
    ]
})

export class TemplateEditorModule {}