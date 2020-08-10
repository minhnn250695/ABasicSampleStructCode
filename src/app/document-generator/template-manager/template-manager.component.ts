import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TemplateManagerService } from './template-manager.service';
import { Template } from './template.model';
import { Author } from './author.model';
import { DocumentGeneratorConfig } from './document-generator-config.model';
import { TemplatesFilter } from './templates-filter.model';
import { Router } from '@angular/router';

declare var $: any;
@Component({
    selector: 'template-manager',
    templateUrl: './template-manager.component.html',
    styleUrls: ['./template-manager.component.css'],
    providers: []
})

export class TemplateManagerComponent implements OnInit {

    private allTemplates: Template[];

    isMobile: boolean;
    templates: Template[];
    authors: Author[];
    filters: TemplatesFilter;

    constructor(private templateManagerService: TemplateManagerService, private router: Router) {
    }

    ngOnInit(): void {
        if (navigator.userAgent.includes("Mobile")) {
            this.isMobile = true;
            $('body').css('padding-top', '0');
        }
        else this.isMobile = false;

        this.filters = new TemplatesFilter();
        this.templateManagerService.getTemplates()
            .subscribe(result => {
                this.templates = result;
                this.allTemplates = this.templates.slice();
            });

        this.templateManagerService.getAuthors()
            .subscribe(result => {
                this.authors = result;
                this.authors.unshift(new Author("0", ""));
            });

        this.templateManagerService.getDocumentGeneratorConfig().subscribe();
    }

    search(): void {
        this.templates = this.allTemplates.filter(x => x.name.toLowerCase().search(this.filters.name.toLowerCase()) != -1);
    }

    uploadTemplate(): void {
        this.router.navigate(["document/upload-template"]);
    }

    applyFilters(): void {
        let templates = this.allTemplates.slice();
        if (this.filters.name) {
            templates = templates.filter(x => x.name.toLowerCase().search(this.filters.name.toLowerCase()) != -1);
        }
        if (this.filters.author) {
            templates = templates.filter(x => x.authorName.search(this.filters.author) != -1);
        }
        if (this.filters.periodFrom) {
            templates = templates.filter(x => x.creationDate >= new Date(this.filters.periodFrom));
        }
        if (this.filters.periodTo) {
            templates = templates.filter(x => x.creationDate <= new Date(this.filters.periodTo));
        }
        this.templates = templates;
    }

    resetFilters(): void {
        this.filters.clear();
        this.applyFilters();
    }

    selectTemplate(template: Template): void {
        this.templateManagerService.selectTemplate(template);
    }

    newTemplate(): void {
        this.templateManagerService.selectTemplate(null);
        this.router.navigate(["document/template-editor"]);
    }

    editTemplate(template: Template): void {
        this.templateManagerService.selectTemplate(template);
        this.router.navigate(["document/template-editor"]);
    }

    duplicateTemplate(): void {

        let template = this.templateManagerService.getSelectedTemplate();
        this.templateManagerService.copyTemplate(template)
            .subscribe(result => {
                if (result.success) {
                    this.allTemplates.push(result.data);
                    let index = this.templates.indexOf(template);
                    this.templates.splice(index + 1, 0, result.data);
                }
            });
    }

    deleteTemplate(): void {

        let template = this.templateManagerService.getSelectedTemplate();
        this.templateManagerService.deleteTemplate(template)
            .subscribe(result => {
                if (result.success) {
                    let index = this.allTemplates.indexOf(template);
                    this.allTemplates.splice(index, 1);
                    index = this.templates.indexOf(template);
                    this.templates.splice(index, 1);
                }
            });
    }
}