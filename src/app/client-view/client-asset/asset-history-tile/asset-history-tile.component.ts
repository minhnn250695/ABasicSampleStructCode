import {
  Component, OnInit, OnDestroy, OnChanges, Input, ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';

import { BalanceHistory, Period, SortedPeriod, Contact, SortType, KeyPair } from '../models';

import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';

// service
import { ClientAssetService } from '../client-asset.service';
import { ClientViewService } from '../../client-view.service';
import { ConfigService } from '../../../common/services/config-service';

@Component({
  selector: 'asset-history-tile',
  templateUrl: './asset-history-tile.component.html',
  styleUrls: ['./asset-history-tile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetHistoryTileComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  @Input() history: BalanceHistory;
  @Input() contact: Contact;

  private displayList: KeyPair[] = [];

  private sortedPeriod: SortedPeriod = new SortedPeriod();
  private map: Map<string, number>;
  constructor(private clientService: ClientViewService,
    private clientAssetService: ClientAssetService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef)
  }

  ngOnInit() {
    this.onBaseInit();

    this.displayList = this.getPeriodByLength(1);
    this.clientAssetService.sortTypeEvent.next(1);
    this.clientAssetService.sortTypeEvent.subscribe(length => {
      this.displayList = this.getPeriodByLength(length);
      this.detectChange();
    });

  }

  ngOnDestroy() {
    this.onBaseDestroy();

  }

  private getPeriodByLength(sortLength: number): KeyPair[] {
    return this.sortedPeriod.getPeriodByLength(this.history.periodsAsTimeLine, sortLength).filter(data => data && data.key);
  }

  private getUrl() {
    return this.getImgUrl(this.contact && this.contact.profileImageUrl);
  }
}
