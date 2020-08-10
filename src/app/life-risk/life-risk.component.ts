import { Component, OnDestroy, OnInit } from "@angular/core";
import { Http } from '@angular/http';
import { Router } from "@angular/router";
import { ConfirmationDialogService } from '../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ConfigService } from '../common/services/config-service';

@Component({
    selector: "app-life-risk",
    templateUrl: "./life-risk.component.html",
    styleUrls: ["./life-risk.component.css"],
})

export class LifeRiskComponent implements OnInit, OnDestroy {

    cookieName: string = "RISKONLINESESSID";
    cookieValue: string = "9je4q4n2an6p2g5pvd6shlb386";
    expiredDate: Date = new Date('Tue, 19 Jan 2030 03:14:07 GMT');
    domain: string = "www.liferiskonline.com.au";
    cookie = 'UNKNOWN';
    loadIframe: boolean = false;

    constructor(private router: Router,
        private confirmationDialogService: ConfirmationDialogService,
        private http: Http,
        private configService: ConfigService) {

    }

    ngOnInit() { }

    ngOnDestroy() { }
}