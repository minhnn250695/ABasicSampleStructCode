import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';

// components
import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';
import { ConfigService } from '../../../common/services/config-service';
// models
import { LicenceInfo, LicencePackageType, LicenceStatus } from '../../models';

declare var $: any;

@Component({
  selector: 'licence-status',
  templateUrl: './licence-status.component.html',
  styleUrls: ['./licence-status.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LicenceStatusComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  @Input() licence: LicenceInfo;
  @Output() changeLicence: EventEmitter<boolean> = new EventEmitter();
  @Output() extendTrial: EventEmitter<number> = new EventEmitter();

  constructor(configService: ConfigService, changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    this.initPopover();
    this.handlePopoverButton();
    $('.popover-content #txtExtendDayNum').addClass("abc");
  }

  ngOnDestroy() {
    super.onBaseDestroy();
  }

  isTrial() {
    if (this.licence)
      return this.licence.status === LicenceStatus.TRIAL;
  }

  isActive() {
    if (this.licence)
      return !this.isTrial() && this.licence.status === LicenceStatus.ACTIVE;
  }

  isInactive() {
    if (this.licence)
      return !this.isTrial() && this.licence.status === LicenceStatus.INACTIVE;
  }

  getPopLabel() {
    if (this.isActive()) return "Are you sure you want to disable?";
    if (this.isInactive()) return "Are you sure you want to enable?";
    if (this.isTrial()) return "Extend trial time";
  }

  getPopMessage() {
    if (this.isActive()) return "The user will lose access.";
    if (this.isInactive()) return "";
    if (this.isTrial()) return "How many days you want to add?";
  }

  getPopConfirmBtn() {
    if (this.isActive()) return "Disable";
    if (this.isInactive()) return "Enable";
    if (this.isTrial()) return "Extend trial time";
  }

  handlePopoverButton() {
    $('.close-popover').click(() => {
      this.closePopover();
    });

    $('.confirm-popover').click(() => {
      this.closePopover();
      if (this.isActive())
        this.changeLicence.emit(false);
      if (this.isInactive())
        this.changeLicence.emit(true);
      if (this.isTrial()) {
        let num = $('.popover #txtExtendDayNum').val();
        if (num) {
          // tslint:disable-next-line:radix
          this.extendTrial.emit(parseInt(num));
        }
      }
    });
  }

  getRemainingDays(): number {
    if (this.licence && this.licence.expiry) {
      let today = new Date();
      let expiredDay = new Date(this.licence.expiry);
      let diff = expiredDay.getTime() - today.getTime();
      return diff > 0 ? Math.ceil(diff / (1000 * 3600 * 24)) : 0;
    }
    return 0;
  }

  private closePopover() {
    $('[rel="popover"]').popover('hide');
  }
}
