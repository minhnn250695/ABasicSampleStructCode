import { Component, OnInit, ViewChild } from '@angular/core';
import { GenerateReportService } from './generate-report.service';
import { TemplateManagerService } from '../template-manager/template-manager.service';
import { ReportManagerService } from '../report-manager/report-manager.service';
import { BackgroundProcessService } from '../../common/services/background-process.service';
import { Template } from '../template-manager/template.model';
import { Client, Pair } from '../../common/models';
import { Report } from './report.model';
import { ErrorDialog } from '../../common/dialog/error-dialog/error-dialog.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';

declare var $: any;
@Component({
    selector: 'generate-report',
    templateUrl: './generate-report.component.html',
    styleUrls: ['./generate-report.component.css'],
    providers: [GenerateReportService, ReportManagerService]
})

export class GenerateReportComponent implements OnInit {

    private allTemplates: Template[];
    private allClients: Client[];
    private reportsCount: number;
    private reportsLimit: number = 20;
    private clientPairs: Pair[] = [];
    private recentClients: Client[];

    // @ViewChild("ReportErrorDialog") errorDialog: ErrorDialog;
    isMobile: boolean;
    templates: Template[];
    clients: Client[];
    selectedTemplate: Template;
    selectedTemplateName: string;
    selectedClient: Client;
    selectedClientName: string;
    generatingReport: boolean;
    failed: boolean;


    constructor(private generateReportService: GenerateReportService,
        private templateManagerService: TemplateManagerService,
        private router: Router,
        private reportManagerService: ReportManagerService,
        private processService: BackgroundProcessService,
        private confirmationService: ConfirmationDialogService,
        private mdDialog: MatDialog) {
    }

    ngOnInit(): void {
        if (navigator.userAgent.includes("Mobile")) {
            this.isMobile = true;
            $('body').css('padding-top', '0');
        }
        else this.isMobile = false;

        this.selectedTemplateName = null;
        this.selectedClientName = null;
        this.templateManagerService.getTemplates()
            .subscribe(result => {
                this.templates = result;
                this.allTemplates = this.templates.slice();
            });
        this.generateReportService.getClients()
            .subscribe(result => {
                this.clients = result;
                this.allClients = this.clients.slice();
                this.clientPairs = [];
                if (this.allClients) {
                    this.clientPairs = this.allClients.map(client => {
                        let pair = new Pair();
                        pair.id = client.id;
                        pair.value = client.name;
                        return pair;
                    });
                }
            });
        this.generateReportService.getRecentClients()
            .subscribe(result => {
                this.recentClients = result.sort((i1: Client, i2: Client) => {
                    return i1.name.localeCompare(i2.name);
                });
            });
        this.reportManagerService.getReports()
            .subscribe(result => this.reportsCount = result.length);
    }

    filterTemplates(templateFilter: string): void {
        if (!this.allTemplates) {
            return;
        }
        if (!templateFilter) {
            this.templates = this.allTemplates.slice();
        } else {
            this.templates = this.allTemplates.filter(x => x.name.toLowerCase().search(templateFilter.toLowerCase()) != -1);
        }
    }

    filterClients(clientFilter: string): void {
        if (!this.allClients) {
            return;
        }
        if (!clientFilter) {
            this.clients = this.allClients.slice();
        } else {
            this.clients = this.allClients.filter(x => x.name.toLowerCase().search(clientFilter.toLowerCase()) != -1);
        }
    }

    selectTemplate(template: Template): void {
        this.selectedTemplate = template;
        this.selectedTemplateName = template.name;
    }

    selectClient(client: Client): void {
        this.selectedClient = client;
        this.selectedClientName = client.name;
    }

    onDropBoxItemClick(pair: Pair) {
        this.selectedClient = this.allClients.find(item => item.id === pair.id);
        this.selectedClientName = pair.value;
        this.generateReportService.addToRecentClients(pair).subscribe();
    }

    isGenerationDisabled(): boolean {
        return this.selectedTemplate == null || this.selectedClient == null || this.generatingReport;
    }

    generate(): void {
        if (this.isReportsLimitReached()) {
            this.generatingReport = true;
            this.failed = false;
            let report = new Report(this.selectedTemplate.name, this.selectedTemplate.id, this.selectedClient.id, this.selectedClient.name);
            this.generateReportService.generateReport(report)
                .subscribe(result => {
                    if (result.success) {
                        let processId = result.data;
                        this.processService.waitProcessComplete(processId, 15000, 40, false).then(result => {
                            this.generatingReport = false;
                            this.failed = result.failed;
                            if (result.finished) {                                
                                this.clearSelection();
                                this.router.navigate(["document/report-manager"]);
                            }
                        });
                    }
                });
        }
    }

    templateManager(): void {
        this.router.navigate(["document/template-manager"]);
    }

    reportManager(): void {
        this.router.navigate(["document/report-manager"]);
    }

    private clearSelection(): void {
        this.selectedClient = null;
        this.selectedClientName = null;
        this.selectedTemplate = null;
        this.selectedTemplateName = null;
    }

    private isReportsLimitReached(): boolean {
        let valid: boolean;

        if (this.reportsCount >= this.reportsLimit) {
            var message = 'The limit of ' + this.reportsLimit + ' generated reports has reached. Please remove some of them and try again.';
            this.confirmationService.showModal({
                title: "Error",
                message: message,
                btnOkText: "OK"
            });
            valid = false;
        } else {
            valid = true;
        }
        return valid;
    }
}