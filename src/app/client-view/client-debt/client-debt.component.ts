import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';

// services
import { ClientViewService } from '../client-view.service';
import { ClientDebtService } from './client-debt.service';

declare var $: any;
@Component({
    selector: 'app-client-debt',
    templateUrl: './client-debt.component.html',
    styleUrls: ['./client-debt.component.css']
})

export class ClientDebtComponent implements OnInit {

    private iSubscription: ISubscription;

    constructor(private router: Router,
        private clientViewService: ClientViewService,
        private clientDebtService: ClientDebtService) { }

    ngOnInit() {
        this.clientViewService.houseHoldObservable.subscribe(data => {
            if (data && data.members) {
                let houseHolds = data.members.map(item => {
                    item.isDisplayedInUi = true;
                    return item;
                });
                this.clientDebtService.houseHoldsEvent.next(houseHolds);
            }
        });

    }
}