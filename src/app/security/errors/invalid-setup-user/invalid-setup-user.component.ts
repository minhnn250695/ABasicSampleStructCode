import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare var $: any;

@Component({
    selector: 'app-invalid-setup-user',
    templateUrl: './invalid-setup-user.component.html',
    styleUrls: ['./invalid-setup-user.component.css']
})

export class InvalidSetupUserComponent implements OnInit {

    isMobile: boolean;

    constructor(private router: Router) {
    }

    ngOnInit() {
        $('body').addClass('full');

        if (navigator.userAgent.includes("Mobile")) {
            this.isMobile = true;
            $('body').css('padding-top', '0');
        }
        else this.isMobile = false;
        var self = this;
        setTimeout(function () {
            self.router.navigate(["/login"]);
        }, 7000);

    }
}
