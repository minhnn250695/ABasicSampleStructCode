import { Component, OnInit, HostListener } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { TemplateManagerService } from '../template-manager/template-manager.service';
import { Template } from '../template-manager/template.model';
import { SecurityService } from '../../security/security.service';
import { LoaderService } from '../../common/modules/loader';

@Component({
    selector: 'template-editor',
    templateUrl: './template-editor.component.html',
    styleUrls: ['./template-editor.component.css'],
    providers: []
})

export class TemplateEditorComponent implements OnInit {

    private template: Template;

    documentGeneratorUrl: SafeResourceUrl;
    action: string;


    constructor(private templateManagerService: TemplateManagerService,
        private securityService: SecurityService,
        private sanitizer: DomSanitizer,
        private loaderService: LoaderService) {

        let url = this.templateManagerService.getDocumentGeneratorUrl();
        this.documentGeneratorUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    ngOnInit(): void {
        this.loaderService.show();
        this.template = this.templateManagerService.getSelectedTemplate();
        this.action = this.template.isNew ? "New Template" : "Edit Template";
    }

    @HostListener('window:message', ['$event'])
    onMessage(event: any) {
        if (event.data == 'hideLoader') {
            this.loaderService.hide();
        } if (event.data == 'showLoader') {
            this.loaderService.show();
        } else if (event.data == 'edit') {
            this.action = "Edit Template";
        }
    }

}