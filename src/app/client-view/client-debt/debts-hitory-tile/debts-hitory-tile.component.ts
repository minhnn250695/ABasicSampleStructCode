import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';

import { BalanceHistory, Period, SortedPeriod, KeyPair, Contact } from '../models';

// service
import { ClientDebtService } from '../client-debt.service';
import { ClientViewService } from '../../client-view.service';

import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';
import { ConfigService } from '../../../common/services/config-service';

@Component({
  selector: 'debts-history-tile',
  templateUrl: './debts-hitory-tile.component.html',
  styleUrls: ['./debts-hitory-tile.component.css']
})
export class DebtsHitoryTileComponent extends BaseComponentComponent implements OnInit, OnDestroy {

  @Input() history: BalanceHistory;
  @Input() contact: Contact;
  private displayList: KeyPair[] = [];

  private sortedPeriod: SortedPeriod = new SortedPeriod();
  private map: Map<string, number>;
  constructor(private clientDebtService: ClientDebtService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef)
  }


  ngOnInit() {
    this.onBaseInit();

    this.displayList = this.getPeriodKeyPair(1);
    this.clientDebtService.sortLengthEvent.next(1);
    this.clientDebtService.sortLengthEvent.subscribe(length => {
      this.displayList = this.getPeriodKeyPair(length);
      this.detectChange();
    });
  }

  ngOnDestroy() {
    this.onBaseDestroy();
  }

  private getPeriodKeyPair(sortLength: number): KeyPair[] {
    return this.sortedPeriod.getPeriodByLength(this.history.periodsAsTimeLine, sortLength).filter(data => data && data.key);
  }

  private getUrl() {
    return this.contact && this.contact.profileImageUrl;
  }

  private getFullName() {
    return this.contact && `${this.contact.firstName || ''} ${this.contact.lastName || ''}` || '';
  }
}
