import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  OnDestroy, OnInit,
} from '@angular/core';

// services
import { LoaderService } from '../../../common/modules/loader';
import { ClientViewService } from '../../client-view.service';
import { PersonalProtectionService } from '../personal-protection.service';

import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';

// models
import {
  Contact, InsuranceType, PersonalProtectionOutcomesModel
} from '../models';

import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ConfigService } from '../../../common/services/config-service';
import { ClientDebtService } from '../../client-debt/client-debt.service';

declare var $: any;

@Component({
  selector: 'app-insurance-outcome',
  templateUrl: './insurance-outcome.component.html',
  styleUrls: ['./insurance-outcome.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsuranceOutcomeComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  currentPersonalProtectionOutcomes: PersonalProtectionOutcomesModel[] = [];
  selectPersonalProtectionOutcome: any;
  popoverTitle = "Life insurance needs";
  householdId: string;
  selectedMember: Contact = new Contact();
  houseHoldMembers: Contact[] = [];
  insuranceType: string = InsuranceType.Death.toString();

  constructor(private clientViewService: ClientViewService,
    private personalService: PersonalProtectionService,
    private loaderService: LoaderService,
    private clientDebtService: ClientDebtService,
    private confirmationDialogService: ConfirmationDialogService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    super.onBaseInit();
    this.handlePopoverSaveClick();
    this.clientViewService.houseHoldObservable.subscribe(res => {
      if (res && res.id) {
        this.householdId = res && res.id;
        this.houseHoldMembers = res && [...res.members];
        this.selectedMember = this.houseHoldMembers[0];
        this.loadPersonalInsurance();
      }
    });
  }

  ngOnDestroy() {
    this.onBaseDestroy();
  }

  /**
   * VIEW Listener
   */
  onMemberSelecting(id: string) {
    this.findSelectedMember(id);
    this.handleViewChange();
  }

  insuranceTypeSelecting(type: string) {
    this.insuranceType = type;
    this.handleViewChange();
  }

  handlePopoverSaveClick() {
    $(".btn-save").click((e) => {
      let btnId = e.currentTarget.id;
      let valueInput = $(`.popover #${btnId}`).parent().prev("input").val(); // get value from input with btnId value
      if (this.validateInput(valueInput)) {
        let inputValue = parseFloat(valueInput);
        let updateOutcome = this.currentPersonalProtectionOutcomes.find(outcome => outcome.contactId === this.selectedMember.id);

        if (btnId && (inputValue || inputValue === 0) && updateOutcome) {
          // update value field from input
          switch (btnId) {
            default: break;
            case "debts-paid-off-btn":
              this.selectPersonalProtectionOutcome.netDebtToClearPercentage = inputValue;
              break;
            case "member-income-btn":
              this.selectPersonalProtectionOutcome.incomeRequired = inputValue;
              break;
            case "years-btn":
              this.selectPersonalProtectionOutcome.timeRequiredYears = inputValue;
              break;
            case "emergency-spending-btn":
              this.selectPersonalProtectionOutcome.additionalLumpSumSpending = inputValue;
              break;
            case "member-income-2-btn":
              this.selectPersonalProtectionOutcome.incomeToCoverPercentage = inputValue;
              break;
            case "months-btn":
              this.selectPersonalProtectionOutcome.waitingPeriodMonths = inputValue;
              break;
            case "superannuationPayments-btn":
              this.selectPersonalProtectionOutcome.superContinuationBenefit = inputValue;
              break;
            case "self-insure-btn":
              this.selectPersonalProtectionOutcome.selfInsuranceFunds = inputValue;
              break;
            case "self-insure-2-btn":
              this.selectPersonalProtectionOutcome.selfInsuranceIncome = inputValue;
              break;
          }

          // update outcome
          switch (this.insuranceType) {
            default:
              break;
            case InsuranceType.Death.toString():
              updateOutcome.termLifeCover = this.cloneObject(this.selectPersonalProtectionOutcome);
              break;
            case InsuranceType.Temporarily_Disabled.toString():
              updateOutcome.incomeProtectionAnalysis = this.cloneObject(this.selectPersonalProtectionOutcome);
              break;
            case InsuranceType.Permanently_Disabled.toString():
              updateOutcome.tpdCover = this.cloneObject(this.selectPersonalProtectionOutcome);
              break;
            case InsuranceType.Medical_Trauma.toString():
              updateOutcome.traumaCover = this.cloneObject(this.selectPersonalProtectionOutcome);
              break;
          }

          // call api to update
          this.clientViewService.showLoading();
          this.clientViewService.updatePersonalProtectionInsuranceOutcomes(updateOutcome, this.householdId).subscribe(response => {
            this.clientViewService.hideLoading();
            if (response.success) {
              // need to update for 2 variables currentPersonalProtectionOutcomes and selectPersonalProtectionOutcome
              let index = this.currentPersonalProtectionOutcomes.findIndex(mem => mem.contactId === response.data.contactId);
              if (index > -1) {
                this.currentPersonalProtectionOutcomes[index] = this.cloneObject(response.data);
                // update out store at service
                this.clientViewService.currentScenario.personalProtection.outcomes[index] = this.cloneObject(response.data);
              }

              this.selectPersonalProtectionOutcome = this.selectOutcomeObjectAndTitleFromInsuranceType(response.data);
              this.detectChange();
            } else {
              let iSub: ISubscription = this.confirmationDialogService.showModal({
                title: "Error format",
                message: "This entry can only contain decimal number.",
                btnOkText: "Ok"
              }).subscribe(() => { iSub.unsubscribe(); });
            }
          });
        }
      }
    });
  }


  private loadPersonalInsurance() {
    this.clientViewService.showLoading();
    this.clientViewService.getCurrentScenario(this.householdId).subscribe(response => {
      this.clientViewService.hideLoading();
      if (response.success && response.data.personalProtection && response.data.personalProtection.outcomes) {
        this.currentPersonalProtectionOutcomes = [...response.data.personalProtection.outcomes];
        // update member's ontrack
        this.houseHoldMembers.map(mem => {
          mem.onTrack = this.currentPersonalProtectionOutcomes.find(m => m.contactId === mem.id).onTrack;
        });
        // change view
        this.handleViewChange();
      }
    });
  }

  private handleViewChange() {
    if (this.selectedMember && this.currentPersonalProtectionOutcomes && this.insuranceType) {
      let outcomeFromMem = this.currentPersonalProtectionOutcomes.find(mem => mem.contactId === this.selectedMember.id);
      this.selectPersonalProtectionOutcome = this.selectOutcomeObjectAndTitleFromInsuranceType(outcomeFromMem);
      this.detectChange();
    }
  }

  private validateInput(valueInput) {
    let firstDotSignIndex = valueInput.indexOf(".");
    let lastDotSignIndex = valueInput.lastIndexOf(".");
    // have at least 2 dot sign in input string => wrong decimal input
    if ((firstDotSignIndex || firstDotSignIndex === 0) && (lastDotSignIndex || lastDotSignIndex === 0)
      && (firstDotSignIndex !== lastDotSignIndex))
      return false;
    return true;
  }

  private findSelectedMember(id: string) {
    if (id && this.houseHoldMembers && this.houseHoldMembers.length > 0)
      this.selectedMember = this.cloneObject(this.houseHoldMembers.find(mem => mem.id === id));
  }

  private selectOutcomeObjectAndTitleFromInsuranceType(outcome: PersonalProtectionOutcomesModel) {
    if (outcome) {
      switch (this.insuranceType) {
        default:
          this.popoverTitle = "Life insurance needs";
          return this.cloneObject(outcome.termLifeCover);
        case InsuranceType.Death.toString():
          this.popoverTitle = "Life insurance needs";
          return this.cloneObject(outcome.termLifeCover);
        case InsuranceType.Temporarily_Disabled.toString():
          this.popoverTitle = "Income protection needs";
          return this.cloneObject(outcome.incomeProtectionAnalysis);
        case InsuranceType.Permanently_Disabled.toString():
          this.popoverTitle = "Total & permanent disability needs";
          return this.cloneObject(outcome.tpdCover);
        case InsuranceType.Medical_Trauma.toString():
          this.popoverTitle = "Trauma insurance needs";
          return this.cloneObject(outcome.traumaCover);
      }
    }

  }
}
