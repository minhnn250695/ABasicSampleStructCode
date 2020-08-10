import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-setup-cancel',
    templateUrl: './setup-cancel.component.html',
    styleUrls: ['./setup-cancel.component.css']
})
export class SetupCancelComponent implements OnInit {

    constructor(private router: Router) {
    }

    ngOnInit() {
    }

    continue() {
        this.router.navigate(["/setup/step2"]);
    }

    cancel() {
        this.router.navigate(["/setup"]);
    }
}
