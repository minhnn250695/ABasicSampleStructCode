import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecentTemplate } from './recent-template.model';
import { DocumentsGenService } from './documents-gen.service';
import { TemplateManagerService } from '../../../document-generator/template-manager/template-manager.service';
import { Template } from '../../../document-generator/template-manager/template.model';

declare var $: any;
@Component({
    selector: 'card-documents-gen',
    templateUrl: './documents-gen.component.html',
    styleUrls: ['./documents-gen.component.css'],
    providers: [DocumentsGenService]
})
export class DocumentsGenComponent implements OnInit {

    isMobile: boolean;
    recentTemplates: RecentTemplate[];

    constructor(private router: Router, private documentsGenService: DocumentsGenService, private templateManagerService: TemplateManagerService) { }

    ngOnInit() {
        if (navigator.userAgent.includes("Mobile")) {
            this.isMobile = true;
            $('body').css('padding-top', '0');
        }
        else this.isMobile = false;

        this.documentsGenService.getRecentTemplates()
            .subscribe(result => {
                this.recentTemplates = result;
            });
        this.templateManagerService.getDocumentGeneratorConfig().subscribe();
    }

    newReport(): void {
        this.router.navigate(["/document/generate-report"]);
    }

    templateManager(): void {
        this.router.navigate(["/document/template-manager"]);
    }

    editTemplate(recentTemplate: RecentTemplate): void {
        let template = new Template();
        template.id = recentTemplate.id;
        template.name = recentTemplate.name;
        template.path = recentTemplate.path;
        this.templateManagerService.selectTemplate(template);
        this.router.navigate(["document/template-editor"]);
    }

}
