import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';

// services
import { ClientViewService } from '../client-view.service';
import { ClientAssetService } from './client-asset.service';

declare var $: any;
@Component({
    selector: 'fp-client-asset',
    templateUrl: './client-asset.component.html',
    styleUrls: ['./client-asset.component.css']
})

export class ClientAssetComponent implements OnInit {

    private iSubscription: ISubscription;

    constructor(private router: Router,
        private clientViewService: ClientViewService,
        private clientAssetService: ClientAssetService) { }

    ngOnInit() {

        this.clientViewService.houseHoldObservable.subscribe(data => {
            if (data && data.members) {
                let houseHolds = data.members.map(item => {
                    item.isDisplayedInUi = true;
                    return item;
                });
                this.clientAssetService.houseHoldEvent.next(houseHolds);
            }
        });

        let list: Array<Observable<any>> = [];
        list.push(this.clientAssetService.houseHoldEvent);
        list.push(this.clientViewService.clientCalculationEvent);

        this.iSubscription = Observable.zip.apply(null, list).subscribe((results: any[]) => {
            if (this.iSubscription) {
                this.iSubscription.unsubscribe();
            }
            this.clientAssetService.clientCalculation = results && results[1];
            this.clientAssetService.houseHolds = results && results[0];
        });
    }
}