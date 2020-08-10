import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef, Input } from "@angular/core";
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RxUtils } from '../../../common/utils';
import { saveAs as importedSaveAs } from 'file-saver';
import { ISubscription } from 'rxjs/Subscription';

// component
import { BaseComponentComponent, BaseEventComponent } from '../../../common/components/base-component';

// entity
import { FileFolderEntity, PersonalProtectionOutcomesModel, UiEvent, Result } from '../../client-doc-storage/models';
import { Contact, ClientCalculation, TotalClientAssets, ClientAsset, InvestmentStyle, AssetPurpose, PersonalInsuranceSummary, InsuranceInfo, } from '../models';

// service
import { ClientViewService } from '../../client-view.service';
import { ClientInsuranceService } from '../client-insurance.service';
import { SpinnerLoadingService } from '../../../common/components/spinner-loading/spinner-loading.service';
import { CashFlowService } from '../../cash-flow/cash-flow.service';
import { AdviceBuilderService } from '../../advice-builder/advice-builder.service';
import { LoaderService } from '../../../common/modules/loader';
import { DocStorageService } from '../../client-doc-storage/doc-storage.service';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ConfigService } from '../../../common/services/config-service';
import { InsuranceOverviewState } from './insurance-overview.state';

declare var $: any;

const COLOURS = [
  "#009E49", "#F472D0", "#00B294", "#002050", "#009E49", "#FFB900", "#27ae60", "#002050", "#68217A", "#EC008C",
  "#00BCF2", "#FFB900", "#EC008C", "#DD5900", "#00BCF2", "#F472D0", "#68217A", "#DD5900", "#27ae60", "#00B294",
];

@Component({
  selector: 'fp-insurance-overview',
  templateUrl: './insurance-overview.component.html',
  styleUrls: ['./insurance-overview.component.css'],
})

export class InsuranceOverViewComponent extends BaseEventComponent implements OnInit, OnDestroy {

  @ViewChild("chooseFile") chooseFile: any;
  private insuranceTitle = { type: 1, title: "Insurances", textType: "Policy type", historyTitle: "" };
  // private selectedInsurance: InsuranceInfo = new InsuranceInfo();

  // varible use for overview data
  private iSubscription: ISubscription;
  private insuranceSummaryList: PersonalProtectionOutcomesModel[] = [];
  private state: InsuranceOverviewState = new InsuranceOverviewState();
  private houseHoldMembers: Contact[];
  private selectedContact: Contact;
  private selectedContactIndex: number;
  private houseHoldId: string;
  private selectedMemberId: string;
  private fullListInsurance: InsuranceInfo[]; // all insurance init for all contacts

  // ForMobile
  private displayedHouseHoldMember: Contact[] = [];
  private screenHeight = window.innerHeight;
  private numberOfPrevIndicators: number = 0;
  private numberOfNextIndicators: number = 0;
  private prevIndicators = [];
  private nextIndicators = [];
  private prevHouseHoldMembers: Contact[] = [];
  private nextHouseHoldMembers: Contact[] = [];
  private showAvatar: boolean = true;

  //#region Contructor
  constructor(private router: Router,
    private spinnerLoadingService: SpinnerLoadingService,
    private clientViewService: ClientViewService,
    private loaderService: LoaderService,
    private docStorageService: DocStorageService,
    private confirmationDialogService: ConfirmationDialogService,
    private clientInsuranceService: ClientInsuranceService,
    changeDetectorRef: ChangeDetectorRef,
    configService: ConfigService,
  ) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    this.onBaseInit();
    $('#total-cost-details').on('shown.bs.modal', function () {
      $('.modal-backdrop').remove();
    })

    this.clientViewService.houseHoldObservable.subscribe(res => {
      this.proceedEvent(PersonalOverviewEvent.LOAD_DATA, res);
    });

