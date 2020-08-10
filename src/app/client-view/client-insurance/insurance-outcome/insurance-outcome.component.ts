import {
  Component, OnInit, OnDestroy, OnChanges, Input, ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';

import { BalanceHistory, Period, SortedPeriod, Contact, SortType, KeyPair, InsuranceType, PersonalProtectionOutcomesModel } from '../models';

import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';

// service
import { ClientInsuranceService } from '../client-insurance.service';
import { ClientViewService } from '../../client-view.service';
import { ConfigService } from '../../../common/services/config-service';
import { PersonalProtectionService } from '../../client-protection/personal-protection.service';
import { LoaderService } from '../../../common/modules/loader';
import { ClientDebtService } from '../../client-debt/client-debt.service';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ISubscription } from 'rxjs/Subscription';
import { LoadingSpinnerService } from '../../../common/components/loading-spinner/loading-spinner.service';

declare var $: any;
@Component({
  selector: 'fp-insurance-outcome',
  templateUrl: './insurance-outcome.component.html',
  styleUrls: ['./insurance-outcome.component.css'],
})
export class InsuranceOutcomeComponent extends BaseComponentComponent implements OnInit, OnDestroy {

  currentPersonalProtectionOutcomes: PersonalProtectionOutcomesModel[] = [];
  selectPersonalProtectionOutcome: any;
  popoverTitle = "Life insurance needs";
  householdId: string;
  selectedMember: Contact = new Contact();
  houseHoldMembers: Contact[] = [];
  insuranceType: string = InsuranceType.Death.toString();

  //#region for declare variable using in show currency and percentant
  private netDebtToClearPercentage: string = "";
  private incomeToCoverPercentage: string = "";
  private superContinuationBenefit: string = "";

  private incomeRequired: string = "";
  private additionalLumpSumSpending: string = "";
  private selfInsuranceFunds: string = "";
  private selfInsuranceIncome: string = "";
  //#endregion region for declare variable using in show currency and percentant

  constructor(private clientViewService: ClientViewService,
    private loadingService: LoadingSpinnerService,
    private confirmationDialogService: ConfirmationDialogService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    this.onBaseInit();
    this.calculateInsurance();
    this.clientViewService.houseHoldObservable.subscribe(res => {
      if (res && res.id) {
        this.householdId = res && res.id;
        this.houseHoldMembers = res && JSON.parse(JSON.stringify(res.members)) || [];
        this.selectedMember = this.houseHoldMembers[0];
        this.loadPersonalInsurance();
      }
    });
  }

  ngOnDestroy() {
    this.onBaseDestroy();

  }

