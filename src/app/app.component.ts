import { Component, ViewEncapsulation } from '@angular/core';
// import { Router } from '@angular/router';
// import { UserAccount } from './security/user-account.model';
// import { SecurityService } from './security/security.service';
// import { FpStorageService } from './local-storage.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    encapsulation: ViewEncapsulation.None,
    providers: []
})
export class AppComponent {
    title = 'app';
}
