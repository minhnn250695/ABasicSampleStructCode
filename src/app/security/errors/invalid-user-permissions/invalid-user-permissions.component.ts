import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
    selector: 'app-invalid-user-permissions',
    templateUrl: './invalid-user-permissions.component.html',
    styleUrls: ['./invalid-user-permissions.component.css']
})

export class InvalidUserPermissionsComponent implements OnInit {

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
    }
}
