import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild } from "@angular/core";
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { ClientViewService } from '../client-view.service';
import { ClientInsuranceService } from './client-insurance.service';
import { PersonalOverviewState } from '../client-protection/personal-overview/personal-overview.state';
import { ConfigService } from '../../common/services/config-service';
import { BaseEventComponent } from '../../common/components/base-component';
import { PersonalProtectionOutcomesModel, Result, UiEvent, PersonalInsuranceSummary, Contact, InsuranceInfo } from './models';
import { PersonalProtectionService } from '../client-protection/personal-protection.service';
import { FileFolderEntity } from '../client-doc-storage/models';
import { DocStorageService } from '../client-doc-storage/doc-storage.service';

declare var $: any;
@Component({
    selector: 'fp-client-insurance',
    templateUrl: './client-insurance.component.html',
    styleUrls: ['./client-insurance.component.css'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ClientInsuranceComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }
}