  private loadPersonalInsurance() {
    this.clientViewService.getCurrentScenario(this.householdId).subscribe(response => {
      if (response.success && response.data.personalProtection && response.data.personalProtection.outcomes) {
        this.currentPersonalProtectionOutcomes = JSON.parse(JSON.stringify(response.data.personalProtection.outcomes));
        // update member's ontrack
        this.houseHoldMembers.map(mem => {
          let currentOutCome_mapMember = this.currentPersonalProtectionOutcomes.find(m => m.contactId === mem.id);
          mem.onTrack = currentOutCome_mapMember && currentOutCome_mapMember.onTrack;
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

      // covert number to percentant    
      if (this.selectPersonalProtectionOutcome) {
        // 1. selectPersonalProtectionOutcome.netDebtToClearPercentage
        this.netDebtToClearPercentage = this.convertToPercent(this.selectPersonalProtectionOutcome.netDebtToClearPercentage);

        // 4. selectPersonalProtectionOutcome.incomeToCoverPercentage
        this.incomeToCoverPercentage = this.convertToPercent(this.selectPersonalProtectionOutcome.incomeToCoverPercentage);

        // 5. selectPersonalProtectionOutcome.superContinuationBenefit
        this.superContinuationBenefit = this.convertToPercent(this.selectPersonalProtectionOutcome.superContinuationBenefit);

        // covert number to dollar
        // 2. selectPersonalProtectionOutcome.incomeRequired
        this.incomeRequired = this.convertToCurrency(this.selectPersonalProtectionOutcome.incomeRequired);

        // 3. selectPersonalProtectionOutcome.additionalLumpSumSpending
        this.additionalLumpSumSpending = this.convertToCurrency(this.selectPersonalProtectionOutcome.additionalLumpSumSpending);

        // 6. selectPersonalProtectionOutcome.selfInsuranceFunds
        this.selfInsuranceFunds = this.convertToCurrency(this.selectPersonalProtectionOutcome.selfInsuranceFunds);

        // 7. selectPersonalProtectionOutcome.selfInsuranceIncome
        this.selfInsuranceIncome = this.convertToCurrency(this.selectPersonalProtectionOutcome.selfInsuranceIncome);
      }

      // make sure these undefined value not show empty
      this.selectPersonalProtectionOutcome.timeRequiredYears = this.selectPersonalProtectionOutcome.timeRequiredYears || 0;
      this.selectPersonalProtectionOutcome.waitingPeriodMonths = this.selectPersonalProtectionOutcome.waitingPeriodMonths || 0;
      this.detectChange();
    }
  }

  private calculateInsurance() {
    if (!this.selectPersonalProtectionOutcome ||
      !this.validatePercentageValue(this.selectPersonalProtectionOutcome.netDebtToClearPercentage) ||
      !this.validatePercentageValue(this.selectPersonalProtectionOutcome.incomeToCoverPercentage) ||
      !this.validatePercentageValue(this.selectPersonalProtectionOutcome.superContinuationBenefit)
    ) { return; }

    let updateOutcome = this.currentPersonalProtectionOutcomes.find(outcome => outcome.contactId === this.selectedMember.id);
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
    this.loadingService.show();
    this.clientViewService.updatePersonalProtectionInsuranceOutcomes(updateOutcome, this.householdId).subscribe(response => {
      this.loadingService.hide();

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

  private onMemberSelecting(id: string) {
    this.findSelectedMember(id);
    this.handleViewChange();
  }

  private insuranceTypeSelecting(type: string) {
    this.insuranceType = type;
    this.handleViewChange();
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

  private findSelectedMember(id: string) {
    if (id && this.houseHoldMembers && this.houseHoldMembers.length > 0)
      this.selectedMember = this.cloneObject(this.houseHoldMembers.find(mem => mem.id === id));
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

  private convertToPercent(value) {
    if (!value) return '0%';
    return value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + '%';
  }

  private convertToCurrency(value) {
    if (!value) return '$0';
    return '$' + value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  private convertToNumber(value) {
    if (!value) return;
    return value.replace(/[^0-9.`-]+/g, "");
  }

  /**
   * Summary focusOnInput => CONVERT to NUMBER when focus on INPUT
   * @param value : value need to convert
   * @param variableName : variable need to set new value
   */
  private focusOnInput(value, variableName) {
    if (value && value != "") {
      switch (variableName) {
        case 'netDebtToClearPercentage': {
          this.netDebtToClearPercentage = this.convertToNumber(value);
          break;
        }
        case 'incomeToCoverPercentage': {
          this.incomeToCoverPercentage = this.convertToNumber(value);
          break;
        }

        case 'superContinuationBenefit': {
          this.superContinuationBenefit = this.convertToNumber(value);
          break;
        }

        case 'incomeRequired': {
          this.incomeRequired = this.convertToNumber(value);
          break;
        }
        case 'additionalLumpSumSpending': {
          this.additionalLumpSumSpending = this.convertToNumber(value);
          break;
        }

        case 'selfInsuranceFunds': {
          this.selfInsuranceFunds = this.convertToNumber(value);
          break;
        }

        case 'selfInsuranceIncome': {
          this.selfInsuranceIncome = this.convertToNumber(value);
          break;
        }
        default: return;
      }
    }
  }

  /**
   * Summary focusOutInput => CONVERT to CURRENCY/PERCENT when focus on INPUT
   * @param value : value need to convert
   * @param variableName : variable need to set new value
   */
  private focusOutInput(value, variableName) {
    if (value && value != "") {
      switch (variableName) {
        case 'netDebtToClearPercentage': {
          this.netDebtToClearPercentage = this.convertToPercent(this.selectPersonalProtectionOutcome.netDebtToClearPercentage);
          break;
        }
        case 'incomeToCoverPercentage': {
          this.incomeToCoverPercentage = this.convertToPercent(this.selectPersonalProtectionOutcome.incomeToCoverPercentage);
          break;
        }

        case 'superContinuationBenefit': {
          this.superContinuationBenefit = this.convertToPercent(this.selectPersonalProtectionOutcome.superContinuationBenefit);
          break;
        }

        case 'incomeRequired': {
          this.incomeRequired = this.convertToCurrency(this.selectPersonalProtectionOutcome.incomeRequired);
          break;
        }
        case 'additionalLumpSumSpending': {
          this.additionalLumpSumSpending = this.convertToCurrency(this.selectPersonalProtectionOutcome.additionalLumpSumSpending);
          break;
        }

        case 'selfInsuranceFunds': {
          this.selfInsuranceFunds = this.convertToCurrency(this.selectPersonalProtectionOutcome.selfInsuranceFunds);
          break;
        }

        case 'selfInsuranceIncome': {
          this.selfInsuranceIncome = this.convertToCurrency(this.selectPersonalProtectionOutcome.selfInsuranceIncome);
          break;
        }
        default: return;
      }
    }
  }

  /**
     * Summary keyupInput => Update value from view to variable when keyup on INPUT
     * @param value : value need to storage
     * @param variableName : variable need to storage
     */
  private keyupInput(value, variableName) {
    if (value && value != "") {
      switch (variableName) {
        case 'netDebtToClearPercentage': {
          this.selectPersonalProtectionOutcome.netDebtToClearPercentage = this.convertToNumber(value);
          this.validatePercentageValue(this.convertToNumber(value)); break;
        }
        case 'incomeToCoverPercentage': {
          this.selectPersonalProtectionOutcome.incomeToCoverPercentage = this.convertToNumber(value);
          this.validatePercentageValue(this.convertToNumber(value)); break;
        }

        case 'superContinuationBenefit': {
          this.selectPersonalProtectionOutcome.superContinuationBenefit = this.convertToNumber(value);
          this.validatePercentageValue(this.convertToNumber(value)); break;
        }

        case 'incomeRequired': {
          this.selectPersonalProtectionOutcome.incomeRequired = this.convertToNumber(value);
          break;
        }
        case 'additionalLumpSumSpending': {
          this.selectPersonalProtectionOutcome.additionalLumpSumSpending = this.convertToNumber(value);
          break;
        }

        case 'selfInsuranceFunds': {
          this.selectPersonalProtectionOutcome.selfInsuranceFunds = this.convertToNumber(value);
          break;
        }

        case 'selfInsuranceIncome': {
          this.selectPersonalProtectionOutcome.selfInsuranceIncome = this.convertToNumber(value);
          break;
        }
        default: return;
      }
    }
  }

  private validatePercentageValue(value) {
    if (value < 0 || value > 100) {
      let iSub: ISubscription = this.confirmationDialogService.showModal({
        title: "Invalid input",
        message: "The percentage must be in range 0 to 100",
        btnOkText: "Ok"
      }).subscribe(res => iSub.unsubscribe());
      return false
    }
    return true;
  }

  private checkTotalAmountYouHave(item) {
    if (item && (item.onTrack == 509000000 || item.onTrack == 509000002))
      return true;
    return false;
  }

}
