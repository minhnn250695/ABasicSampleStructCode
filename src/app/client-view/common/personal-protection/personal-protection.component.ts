import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, SimpleChange, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
// bases
import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';
import { ConfigService } from '../../../common/services/config-service';
import { ScenarioPersonalProtection, Contact, PersonalProtectionContact } from '../../models';
import { RefreshService } from '../../../common/services/refresh.service';

declare var $: any;
const COLOURS = [
  "#009E49", "#F472D0", "#00B294", "#002050", "#009E49", "#FFB900", "#27ae60", "#002050", "#68217A", "#EC008C",
  "#00BCF2", "#FFB900", "#EC008C", "#DD5900", "#00BCF2", "#F472D0", "#68217A", "#DD5900", "#27ae60", "#00B294",
];

@Component({
  selector: 'common-personal-protection',
  templateUrl: './personal-protection.component.html',
  styleUrls: ['./personal-protection.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalProtectionComponent extends BaseComponentComponent implements OnInit, OnDestroy {

  @Input("personalProtection") personalProtection: ScenarioPersonalProtection = new ScenarioPersonalProtection();
  @Input() isAdviceBuilderPage: boolean = true;

  private currentHouseHoldMember: PersonalProtectionContact = new PersonalProtectionContact();
  private currentCarouselSlide: number = 0;

  // ForMobile
  private screenHeight = window.innerHeight;
  private numberOfPrevIndicators: number = 0;
  private numberOfNextIndicators: number = 0;
  private prevIndicators = [];
  private nextIndicators = [];
  private prevHouseHoldMembers: PersonalProtectionContact[] = [];
  private nextHouseHoldMembers: PersonalProtectionContact[] = [];
  private showAvatar: boolean = true;

  @ViewChild('carouselImage') carouselImage: ElementRef;

  constructor(
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef,
    private refreshService: RefreshService,
    private router: Router) {
    super(configService, changeDetectorRef);
  }
  ngOnInit() {
    this.onBaseInit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isMobile) {
      if (changes.personalProtection && changes.personalProtection.currentValue && changes.personalProtection.currentValue.contacts && changes.personalProtection.currentValue.contacts.length > 0) {
        this.currentCarouselSlide = 0;
        this.currentHouseHoldMember = this.personalProtection.contacts[0];
        this.getIndicatorsDisplayedNumber();
        this.getDisplayedIndicators();
      }
    }
  }

  ngOnDestroy() {
    this.onBaseDestroy();
  }

  /***************************************************************
                          CLICK EVENTS HANDLER
   **************************************************************/
  thumpsupClick() {
    this.router.navigate(['/client-view/protection/outcome']);
  }

  private onSelectCarouselSide(index) {
    this.showHouseHoldMemberDetails(index);
  }

  private onChangeCarouselContact(contact) {
    let index = this.personalProtection.contacts.findIndex(item => item.fullName === contact.fullName);
    $('#myCarousel').carousel(index);
    this.showHouseHoldMemberDetails(index);
  }

  private changeIndicatorsByAction(action: any) {
    if (action == "prev") {
      if (this.currentCarouselSlide !== 0)
        this.currentCarouselSlide -= 1;
      else
        this.currentCarouselSlide = this.personalProtection.contacts.length - 1;
    }
    else {
      if (this.currentCarouselSlide != this.personalProtection.contacts.length - 1)
        this.currentCarouselSlide += 1;
      else
        this.currentCarouselSlide = 0;
    }
    this.showHouseHoldMemberDetails(this.currentCarouselSlide);
  }

  /***************************************************************
                        PROFILE IMAGE HANDLER
 **************************************************************/

  memberImgUrlForMobile(member: Contact) {
    if (member && member.profileImageUrl) {
      return this.baseApiUrl + member.profileImageUrl;
    }
    return '../../../../assets/img/default-profile.png';
  }

  private getClientFullName(member: PersonalProtectionContact): string {
    let name = '~';
    if (member && member.fullName)
      name = member.fullName;
    return name;
  }

  private isShowAvatar(member: PersonalProtectionContact) {
    return !this.isHasAvatar(member) && this.showAvatar;
  }

  private isHasAvatar(member: PersonalProtectionContact): boolean {
    return member && member.profileImageUrl ? true : false;
  }

  private getAvatarColor(member: PersonalProtectionContact) {
    if (member && member.fullName) {
      let len = COLOURS.length;
      let randomNum = Math.floor(member.fullName.length % len);
      return COLOURS[randomNum];
    }
  }
  private getName(member: Contact) {
    return member && member.fullName || '~';
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

  private showIndicatorControl(control: any) {
    let isShow = false;

    if (this.personalProtection.contacts && this.personalProtection.contacts.length > 0) {
      isShow = true;
    }

    return isShow;
  }

  private getIndicatorsDisplayedNumber() {
    if (this.personalProtection.contacts.length > 1) {
      if (this.personalProtection.contacts.length == 2) {
        this.numberOfPrevIndicators = 0;
        this.numberOfNextIndicators = 1;
      }
      else if (this.personalProtection.contacts.length == 3) {
        this.numberOfPrevIndicators = 1;
        this.numberOfNextIndicators = 1;
      }
      else if (this.personalProtection.contacts.length == 4) {
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
    if (this.personalProtection.contacts.length > 1) {

      this.prevHouseHoldMembers = [];
      this.nextHouseHoldMembers = [];
      this.prevIndicators = [];
      this.nextIndicators = [];

      for (var next = 1; next <= 2; next++) {
        if (next <= this.numberOfNextIndicators) {
          let index = this.currentCarouselSlide + next;
          if (index <= this.personalProtection.contacts.length - 1) {
            this.nextHouseHoldMembers.push(this.personalProtection.contacts[index]);
            this.nextIndicators.push(index);
          }
          else {
            let backToPrevIndex = index - this.personalProtection.contacts.length;
            this.nextHouseHoldMembers.push(this.personalProtection.contacts[backToPrevIndex]);
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
          let index = this.currentCarouselSlide - prev;
          if (index >= 0) {
            this.prevHouseHoldMembers.unshift(this.personalProtection.contacts[index]);
            this.prevIndicators.unshift(index);
          }
          else {

            let goToNextIndex = this.prevIndicators.indexOf(0) == -1 ? this.personalProtection.contacts.length - prev : this.personalProtection.contacts.length - 1;
            let isExisting = this.nextIndicators.indexOf(goToNextIndex);
            if (isExisting == -1 && goToNextIndex != this.currentCarouselSlide) {
              this.prevHouseHoldMembers.unshift(this.personalProtection.contacts[goToNextIndex]);
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

  private showHouseHoldMemberDetails(index: number) {
    this.currentCarouselSlide = index;
    this.currentHouseHoldMember = new PersonalProtectionContact();
    this.currentHouseHoldMember = this.personalProtection.contacts[index];
    this.changeProfile();
    this.getDisplayedIndicators();
  }

}
