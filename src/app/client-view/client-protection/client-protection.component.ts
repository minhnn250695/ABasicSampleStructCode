import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from '@angular/router';

import { ClientViewService } from '../client-view.service';
import { PersonalProtectionService } from './personal-protection.service';

import { BaseComponentComponent } from '../../common/components/base-component/base-component.component';
import { ConfigService } from '../../common/services/config-service';
import { Contact } from './models';

@Component({
    selector: 'app-client-protection',
    templateUrl: './client-protection.component.html',
    styleUrls: ['./client-protection.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ClientProtectionComponent extends BaseComponentComponent implements OnInit, OnDestroy {

    constructor(
        private router: Router,
        configService: ConfigService,
        changeDetectorRef: ChangeDetectorRef) {
        super(configService, changeDetectorRef);
    }

    ngOnInit() {
        super.onBaseInit();
        this.onBaseInit();
    }

    ngOnDestroy() {
        this.onBaseDestroy();
    }

    private outcome() {
        this.router.navigate(['/client-view/protection/outcome']);
    }

    private policyDetails() {
        this.router.navigate(['/client-view/protection/policy-details']);
    }

    private overview() {
        this.router.navigate(['/client-view/protection/overview']);
    }

}