import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponentComponent } from '../../../common/components/base-component';

declare var $: any;

@Component({
    selector: 'app-invalid-company',
    templateUrl: './invalid-company.component.html',
    styleUrls: ['./invalid-company.component.css']
})

export class InvalidCompany extends BaseComponentComponent implements OnInit {

    isMobile: boolean;

    constructor(private router: Router) {
        super();
    }

    ngOnInit() {
        $('body').addClass('full');

        this.checkUsingMobile();
    }
}
