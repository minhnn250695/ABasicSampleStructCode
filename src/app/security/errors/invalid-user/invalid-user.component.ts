import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
    selector: 'app-invalid-user',
    templateUrl: './invalid-user.component.html',
    styleUrls: ['./invalid-user.component.css']
})

export class InvalidUserComponent implements OnInit {

    individual: boolean;
    isMobile: boolean;

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit() {
        $('body').addClass('full');

        if (navigator.userAgent.includes("Mobile")) {
            this.isMobile = true;
            $('body').css('padding-top', '0');
        }
        else this.isMobile = false;

        this.route.queryParams.subscribe(params => {
            this.individual = params['individual'];
        });
    }
}
