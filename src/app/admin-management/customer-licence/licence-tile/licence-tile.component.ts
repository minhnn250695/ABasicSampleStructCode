import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input,
  OnDestroy, OnInit, Output
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// services
import { AdminService } from '../../admin.service';

// components
import { BaseEventComponent } from '../../../common/components/base-component';
// models
import { Result, UiEvent } from '../../../common/models';
import { ConfigService } from '../../../common/services/config-service';
import { CompanyMember, Customer, LicencePackage, LicencePackageType } from '../../models/index';

declare var $: any;

@Component({
  selector: 'licence-tile',
  templateUrl: './licence-tile.component.html',
  styleUrls: ['./licence-tile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LicenceTileComponent extends BaseEventComponent implements OnInit, OnDestroy {
  @Input("id") id: string;
  @Input() licence: LicencePackage;
  @Input() title: string;
  @Input() color: string = "dark-blue-background";
  @Input() type: string;
  @Output() licenceChange: EventEmitter<LicencePackage> = new EventEmitter();
  @Output("warning") warningEvent: EventEmitter<string> = new EventEmitter();

  private licenceEmitter: BehaviorSubject<LicencePackage> = new BehaviorSubject(null);

  constructor(private adminService: AdminService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }


  ngOnInit() {
    super.onBaseInit();
    this.init();
  }

  ngOnDestroy() {
    super.onBaseDestroy();

  }


  /* =====================================================================================================================
   * EVENT Handling
   * ===================================================================================================================== */
  transformEventToObservable(event: UiEvent): Observable<any> {

    if (!event) { return Observable.empty(); }

    if (event.event === LicenseTileEvent.PURCHASED_CHANGED) {
      return Observable.of(event.payload);
    }
    else if (event.event === LicenseTileEvent.UPDATE_PRICE) {
      return Observable.of(event.payload);
    }

    return Observable.empty();
  }

  handleEventResult(result: Result) {
    if (!result) return;

    if (!this.licence) {
      this.licence = new LicencePackage();
      this.licence.type = this.getType();
    }
    if (result.event === LicenseTileEvent.PURCHASED_CHANGED) {
      this.licence.purchased = this.purchased() + result.payload;

      // emit outside
      this.licenceEmitter.next(this.licence);
    }
    else if (result.event === LicenseTileEvent.UPDATE_PRICE) {
      this.licence.price = result.payload;
      // emit outside
      this.licenceEmitter.next(this.licence);
    }

    this.showError(null);
    this.detectChange();
  }

  handleError(result: any) {

  }


  /* =====================================================================================================================
   *  VIEW ACTION
   * ===================================================================================================================== */
  private increase() {
    this.proceedEvent(LicenseTileEvent.PURCHASED_CHANGED, 1);
  }

  private decrease() {
    if (!this.licence) return;

    let purchased = this.licence.purchased || 0;
    let assigned = (this.licence.assigned || 0);
    let canDecreased = (purchased > 1) && (purchased > assigned);
    if (canDecreased) this.proceedEvent(LicenseTileEvent.PURCHASED_CHANGED, -1);
  }

  private updatePrice(price) {
    this.showWarning();
    let newPrice = parseFloat(price);
    if (newPrice >= 0) {
      this.proceedEvent(LicenseTileEvent.UPDATE_PRICE, newPrice);
    }
    else {
      this.showError("Invalid price");
    }
  }

  /* =====================================================================================================================
  * Private Part
  * ===================================================================================================================== */
  private init() {
    this.licenceEmitter
      .subscribe((licence) => {
        if (licence) this.licenceChange.emit(licence);
      });

    // popover
    $('.close-popover').click((e) => {
      $('.popover').popover('hide');
    });

    $(`.save-change`).click((e) => {
      if (this.isMe(e)) {
        let newPrice = $('.popover #txtMonthlyPrice').val();
        this.updatePrice(newPrice);
        $('.popover').popover('hide');
      }
    });
  }

  private showWarning() {
    let popover = `#priceWarningPopover${this.id}`;
    let me = $(`#priceWarningPopover${this.id}`);
    me.popover('show');
  }

  private showError(err: string) {
    this.warningEvent.emit(err);
  }

  private getType(): number {
    if (this.type === 'BI') {
      return LicencePackageType.BI;
    }
    if (this.type === 'CRM') {
      return LicencePackageType.CRM;
    }
    if (this.type === 'PORTAL') {
      return LicencePackageType.PORTAL;
    }
  }

  private monthlyPrice() {
    return this.licence && this.licence.price || 0;
  }

  private purchased() {
    return this.licence && this.licence.purchased || 0;
  }

  private assigned() {
    return this.licence && this.licence.assigned || 0;
  }

  private isMe(e) {
    return this.isMyPopover(e, this.id, "licencePopover");
  }
}

enum LicenseTileEvent {
  PURCHASED_CHANGED,
  UPDATE_PRICE
}
