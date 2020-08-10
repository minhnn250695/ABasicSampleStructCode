import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Contact, InsuranceCal, PersonalInsuranceSummary } from '../models';

import { Observable } from 'rxjs/Observable';
import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';
import { ConfigService } from '../../../common/services/config-service';
import { ClientViewService } from '../../client-view.service';

declare var $: any;

@Component({
  selector: 'personal-overview-tile',
  templateUrl: './personal-overview-tile.component.html',
  styleUrls: ['./personal-overview-tile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalOverviewTileComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  @Input() id: any;
  @Input() insurance: PersonalInsuranceSummary;
  @Input() contact: Contact;
  @Input() objective: any;
  @Input() outcome: any;

  private insuranceCal: InsuranceCal = new InsuranceCal();
  private clientCal: any;


  constructor(private router: Router, private clientViewService: ClientViewService, portalConfigService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(portalConfigService, changeDetectorRef);
  }

  ngOnInit() {
    this.onBaseInit();

    this.clientViewService.clientCalculationEvent.subscribe(res => {
      this.clientCal = res;
    });

    $('.close-popover').click((e) => {
      $('.popover').popover('hide');
    });
  }

  ngOnDestroy() {
    this.onBaseDestroy();
  }

  private isThumpsUp() {
    return this.insuranceCal.isThumpsUp(this.objective, this.outcome, this.clientCal);
  }

  private thumpsUpClick(e) {
    this.router.navigate(['/client-view/protection/outcome']);
  }

  private avatarUrl() {
    return this.contact && this.contact.profileImageUrl;
  }

  private getFullName() {
    return this.contact && `${this.contact.firstName || ''} ${this.contact.lastName || ''}` || '';
  }

  private addId(value: string) {
    return value + this.id;

  }
}
