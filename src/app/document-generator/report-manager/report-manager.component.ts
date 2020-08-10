import { Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PageEvent, MatPaginator } from '@angular/material';
import { ReportManagerService } from './report-manager.service';
import { TemplateManagerService } from '../template-manager/template-manager.service';
import { Report } from './report.model';
import { Paginator } from './paginator.model';
import { Author } from '../template-manager/author.model';
import { ReportsFilter } from './report-filter.model';
import { saveAs as importedSaveAs } from 'file-saver';

declare var $: any;
@Component({
    selector: 'report-manager',
    templateUrl: './report-manager.component.html',
    styleUrls: ['./report-manager.component.css'],
    providers: [ReportManagerService]
})

export class ReportManagerComponent implements OnInit {

    private allReports: Report[];
    private filteredReports: Report[];
    private selectedReport: Report;
    private self: ReportManagerComponent;

    isMobile: boolean;
    reports: Report[];
    authors: Author[];
    filters: ReportsFilter;
    paginator: Paginator;
    @ViewChild("reportPaginator") paginatorComponent: MatPaginator;

    constructor(private reportManagerService: ReportManagerService, private templateManagerService: TemplateManagerService) {
    }

    ngOnInit(): void {
        if (navigator.userAgent.includes("Mobile")) {
            this.isMobile = true;
            $('body').css('padding-top', '0');
        }
        else this.isMobile = false;

        this.paginator = new Paginator(this.paginatorComponent, 10, [5, 10, 25, 100]);
        this.filters = new ReportsFilter();
        this.reportManagerService.getReports()
            .subscribe(result => {
                this.reports = result;
                this.allReports = this.reports.slice();
                this.filteredReports = this.reports.slice();
                this.paginator.length = this.reports.length;
                this.getFirstPage();
            });

        this.templateManagerService.getAuthors()
            .subscribe(result => {
                this.authors = result;
                this.authors.unshift(new Author("0", ""));
            });
    }

    changePage(event: PageEvent): void {
        let page = this.paginator.getNewPage(event);
        this.reports = this.filteredReports.slice(page[0], page[1]);
    }

    getFirstPage(): void {
        let page = this.paginator.getFirstPage();
        this.reports = this.filteredReports.slice(page[0], page[1]);
    }

    search(): void {
        this.filteredReports = this.filteredReports.filter(x => x.name.toLowerCase().search(this.filters.name.toLowerCase()) != -1);
        this.reports = this.filteredReports.slice();
        this.paginator.length = this.reports.length;
        this.getFirstPage();
    }

    downloadReport(report: Report): void {
        this.reportManagerService.downloadReport(report.id).subscribe(response => {
            importedSaveAs(response, report.name + '.docx');
        });
    }

    applyFilters(): void {
        this.filteredReports = this.allReports.slice();
        if (this.filters.name) {
            this.filteredReports = this.filteredReports.filter(x => x.name.toLowerCase().search(this.filters.name.toLowerCase()) != -1);
        }
        if (this.filters.author) {
            this.filteredReports = this.filteredReports.filter(x => x.authorName.search(this.filters.author) != -1);
        }
        if (this.filters.periodFrom) {
            this.filteredReports = this.filteredReports.filter(x => x.creationDate >= new Date(this.filters.periodFrom));
        }
        if (this.filters.periodTo) {
            this.filters.periodTo.setDate(this.filters.periodTo.getDate() + 1);
            this.filteredReports = this.filteredReports.filter(x => x.creationDate < this.filters.periodTo);
        }
        this.reports = this.filteredReports.slice();
        this.paginator.length = this.reports.length;
        this.getFirstPage();
    }

    selectReport(report: Report): void {
        this.selectedReport = report;
    }

    resetFilters(): void {
        this.filters.clear();
        this.applyFilters();
    }

    deleteReport(): void {

        this.reportManagerService.deleteReport(this.selectedReport.id)
            .subscribe(result => {
                if (result.success) {
                    let index = this.allReports.indexOf(this.selectedReport);
                    this.allReports.splice(index, 1);
                    index = this.reports.indexOf(this.selectedReport);
                    this.reports.splice(index, 1);
                    this.paginator.length = this.reports.length;
                }
            });
    }
}