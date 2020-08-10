import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

// services
import { ConfigService } from '../../common/services/config-service';
import { CashFlowService } from '../cash-flow/cash-flow.service';
import { ClientViewService } from '../client-view.service';
// models
import { CashFlowCal, Contact } from '../models';
// components
import { BaseComponentComponent } from '../../common/components/base-component/base-component.component';

declare var $: any;

const COLOURS = [
  "#009E49", "#F472D0", "#00B294", "#002050", "#009E49", "#FFB900", "#27ae60", "#002050", "#68217A", "#EC008C",
  "#00BCF2", "#FFB900", "#EC008C", "#DD5900", "#00BCF2", "#F472D0", "#68217A", "#DD5900", "#27ae60", "#00B294",
];

@Component({
  selector: 'app-client-personal',
  templateUrl: './client-personal.component.html',
  styleUrls: ['./client-personal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientPersonalComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  private readonly COL_NUM = 3;

  private houseHolds: Contact[] = [];
  private displayedHouseHolds: Contact[] = [];
  private totalCashFlow: CashFlowCal;
  private numList: number[];

  private currentHouseHoldMemberId: number = 0;
  private currentHouseHoldMember: Contact = new Contact();


  // Carousel
  private currentCarouselSlide: number = 0;
  private startDisplayedSlide: number = 0;
  private endDisplayedSlide: number = 0;

  // Image Carousel
  private indicatorsContainerWidth: number = 0;
  private indicatorsContainerNeededWidth: number = 0;
  // ForMobile
  private screenHeight = window.innerHeight;
  private numberOfPrevIndicators: number = 0;
  private numberOfNextIndicators: number = 0;
  private prevIndicators = [];
  private nextIndicators = [];
  private prevHouseHoldMembers: Contact[] = [];
  private nextHouseHoldMembers: Contact[] = [];
  private showAvatar: boolean = true;

  constructor(private clientService: ClientViewService,
    private cashFlowService: CashFlowService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    super.onBaseInit();
    this.onBaseInit();
    this.loadData();
  }

  ngOnDestroy() {
    this.onBaseDestroy();
  }

  /***************************************************************
                        INITIAL DATA HANDLER
 **************************************************************/

  private loadData() {
    // load cash flows functions
    let loadCashFlows = (ids: string[]) => {
      this.cashFlowService.getCashFlowsFor(ids).subscribe(total => {
        this.clientService.hideLoading();
        this.totalCashFlow = total;
        this.detectChange();
      }, err => {
        this.clientService.hideLoading();
      });
    };

    this.clientService.showLoading();
    this.clientService.houseHoldObservable.subscribe(res => {
      this.updateHouseHoldMemberList(res && res.members);
      let ids = res && res.members && res.members.map(item => item.id);
      this.detectChange();
      loadCashFlows(ids);
    });
  }

  private updateHouseHoldMemberList(newList: Contact[]) {
    if (newList) {
      this.houseHolds = newList.map((item, index) => {
        let oldItem = this.getOldItem(item.id);
        item.isDisplayedInUi = oldItem ? oldItem.isDisplayedInUi : true;
        return item;
      });

      // displayed row
      this.displayedHouseHolds = this.houseHolds.filter(item => item.isDisplayedInUi);
      this.numList = this.calculateRow(this.displayedHouseHolds, this.COL_NUM);

      if (this.houseHolds.length > 0) {
        this.currentHouseHoldMember = this.houseHolds[this.currentHouseHoldMemberId];
        this.getIndicatorsDisplayedNumber();
        this.getDisplayedIndicators();
      }
    } else {
      this.houseHolds = [];
      this.displayedHouseHolds = [];
      this.numList = [];
    }
  }

  /**
   *
   * @param event
   */
  // {position: this.id, checked: isChecked, client: this.client}
  private onSliderClick(event: any) {
    this.houseHolds = this.houseHolds.map(item => {
      if (item.id === event.client.id) {
        item.isDisplayedInUi = event.checked;
      }
      return item;
    });
    this.displayedHouseHolds = this.houseHolds.filter(item => item.isDisplayedInUi);
    this.numList = this.calculateRow(this.displayedHouseHolds, this.COL_NUM);
    this.detectChange();
  }

  private getCashFlow(client: Contact) {
    if (!this.totalCashFlow) return null;
    let id = client ? client.id : "";
    return this.totalCashFlow.get(id);
  }

  private insertClassRow(pos: any) {
    return (parseInt(pos) + 1) % 3 === 0;
  }

  private getOldItem(id: string) {
    if (!this.houseHolds) return null;
    return this.houseHolds.find(item => item.id === id);
  }

  private showHouseHoldMemberDetails(index: number) {
    this.currentHouseHoldMemberId = index;
    this.currentHouseHoldMember = new Contact();
    this.currentHouseHoldMember = this.houseHolds[index];
    this.changeProfile();
    this.getDisplayedIndicators();
    // this.detectChange();
  }

  /** ==================================================
   *                  AVATAR HANDLER
   =====================================================*/
  private getClientFullName(member: Contact): string {
    let name = '~';

    // if (member)
    //   return `${member.firstName} ${member.lastName}`;
    // return '';
    if (member)
      name = member.fullName;
    return name;
  }

  private isShowAvatar(member: Contact) {
    return !this.isHasAvatar(member) && this.showAvatar;
  }

  private isHasAvatar(member: Contact): boolean {
    return member && member.profileImageUrl ? true : false;
  }

  private getAvatarColor(member: Contact) {
    if (member) {
      let len = COLOURS.length;
      let randomNum = Math.floor(member.fullName.length % len);
      return COLOURS[randomNum];
    }
  }
  private getName(member: Contact) {
    return member && member.fullName || '~';
  }

  private memberImgUrl(member: Contact) {
    if (member && member.profileImageUrl) {
      return this.baseApiUrl + member.profileImageUrl;
    }
    return '../../../../assets/img/default-profile.png';
  }

  private changeProfile() {
    this.showAvatar = false;
    this.detectChange();

    setTimeout(() => {
      this.showAvatar = true;
      this.detectChange();
    });
  }

  /** ==================================================
 *                INDICATORS HANDLER
 =======================================================*/

  private changeIndicator(member: Contact) {
    let index = this.houseHolds.findIndex(contact => contact.id === member.id);
    this.showHouseHoldMemberDetails(index);
  }


  private changeIndicatorsByAction(action: any) {
    if (action == "prev") {
      if (this.currentHouseHoldMemberId !== 0)
        this.currentHouseHoldMemberId -= 1;
      else
        this.currentHouseHoldMemberId = this.houseHolds.length - 1;
    }
    else {
      if (this.currentHouseHoldMemberId != this.houseHolds.length - 1)
        this.currentHouseHoldMemberId += 1;
      else
        this.currentHouseHoldMemberId = 0;
    }
    this.showHouseHoldMemberDetails(this.currentHouseHoldMemberId);
  }

  private showIndicatorControl(control: any) {
    let isShow = false;

    if (this.houseHolds.length > 1) {
      if (control == "prev" && this.currentHouseHoldMemberId != 0)
        isShow = true;
      else if (control == "next" && this.currentHouseHoldMemberId != this.houseHolds.length - 1)
        isShow = true;
    }
    else
      isShow = false;
    return isShow;
  }


  private getIndicatorsDisplayedNumber() {
    if (this.houseHolds.length > 1) {
      if (this.houseHolds.length == 2) {
        this.numberOfPrevIndicators = 0;
        this.numberOfNextIndicators = 1;
      }
      else if (this.houseHolds.length == 3) {
        this.numberOfPrevIndicators = 1;
        this.numberOfNextIndicators = 1;
      }
      else if (this.houseHolds.length == 4) {
        this.numberOfPrevIndicators = 1;
        this.numberOfNextIndicators = 2;
      }
      else {
        this.numberOfPrevIndicators = 2;
        this.numberOfNextIndicators = 2;
      }
    }
  }

  private getDisplayedIndicators() {
    if (this.houseHolds.length > 1) {

      this.prevHouseHoldMembers = [];
      this.nextHouseHoldMembers = [];
      this.prevIndicators = [];
      this.nextIndicators = [];

      for (var next = 1; next <= 2; next++) {
        if (next <= this.numberOfNextIndicators) {
          let index = this.currentHouseHoldMemberId + next;
          if (index <= this.houseHolds.length - 1) {
            this.nextHouseHoldMembers.push(this.houseHolds[index]);
            this.nextIndicators.push(index);
          }
          else {
            let backToPrevIndex = index - this.houseHolds.length;
            this.nextHouseHoldMembers.push(this.houseHolds[backToPrevIndex]);
            this.nextIndicators.push(backToPrevIndex);
          }
        }
        else {
          this.nextHouseHoldMembers.push(undefined);
          this.nextIndicators.push(undefined);
        }
      }

      for (var prev = 1; prev <= 2; prev++) {
        if (prev <= this.numberOfPrevIndicators) {
          let index = this.currentHouseHoldMemberId - prev;
          if (index >= 0) {
            this.prevHouseHoldMembers.unshift(this.houseHolds[index]);
            this.prevIndicators.unshift(index);
          }
          else {
            let goToNextIndex = this.prevIndicators.indexOf(0) == -1 ? this.houseHolds.length - prev : this.houseHolds.length - 1;
            let isExisting = this.nextIndicators.indexOf(goToNextIndex);
            if (isExisting == -1 && goToNextIndex != this.currentHouseHoldMemberId) {
              this.prevHouseHoldMembers.unshift(this.houseHolds[goToNextIndex]);
              this.prevIndicators.unshift(goToNextIndex);
            }
          }
        }
        else {
          this.prevIndicators.unshift(undefined);
          this.prevHouseHoldMembers.unshift(undefined);
        }
      }

    }
  }

}
