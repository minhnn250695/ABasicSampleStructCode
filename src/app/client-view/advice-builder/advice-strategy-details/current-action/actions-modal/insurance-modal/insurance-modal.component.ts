import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { InsurancePolicyActionModel, InsuranceBenefitActionModel, PremiumType, OwnershipType } from '../../../../../models';
import { OptionModel } from '../../../../../../on-boarding/models';
import { Router } from '@angular/router';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Observable } from 'rxjs';
import { IfObservable } from 'rxjs/observable/IfObservable';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
import { ISubscription } from 'rxjs/Subscription';
declare var $: any;

@Component({
  selector: 'insurance-modal',
  templateUrl: './insurance-modal.component.html',
  styleUrls: ['./insurance-modal.component.css'],
})
export class InsuranceModalComponent implements OnInit {
  @Input() updateInsurancePolicy: InsurancePolicyActionModel = new InsurancePolicyActionModel();
  @Input() activeInsuranceList: any[] = [];
  @Input() clientList: Array<OptionModel<string>> = [];
  @Input() frequencyList: any[] = [];
  @Input() insuranceCompanies: any[] = []
  @Input() inputBenefitList: InsuranceBenefitActionModel[] = [];
  @Input() superannuationAccounts: Array<OptionModel<any>> = [];

  @ViewChild('benefit') insuranceBenefitComponent: any;

