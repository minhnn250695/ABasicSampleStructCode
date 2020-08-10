import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';

// services
import { ConfigService } from '../../../../common/services/config-service';
import { RefreshService } from '../../../../common/services/refresh.service';
import { PersonalProtectionService } from '../../../client-protection/personal-protection.service';
import { ClientViewService } from '../../../client-view.service';

// models
import { InsuranceCal } from '../../../client-protection/models';
import { Contact, PersonalInsuranceOutcomes, TotalPersonalInsurance } from '../../../models';

// components
import { BaseComponentComponent } from '../../../../common/components/base-component/base-component.component';
import { IfObservable } from 'rxjs/observable/IfObservable';
import { PersonalInsuranceSummary } from '../../models/personal-insurance-summary.model';
import { InsuranceInfo } from '../../models';
import { ClientInsuranceService } from '../../client-insurance.service';

declare var $: any;
@Component({
  selector: 'insurance-member-overview',
  templateUrl: './insurance-member.component.html',
  styleUrls: ['./insurance-member.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})

export class InsuranceMemberComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  @Input() insurance: PersonalInsuranceSummary;
  @Input() id: number;
  @Input() contact: Contact;
  @Input() objective: any;
  @Input() outcome: any;
  @Output() selectedInsurance = new EventEmitter();

  imageUrl: string;
  isChangeRequired: boolean;

  private personalInsuranceOutcomes: PersonalInsuranceOutcomes;
  private totalPersonalInsurance: TotalPersonalInsurance;
  // private objective: any;
  private clientCal: any;

  // private insuranceCal: InsuranceCal = new InsuranceCal();

  constructor(private clientService: ClientViewService,
    private clientInsuranceService: ClientInsuranceService,
    private refreshService: RefreshService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    this.imageUrl = this.memberImgUrl();
    $('.close-popover').click((e) => {
      $('.popover').popover('hide');
    });
    this.onBaseInit();
    this.clientInsuranceService.totalPersonalInsuranceOutComeEvent.subscribe(res => {
      this.totalPersonalInsurance = res;
      let id = this.contact && this.contact.id;
      if (id) {
        this.personalInsuranceOutcomes = res && res.get(id);
      }
      this.detectChange();
    });

    this.clientService.clientCalculationEvent.subscribe(cal => {
      this.clientCal = cal;
      this.detectChange();
    });

    this.refreshService.refresh.subscribe(res => {
      if (res) {
        this.isChangeRequired = true;
      }
      if (this.isChangeRequired) {
        let imageUrlString = this.imageUrl && this.imageUrl.toString();
        let profileImgOldString = this.refreshService.profileImgOld && this.refreshService.profileImgOld.toString();
        // this.refreshService.setRefresh(false);
        if (imageUrlString && profileImgOldString && (profileImgOldString.includes(imageUrlString) || imageUrlString.includes(profileImgOldString) || imageUrlString === profileImgOldString)) {
          this.imageUrl = this.refreshService.profileImg;
          this.detectChange();
        }

        this.isChangeRequired = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  ngOnDestroy() {
    this.onBaseDestroy();
  }

  memberImgUrl() {
    let imageUrl = this.contact && this.contact.profileImageUrl;
    let profileImgOldString = this.refreshService.profileImgOld && this.refreshService.profileImgOld.toString();
    if (profileImgOldString && profileImgOldString.includes(imageUrl)) {
      imageUrl = this.refreshService.profileImg;
    }
    return imageUrl;
  }

  private selectedInsuranceChange(insurance: InsuranceInfo) {
    this.selectedInsurance.emit(insurance);
  }

  private addId(value: string) {
    return value + this.id;
  }
}
