import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { InsurancePolicyActionModel, InsuranceBenefitActionModel, PremiumType } from '../../../../../models';
import { OptionModel } from '../../../../../../on-boarding/models';
import { Router } from '@angular/router';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Observable } from 'rxjs';
import { IfObservable } from 'rxjs/observable/IfObservable';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
declare var $: any;

@Component({
  selector: 'insurance-view-modal',
  templateUrl: './insurance-modal.component.html',
  styleUrls: ['./insurance-modal.component.css'],
})
export class InsuranceViewModalComponent implements OnInit {
  @Input() insurancePolicy: InsurancePolicyActionModel = new InsurancePolicyActionModel();
  @Input() activeInsuranceList: any[] = [];
  @Input() clientList: Array<OptionModel<string>> = [];
  @Input() frequencyList: any[] = [];
  @Input() insuranceCompanies: any[] = []
  @Input() inputBenefitList: InsuranceBenefitActionModel[] = [];
  @Input() superannuationAccounts: any[] = [];

  @ViewChild('benefit') insuranceBenefitComponent: any;

  private premiumsPaidFromList: Array<OptionModel<any>> = [];
  private selectedPersonalInsuranceId: string;
  private benefitListChange: boolean = false;

  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private router: Router,
  ) { }


  ngOnInit() {
    this.premiumsPaidFromList = this.initPremiumsPaidFrom();
    $('#insurance-view').on('hidden.bs.modal', () => {
      $('#insurance-details-view').click();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.insurancePolicy && changes.insurancePolicy.currentValue) {
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

  private getInsuranceName(personalInsuranceId) {
    let name = "N/A";
    if (this.activeInsuranceList && this.activeInsuranceList.length > 0) {
      let selectedInsurance = this.activeInsuranceList.filter(insurance => insurance.id == personalInsuranceId);
      name = selectedInsurance[0] && selectedInsurance[0].name;
    }
    return name;
  }
  private returnPrimaryClientName(primaryClientId) {
    let name = "N/A";
    if (this.clientList && this.clientList.length > 0) {
      let client = this.clientList.filter(item => item.code == primaryClientId);
      name = client[0] && client[0].name;
    }
    return name;
  }

  private returnInsuranceCompanyName(insuranceCompanyId) {
    let name = "N/A";
    if (this.insuranceCompanies && this.insuranceCompanies.length > 0) {
      let company = this.insuranceCompanies.filter(item => item.id == insuranceCompanyId);
      name = company[0] && company[0].value;
    }
    return name;
  }

  private returnPremiumsPaid(premiumsPaidFrom) {
    let name = "N/A";
    if (this.premiumsPaidFromList && this.premiumsPaidFromList.length > 0) {
      let premium = this.premiumsPaidFromList.filter(item => item.code == premiumsPaidFrom);
      name = premium[0] && premium[0].name;
    }
    return name;
  }

  private returnSuperannuationAccount(clientAssetId) {
    let name = "N/A";
    if (this.superannuationAccounts && this.superannuationAccounts.length > 0) {
      let account = this.superannuationAccounts.filter(item => item.id == clientAssetId);
      name = account[0] && account[0].name;
    }
    return name;
  }

  private returnFrequency(premiumFrequency) {
    let name = "N/A";
    if (this.frequencyList && this.frequencyList.length > 0) {
      let frequency = this.frequencyList.filter(item => item.code == premiumFrequency);
      name = frequency[0] && frequency[0].name;
    }
    return name;
  }

  private initPremiumsPaidFrom() {
    let list: Array<OptionModel<number>> = [];
    list.push({ code: PremiumsPaidFromType.PersonalExpenses, name: "PersonalExpenses" });
    list.push({ code: PremiumsPaidFromType.Superannuation, name: "Superannuation" });
    return list;
  }

}

enum PremiumsPaidFromType {
  PersonalExpenses,
  Superannuation
}