  private premiumsPaidFromList: Array<OptionModel<any>> = [];
  private selectedPersonalInsuranceId: string = undefined;
  private insurancePolicy: InsurancePolicyActionModel = new InsurancePolicyActionModel();
  private benefitListChange: boolean = false;
  private iSub: ISubscription;
  OwnershipType = OwnershipType;
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private router: Router,
  ) { }


  ngOnInit() {
    $('#add-change-insurance').on('hidden.bs.modal', () => {
      this.resetInputValue();
      $('#insurance-details').click();
    });

    // if create new action we clear old input data
    $('#add-change-insurance').on('shown.bs.modal', () => {
      if (!this.adviceBuilderService.isUpdateAction) {
        this.insurancePolicy = new InsurancePolicyActionModel();
      }
    });
    this.premiumsPaidFromList = this.initPremiumsPaidFrom();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.updateInsurancePolicy && changes.updateInsurancePolicy.currentValue) {
      // clone insurance need to update into view
      this.insurancePolicy = JSON.parse(JSON.stringify(this.updateInsurancePolicy));
      this.setSuperannuationAccount();
      this.selectedPersonalInsuranceId = this.insurancePolicy.personalInsuranceId;
      // and check benefit list > 0 item
      if (this.insurancePolicy.benefits && this.insurancePolicy.benefits.length >= 0)
        this.inputBenefitList = this.insurancePolicy.benefits;
    }
  }

  ngOnDestroy() {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }

  private initPremiumsPaidFrom() {
    let list: Array<OptionModel<number>> = [];
    list.push({ code: PremiumsPaidFromType.PersonalExpenses, name: "Personal Expenses" });
    list.push({ code: PremiumsPaidFromType.Superannuation, name: "Superannuation" });
    return list;
  }

  private createNewInsurancePolicy() {
    let houseHoldID = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldID || !selectedStrategyID) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      this.insurancePolicy.actionTitle = this.insurancePolicy.policyName;
      // if user let benefit empty => asign it empty list
      if (this.insurancePolicy && !this.insurancePolicy.benefits)
        this.insurancePolicy.benefits = [];

      let observable: Observable<any>[] = [];
      if (this.adviceBuilderService.isChangeExistingPolicy) {
        observable.push(this.adviceBuilderService.createChangeInsurancePolicy(houseHoldID, selectedStrategyID, this.insurancePolicy));
      } else {
        observable.push(this.adviceBuilderService.createNewInsurancePolicy(houseHoldID, selectedStrategyID, this.insurancePolicy));
      }

      this.adviceBuilderService.showLoading()
      this.iSub = Observable.zip.apply(null, observable).subscribe(res => {
        if (this.iSub) {
          this.iSub.unsubscribe();
        }
        this.adviceBuilderService.hideLoading();
        if (res[0].success) {
          this.adviceBuilderService.reloadActionsAndInsurance();
        } else {
          this.handleErrorMessageService.handleErrorResponse(res[0]);
        }
      }, error => {
        console.error("create insurance policy error ", error);
        this.adviceBuilderService.hideLoading()
        this.handleErrorMessageService.handleErrorResponse(null);
      })
    }
  }

  private editInsurancePolicy() {
    let houseHoldID = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldID || !selectedStrategyID) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      // if user let benefit empty => asign it empty list
      if (this.insurancePolicy && !this.insurancePolicy.benefits) { this.insurancePolicy.benefits = []; }

      this.insurancePolicy.actionTitle = this.insurancePolicy.policyName;
      let observable: Observable<any>[] = [];
      if (this.adviceBuilderService.isChangeExistingPolicy) {
        observable.push(this.adviceBuilderService.updateChangeInsurancePolicy(houseHoldID, selectedStrategyID, this.insurancePolicy));
      } else {
        observable.push(this.adviceBuilderService.updateInsurancePolicy(houseHoldID, selectedStrategyID, this.insurancePolicy));
      }
      this.adviceBuilderService.showLoading();
      this.iSub = Observable.zip.apply(null, observable).subscribe(response => {
        if (this.iSub) {
          this.iSub.unsubscribe();
        }
        if (response[0].success) {
          // update actions and insurances
          this.adviceBuilderService.reloadActionsAndInsurance();
        } else {
          this.handleErrorMessageService.handleErrorResponse(response[0]);
        }
      });
    }
  }

  private selectInsuranceToChange() {
    let temporayInsuranceList = JSON.parse(JSON.stringify(this.activeInsuranceList));
    this.insurancePolicy = temporayInsuranceList.filter(insurance => insurance.id == this.selectedPersonalInsuranceId)[0];

    if (this.selectedPersonalInsuranceId) {
      this.adviceBuilderService.showLoading()
      let houseHoldID = localStorage.getItem('houseHoldID');
      let selectedStrategyID = localStorage.getItem('selectedStrategyID');
      this.adviceBuilderService.getActiveInsuranceDetails(houseHoldID, selectedStrategyID, this.selectedPersonalInsuranceId).subscribe(res => {
        this.adviceBuilderService.hideLoading()
        if (res.success) {
          this.insurancePolicy = res.data;

          this.setSuperannuationAccount();
          this.inputBenefitList = JSON.parse(JSON.stringify(this.insurancePolicy.benefits));

          if (this.adviceBuilderService.isUpdateAction) { // if update current existing policy
            // combine with current action ID
            let currentAction = JSON.parse(JSON.stringify(this.updateInsurancePolicy));
            this.insurancePolicy.actionId = currentAction.actionId;
            this.insurancePolicy.details = currentAction.details;
            this.insurancePolicy.reason = currentAction.reason;
            this.insurancePolicy.result = currentAction.result;
          }
        }
        else {
          this.handleErrorMessageService.handleErrorResponse(res);
        }
      });
    }

  }

  /**
   * only set clientAssetId = ownerID when ownership type is individual/joint
   */
  private setSuperannuationAccount() {
    if (this.insurancePolicy && this.insurancePolicy.ownershipType == OwnershipType.ASSET) {
      this.insurancePolicy.clientAssetId = this.insurancePolicy.ownerId;
    }
  }

  private premiumsPaidFromChange(event: any) {
    let paidFromCode = event.target && event.target.value;
    if (paidFromCode == PremiumsPaidFromType.PersonalExpenses) {
      this.insurancePolicy.clientAssetId = undefined;
    }
  }

  /**Sumary 
   * SuperannuationAccount Disabled 
   * when is changes existing policy mode
   * when premium pau from is not superannuation (premiumsPaidFrom == 1)
   * when  premiumsPaidFrom == 1 and have ownershiptype + ownership is not asset/trust/ super trust
  */
  private checkSuperannuationAccountDisabled() {
    let isDisabled = false;
    if (this.adviceBuilderService.isChangeExistingPolicy || (this.insurancePolicy && this.insurancePolicy.premiumsPaidFrom != 1)
      || (this.insurancePolicy.premiumsPaidFrom == 1 && this.insurancePolicy.ownershipType
        && (this.insurancePolicy.ownershipType != OwnershipType.ASSET
          && this.insurancePolicy.ownershipType != OwnershipType.TRUST
          && this.insurancePolicy.ownershipType != OwnershipType.SUPER_TRUST))
    ) {
      isDisabled = true;
    }
    return isDisabled;
  }

  private viewDetectChange() {
    let viewChange = false;
    if (this.adviceBuilderService.isUpdateAction) { // is update goal
      if (this.benefitListChange ||
        this.insurancePolicy.policyName != this.updateInsurancePolicy.policyName ||
        this.insurancePolicy.primaryClientId != this.updateInsurancePolicy.primaryClientId ||
        this.insurancePolicy.insuranceCompanyId != this.updateInsurancePolicy.insuranceCompanyId ||
        this.insurancePolicy.premiumsPaidFrom != this.updateInsurancePolicy.premiumsPaidFrom ||
        this.insurancePolicy.clientAssetId != this.updateInsurancePolicy.clientAssetId ||
        this.insurancePolicy.premiumFrequency != this.updateInsurancePolicy.premiumFrequency ||
        this.checkUndefinedValue(this.insurancePolicy.details) != this.checkUndefinedValue(this.updateInsurancePolicy.details) ||
        this.checkUndefinedValue(this.insurancePolicy.reason) != this.checkUndefinedValue(this.updateInsurancePolicy.reason) ||
        this.checkUndefinedValue(this.insurancePolicy.result) != this.checkUndefinedValue(this.updateInsurancePolicy.result)
      ) { viewChange = true }
    } else { viewChange = true; }

    return viewChange;
  }

  private checkUndefinedValue(value) {
    return !value ? "" : value;
  }

  private updateBenefitList(event) {
    this.insurancePolicy.benefits = event;
    this.benefitListChange = true;
  }

  private getInsuranceName() {
    let name = "N/A";
    let selectedInsurance = this.activeInsuranceList.filter(insurance => insurance.id == this.insurancePolicy.personalInsuranceId);
    if (selectedInsurance && selectedInsurance.length > 0) {
      name = selectedInsurance[0].name;
    }
    return name;
  }

  private resetInputValue() {
    this.insurancePolicy = new InsurancePolicyActionModel();
    this.selectedPersonalInsuranceId = undefined;
    this.inputBenefitList = [];
    this.insuranceBenefitComponent.collapseForm('collapseNew');
    this.insuranceBenefitComponent.collapseForm('collapseEdit');
    this.insuranceBenefitComponent.collapseForm('collapseDelete');
    this.adviceBuilderService.isUpdateAction = false; // mean create new
    this.benefitListChange = false;
  }
}

enum PremiumsPaidFromType {
  PersonalExpenses,
  Superannuation
}