    this.clientViewService.houseHoldObservable.subscribe(houseHold => {
      this.houseHoldMembers = houseHold && houseHold.members
      this.houseHoldId = houseHold && houseHold.id;
      if (this.houseHoldMembers && this.houseHoldMembers.length > 0) {
        let keys = this.houseHoldMembers && this.houseHoldMembers.map(item => item.id);
        this.selectedContact = this.houseHoldMembers && this.houseHoldMembers[0]
        this.selectedContactIndex = 0;
        this.selectedMemberId = this.selectedContact && this.selectedContact.id;
        this.loadInsuranceDetails(keys);
      }
    });
  }

  ngOnDestroy() {
    this.onBaseDestroy();
  }

  //#region Event Handling
  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();
    let payload = event.payload;

    this.clientViewService.showLoading();
    switch (event.event) {
      case PersonalOverviewEvent.LOAD_DATA:
        this.state.updateData(payload);
        return this.loadDataObservable();
      default:
        return Observable.empty();
    }
  }

  handleEventResult(result: Result) {
    if (!result) return Observable.empty();
    let payload = result.payload;
    this.clientViewService.hideLoading();
    switch (result.event) {
      case PersonalOverviewEvent.LOAD_DATA:
        this.state.updatePersonalSummary(payload, this.isMobile);
        this.state.rows = this.calculateRow(this.state.personalInsurances, this.state.COLUMN_NUM);
        this.displayedHouseHoldMember = this.state.getDisplayedHouseHoldMember();
        this.getIndicatorsDisplayedNumber();
        this.getDisplayedIndicators();
        break;
      default:
        return;
    }

    this.detectChange();
  }

  handleError(error: any) {
    this.clientViewService.hideLoading();
  }

  private loadDataObservable() {

    return Observable.zip(
      this.clientInsuranceService.getPersonalInsuranceSummariesFor(this.state.getIds()),
      this.clientViewService.clientInsuranceService.getPersonalInsuranceObjectiveFor(this.state.getIds()),
      this.clientViewService.clientInsuranceService.getPersonalInsuranceOutcomesFor(this.state.getIds()),
      this.clientViewService.getCurrentScenario(this.state.houseHoldId),
      (res, res1, res2, res3) => { // map response to object and return
        return { summaries: res, objectivies: res1, outcomes: res2, scenario: res3 };
      },
    );
  }
  //#endregion event handling

  //#region Action get Insurance details

  private loadInsuranceDetails(keys: string[]) {
    if (!keys || keys && keys.length == 0) {
      // this.clientViewService.hideLoading();
      return;
    }

    // this.clientViewService.showLoading();
    let sub = this.clientInsuranceService.getInsurancePolicyDetailsFor(keys).subscribe(total => {
      this.fullListInsurance = total && total.getInsuranceInfos();
      this.filterClosedInsurance();
      // this.clientViewService.hideLoading();
    }, err => {
      // this.clientViewService.hideLoading();
    });

    this.rxUtils.addSubscription(sub);
  }

  private filterClosedInsurance() {
    //100000002 indicate this insurance was closed
    this.fullListInsurance = this.fullListInsurance.filter(x => x.policyStatus != 100000002);
    this.fullListInsurance.forEach(x => {
      x.benefits = x.benefits.filter(y => y.benefitStatus != 100000002)
    });
    return this.fullListInsurance;
  }
  //#endregion Action get Insurance details

  //#region handle slide insurance overview

  private showCarouselControl(control: any) {
    let isShow = false;
    var currentPosition = $('ol#insurance-indicators').find('li.active').data('slide-to');
    if (this.state.rows.length > 1) {
      if (control == "prev" && currentPosition != undefined && currentPosition != 0)
        isShow = true;
      else if (control == "next" && currentPosition != this.state.rows.length - 1)
        isShow = true;
    }
    else
      isShow = false;
    return isShow;
  }

  private changeCarouselSlide(insurance: any) {
    $('#insurance-carousel').carousel(insurance);
  }
  //#endregion handle slide insurance overview

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

  private onChangeHouseHoldMember(index: number) {
    this.selectedContactIndex = index;
    this.selectedContact = new Contact();
    this.selectedContact = this.displayedHouseHoldMember[index];
    this.state.getCurrentMemberInsurance(this.selectedContactIndex);
    this.changeProfile();
    this.getDisplayedIndicators();
  }

  private changeIndicator(member: Contact) {
    let index = this.displayedHouseHoldMember.findIndex(contact => contact.id === member.id);
    this.onChangeHouseHoldMember(index);
  }


  private changeIndicatorsByAction(action: any) {
    if (action == "prev") {
      if (this.selectedContactIndex !== 0)
        this.selectedContactIndex -= 1;
      else
        this.selectedContactIndex = this.displayedHouseHoldMember.length - 1;
    }
    else {
      if (this.selectedContactIndex != this.displayedHouseHoldMember.length - 1)
        this.selectedContactIndex += 1;
      else
        this.selectedContactIndex = 0;
    }
    this.onChangeHouseHoldMember(this.selectedContactIndex);
  }

  private showIndicatorControl(control: any) {
    let isShow = false;

    if (this.displayedHouseHoldMember.length > 1) {
      if (control == "prev" && this.selectedContactIndex != 0)
        isShow = true;
      else if (control == "next" && this.selectedContactIndex != this.displayedHouseHoldMember.length - 1)
        isShow = true;
    }
    else
      isShow = false;
    return isShow;
  }


  private getIndicatorsDisplayedNumber() {
    if (this.displayedHouseHoldMember.length > 1) {
      if (this.displayedHouseHoldMember.length == 2) {
        this.numberOfPrevIndicators = 0;
        this.numberOfNextIndicators = 1;
      }
      else if (this.displayedHouseHoldMember.length == 3) {
        this.numberOfPrevIndicators = 1;
        this.numberOfNextIndicators = 1;
      }
      else if (this.displayedHouseHoldMember.length == 4) {
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
    if (this.displayedHouseHoldMember.length > 1) {

      this.prevHouseHoldMembers = [];
      this.nextHouseHoldMembers = [];
      this.prevIndicators = [];
      this.nextIndicators = [];

      for (var next = 1; next <= 2; next++) {
        if (next <= this.numberOfNextIndicators) {
          let index = this.selectedContactIndex + next;
          if (index <= this.displayedHouseHoldMember.length - 1) {
            this.nextHouseHoldMembers.push(this.displayedHouseHoldMember[index]);
            this.nextIndicators.push(index);
          }
          else {
            let backToPrevIndex = index - this.displayedHouseHoldMember.length;
            this.nextHouseHoldMembers.push(this.displayedHouseHoldMember[backToPrevIndex]);
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
          let index = this.selectedContactIndex - prev;
          if (index >= 0) {
            this.prevHouseHoldMembers.unshift(this.displayedHouseHoldMember[index]);
            this.prevIndicators.unshift(index);
          }
          else {
            let goToNextIndex = this.prevIndicators.indexOf(0) == -1 ? this.displayedHouseHoldMember.length - prev : this.houseHoldMembers.length - 1;
            let isExisting = this.nextIndicators.indexOf(goToNextIndex);
            if (isExisting == -1 && goToNextIndex != this.selectedContactIndex) {
              this.prevHouseHoldMembers.unshift(this.displayedHouseHoldMember[goToNextIndex]);
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

enum PersonalOverviewEvent {
  LOAD_DATA
}