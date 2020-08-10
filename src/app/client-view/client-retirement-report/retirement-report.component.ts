import { Component, OnInit, OnDestroy } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ClientViewService } from '../client-view.service';
import { FpStorageService } from '../../local-storage.service';
import { ConfigService } from '../../common/services/config-service';
import { LoaderService } from '../../common/modules/loader';
import { FooterService } from '../../common/components/footer/footer.service';
import { ISubscription } from 'rxjs/Subscription';


import { NgModel } from '@angular/forms';

declare var $: any;

@Component({
    selector: 'app-retirement-report',
    templateUrl: './retirement-report.component.html',
    styleUrls: ['./retirement-report.component.css'],
    providers: [ConfigService]
})
export class RetirementReportComponent implements OnInit {

    private reportId: string;
    private checkInterval: any;
    private checkAuthenticationInterval: any;
    private maxAttempts: number = 20;
    private attempts: number;

    retirementReportUrl: SafeResourceUrl;

    constructor(
        private clientService: ClientViewService,
        private fpStorageService: FpStorageService,
        private configService: ConfigService,
        private loaderService: LoaderService,
        private sanitizer: DomSanitizer,
        private footerService: FooterService) {

        this.retirementReportUrl = this.sanitizer.bypassSecurityTrustResourceUrl("");
    }

    ngOnInit() {
        this.footerService.hideNeedHelpSection();
        this.loaderService.show();

        this.clientService.getInvestfitAuthenticationStatus().subscribe(result => {
            if (result.isAuthenticated) {
                this.getRetirementReport();
            } else {
                this.clientService.getInvestfitLoginUrl().subscribe(result => {
                    this.retirementReportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(result.redirectUrl);
                    this.clientService.hideLoading();
                    this.checkAuthenticationStatus();
                }, error => {
                    console.log(error)
                    this.loaderService.hide();
                    this.clientService.hideLoading();
                });
            }
        }, error => {
            console.log(error)
            this.loaderService.hide();
            this.clientService.hideLoading();
        });
    }

    ngOnDestroy() {
        this.clientService.hideLoading();
        this.loaderService.hide();
        clearInterval(this.checkAuthenticationInterval);
    }

    private checkAuthenticationStatus() {
        let self = this;
        this.checkAuthenticationInterval = setInterval(function () {
            self.loaderService.show();
            let subcription: ISubscription = self.clientService.getInvestfitAuthenticationStatus().subscribe(result => {
                if (result.isAuthenticated) {
                    self.getRetirementReport();
                    clearInterval(self.checkAuthenticationInterval);
                }
            }, error => {
                console.log(error)
                self.loaderService.hide();
                self.clientService.hideLoading();
                subcription.unsubscribe();
            });
        }, 5000);
    }


    private checkReportStatus() {
        let self = this;
        this.checkInterval = setInterval(function () {
            self.loaderService.show();
            let subcription: ISubscription = self.clientService.getRetirementReportStatus(self.reportId).subscribe(result => {
                if (result.status == 'complete') {
                    clearInterval(self.checkInterval);
                    self.clientService.getRetirementReportUrl(self.reportId).subscribe(result => {
                        self.retirementReportUrl = self.sanitizer.bypassSecurityTrustResourceUrl(result.url);
                        self.loaderService.hide();
                    });
                }
                self.attempts++;
                if (self.attempts >= self.maxAttempts) {
                    clearInterval(self.checkInterval);
                    self.loaderService.hide();
                }
                subcription.unsubscribe();
            });
        }, 15000);
    }

    private getRetirementReport() {
        this.clientService.getRetirementReport(this.fpStorageService.getClientId()).subscribe(result => {
            this.reportId = result.reportId;
            this.attempts = 0;
            this.checkReportStatus();
        });
    }
}
