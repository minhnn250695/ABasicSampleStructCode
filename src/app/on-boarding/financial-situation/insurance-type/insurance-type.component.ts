import { Component, OnInit, Output, EventEmitter, OnDestroy } from "@angular/core";
import { OptionModel } from '../../models';
import { OnBoardingCommonComponent } from '../../on-boarding-common.component';
import { OnBoardingService } from '../../on-boarding.service';
import { InsuranceInfo, InsuranceBenefit, BenefitType } from '../../../client-view/client-protection/models';
import { HandleFinancialSituationService } from '../handle-financial-situation.service';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';

declare var $: any;
@Component({
  selector: "app-insurance-type",
  templateUrl: "./insurance-type.component.html",
  styleUrls: ["./insurance-type.component.css"]
})

export class InsuranceTypeComponent extends OnBoardingCommonComponent implements OnInit, OnDestroy {

  //#region Properties
  lifeInsuranceCompanies: any[];
  insuranceFromClick: InsuranceInfo = new InsuranceInfo();
  insuranceFromApi: InsuranceInfo = new InsuranceInfo();
  itemName: string;
  selectedBenefitId: string;
  productProviderId: string;
  generalPersonInsured: string;
  generalBenefitType: string;
  generalAmount: string;
  generalPremium: string;
  isEditBenefit: boolean;
  isBenefitChanged: boolean = false;

  primaryClientId: string;
  policyName: string;
  policyNumber: string;
  lifeInsuranceCompany: string;
  premiumPaidFrom: number;
  updateBenefitPosition: number;



  premiums: OptionModel<number>[] =
    [{ code: 100000000, name: "Personal expenses" }
      , { code: 100000004, name: "Superannuation" }
      , { code: 100000003, name: "Business" }];

  frequency: OptionModel<number>[] =
    [{ code: 100000000, name: "Monthly" }
      , { code: 100000001, name: "Quarterly" }
      , { code: 100000002, name: "Half annually" }
      , { code: 100000003, name: "Annually" }];

  benefitTypes: OptionModel<number>[] =
    [{ code: 100000000, name: "Life insurance" }
      , { code: BenefitType.TPD, name: "Permanent disability" }
      , { code: BenefitType.Trauma, name: "Trauma" }
      , { code: BenefitType.Income_Protection, name: "Income protection" }
      , { code: BenefitType.Child_Trauma, name: "Child trauma" }
      , { code: BenefitType.Business_Expenses, name: "Business expenses" }
      , { code: BenefitType.Accidental_Death, name: "Accidental Death" }
      , { code: BenefitType.Needlestick_Benefit, name: "Needlestick Benefit" }
      , { code: BenefitType.Accident_Benefit, name: "Accident Benefit" },];

  memberFirstNameList: OptionModel<string>[] = [];
  //#endregion

  //#region Constructors
  constructor(
    protected onboardingService: OnBoardingService,
    private confirmationDialogService: ConfirmationDialogService,
    private _financialService: HandleFinancialSituationService) {
    super();
  }

  ngOnInit(): void {
    super.checkUsingMobile();
    super.initPopover();
    // if house hold is empty => call it again
    if (!this.onboardingService.houseHold) {
      // cal api get house hold
      this.onboardingService.getHouseHold().subscribe(response => {
        this.memberFirstNameList = this.getListMemberFirstName(response);
        this.onboardingService.storeHouseHold(response);
      });
    } else {
      this.memberFirstNameList = this.getListMemberFirstName(this.onboardingService.houseHold);
    }

    this.lifeInsuranceCompanies = this.onboardingService.productProviders;
    this.primaryClientId = this.onboardingService.getPrimaryClientId();
    this.initInsuranceFromClick();
  }

  ngOnDestroy(): void {
    $('.popover').popover('hide');
  }
  //#endregion

  //#region Initial data
  initInsuranceFromClick() {
    let temp = this._financialService.initFinancial();
    if (!temp) { return; }
    this.itemName = this._financialService.getName();
    this.insuranceFromClick = { ...temp };
    this.insuranceFromApi = { ...temp };
    this.policyName = temp.name;
    this.productProviderId = temp.productProviderId;
  }
  //#endregion

  //#region View handlers
  /**
   * Only trigger when user type in value
   */
  onPolicyNameChange(name: string) {
    this.insuranceFromClick.name = name;
  }

  /**
   * DROP-DOWN LIST HANDLER
   */
  onBenefitTypeChange() {
    this.setPolicyName();
  }

  onErrorDiaglogConfirmClick(value: boolean) {
    if (value) {
      this._financialService.closeFinancialModal();
      this.deleteSelectedBenefit();
    }
  }

  /**
   * Add new benefit to the list
   */
  btnAddBenefitClick() {
    if (this.isMobile) { $('#add-benefit').removeClass('in') }
    if (!this.insuranceFromClick.benefits || this.insuranceFromClick.benefits.length < 1) {
      this.insuranceFromClick.benefits = [];
    }

    let newInsurance = new InsuranceBenefit();
    newInsurance.type = parseInt(this.generalBenefitType);
    newInsurance.lifeInsuredId = this.generalPersonInsured;
    newInsurance.amount = parseFloat(this._financialService.convertCurrencyToNumber(this.generalAmount));
    newInsurance.insurancePremium = parseFloat(this._financialService.convertCurrencyToNumber(this.generalPremium));

    this.insuranceFromClick.benefits.push(newInsurance);
    this.isBenefitChanged = true;
    this.setPolicyName();
    this.resetBenefit();
  }

  /**
   * Remove a benefit from a given position.
   */
  btnRemoveBenefitClick() {
    if (this.isMobile) { $('#add-benefit').removeClass('in') }

    let benefit = this.insuranceFromClick.benefits[this.updateBenefitPosition];
    if (benefit && benefit.id) {
      this.selectedBenefitId = benefit.id;

      // show warning message
      this.confirmationDialogService.showModal({
        title: "Warning",
        message: "Do you want to delete this benefit?",
        btnOkText: "Delete",
        btnCancelText: "Cancel"
      }).subscribe(response => this.onErrorDiaglogConfirmClick(response));
      return;
    } else {
      // remove item with a position
      this.insuranceFromClick.benefits.splice(this.updateBenefitPosition, 1);
      this.resetBenefit();
    }
  }

  /**
   * Call api to add new an insurance.
   */
  btnAddClick() {
    let form = this.createPersonalInsuranceForm();

    if (!form) { return; }

    this._financialService.closeFinancialModal();
    this._financialService.openLoading();
    this.onboardingService.addNewPersonalInsurance(this.primaryClientId, form)
      .subscribe(response => {
        if (response) {
          this.resetInsurance();
        }
        this._financialService.reloadInsurance();
      }, error => {
        console.log(error);
        this._financialService.closeLoading();
      });
  }

  /**
   * Call api to update an insurance.
   */
  btnEditClick() {
    let form = this.createPersonalInsuranceForm();

    if (!form) { return; }

    this._financialService.closeFinancialModal();
    this._financialService.openLoading();
    this.onboardingService.updatePersonalInsurance(this.primaryClientId, form).subscribe(response => {
      if (response) {
        this.resetInsurance();
      }
      this._financialService.reloadInsurance();

    }, error => {
      console.log(error);
      this._financialService.closeLoading();
    });
  }

  /**
   * Save changes of a benefit.
   */
  btnEditBenefitClick() {
    if (this.isMobile) { $('#add-benefit').removeClass('in') }

    if (this.updateBenefitPosition || this.updateBenefitPosition == 0) {
      let updateBenefit = this.insuranceFromClick.benefits[this.updateBenefitPosition];
      updateBenefit.amount = parseFloat(this._financialService.convertCurrencyToNumber(this.generalAmount));
      updateBenefit.type = parseInt(this.generalBenefitType);
      updateBenefit.lifeInsuredId = this.generalPersonInsured;
      updateBenefit.insurancePremium = parseFloat(this._financialService.convertCurrencyToNumber(this.generalPremium));

      this.isBenefitChanged = true;
      this.resetBenefit();
    }
  }

  /**
   * Edit selected an benefit
   * @param benefit 
   */
  benefitItemClick(position: number) {
    let benefit = this.insuranceFromClick.benefits[position];

    if (benefit) {
      this.generalAmount = this._financialService.convertNumberToCurrency(benefit.amount.toString());
      this.generalBenefitType = benefit.type.toString();
      this.generalPremium = this._financialService.convertNumberToCurrency(benefit.insurancePremium.toString());
      this.generalPersonInsured = benefit.lifeInsuredId;

      this.isEditBenefit = true;
      this.updateBenefitPosition = position;
    }

    if (this.isMobile) {
      $("#add-benefit").collapse('show');
    }
  }

  /**
   * Reset edit benefit to add new.
   */
  btnCancelEditBenefitClick() {
    this.resetBenefit();

    if (this.isMobile) {
      $("#add-benefit").collapse('hide');
    }
  }
  //#endregion

  //#region Helpers
  private createPersonalInsuranceForm(): InsuranceInfo {
    // if (!this.checkEmptyFields()) { return; }

    let form: InsuranceInfo = new InsuranceInfo();
    form = this.insuranceFromClick;

    form.name = this.policyName;
    form.number = this.insuranceFromClick.number ? this.insuranceFromClick.number : "TBD";
    form.lifeInsuranceCompany = this.insuranceFromClick.quickNotes;

    return form;
  }

  private deleteSelectedBenefit() {
    if (this.selectedBenefitId) {

      // call api to delete
      //   reset insurance sau khi delete
      this._financialService.openLoading();
      this.onboardingService.deleteBenefit(this.selectedBenefitId).subscribe(response => {
        this.resetInsurance();
        this._financialService.reloadInsurance();
      }, error => {
        console.log(error);
        this._financialService.closeFinancialModal();
      });
    }
  }

  private setPolicyName() {
    if (!this.insuranceFromClick.name || this.insuranceFromClick.name == '') {
      let names: string[] = [];

      this.insuranceFromClick.benefits.forEach(benefit => {
        let name = this.getBenefitTypeNameShortenForm(benefit.type);

        // didn't exist in array names
        if (names.indexOf(name) == -1) {
          names.push(name);
        }

      });

      this.policyName = names.join(', ');
    }
  }

  private resetBenefit() {
    this.isEditBenefit = false;
    this.updateBenefitPosition = undefined;
    this.generalAmount = "";
    this.generalBenefitType = "";
    this.generalPremium = "";
    this.generalPersonInsured = "";
  }

  removeUnSaveBenefits() {
    if (!this.insuranceFromClick || !this.insuranceFromClick.benefits || this.insuranceFromClick.benefits.length < 1) {
      return;
    }
    // remove all un-saved benefits depends on benefit id
    this.insuranceFromClick.benefits = this.insuranceFromClick.benefits.filter(benefit => benefit.id != undefined);
  }

  resetInsurance() {
    this.insuranceFromClick = new InsuranceInfo();
    this.policyName = undefined;
    this.selectedBenefitId = undefined;
    this.isBenefitChanged = false;
    this.resetBenefit();
  }

  /**
   * Return benefit name from benefit type
   * @param value - benefit type
   */
  getBenefitTypeName(value: number): string {
    switch (value) {
      case BenefitType.Life: return "Life insurance";
      case BenefitType.TPD: return "Permanent disability";
      case BenefitType.Trauma: return "Trauma";
      case BenefitType.Income_Protection: return "Income protection";
      case BenefitType.Child_Trauma: return "Child trauma";
      case BenefitType.Business_Expenses: return "Business expenses";
      case BenefitType.Accident_Benefit: return "Accident benefit";
      case BenefitType.Accidental_Death: return "Accidental death";
      case BenefitType.Needlestick_Benefit: return "Needlestick benefit";
    }
  }

  /**
   * Return benefit name from benefit type
   * @param value - benefit type
   */
  getBenefitTypeNameShortenForm(value: number): string {
    switch (value) {
      case BenefitType.Life: return "Life";
      case BenefitType.TPD: return "Permanent";
      case BenefitType.Trauma: return "Trauma";
      case BenefitType.Income_Protection: return "Income";
      case BenefitType.Child_Trauma: return "Child trauma";
      case BenefitType.Business_Expenses: return "Business";
      case BenefitType.Accident_Benefit: return "Accident benefit";
      case BenefitType.Accidental_Death: return "Accidental death";
      case BenefitType.Needlestick_Benefit: return "Needlestick";
    }
  }

  /**
   * Return benefit icon from benefit type
   * @param value - benefit type
   */
  getBenefitIcon(value: number): string {
    switch (value) {
      case BenefitType.Life: return "fas fa-life-ring fa-2x";
      case BenefitType.TPD: return "fas fa-wheelchair fa-2x";
      case BenefitType.Trauma: return "fas fa-briefcase-medical fa-2x";
      case BenefitType.Income_Protection: return "fas fa-umbrella fa-2x";
      case BenefitType.Child_Trauma: return "fas fa-child fa-2x";
      case BenefitType.Business_Expenses: return "fas fa-briefcase fa-2x";

      case BenefitType.Accident_Benefit: return "fas fa-briefcase fa-2x";
      case BenefitType.Accidental_Death: return "fas fa-briefcase fa-2x";
      case BenefitType.Needlestick_Benefit: return "fas fa-briefcase fa-2x";
    }
  }

  //#endregion


  //#region Input handler
  private onAmountFocus(value, field) {
    if (value && value != "") {
      this[field] = this._financialService.convertCurrencyToNumber(value);
    }
  }

  private onAmountFocusOut(value, field) {
    if (value && value != "") {
      this[field] = this._financialService.convertNumberToCurrency(value);
    }
  }
  //#endregion

  //#region Handle Data Changes
  private detectDataChanges() {
    if (this.insuranceFromApi.name !== this.policyName
      || this.insuranceFromApi.number !== this.insuranceFromClick.number
      || this.insuranceFromApi.productProviderId !== this.insuranceFromClick.productProviderId
      || this.insuranceFromApi.ownershipType !== this.insuranceFromClick.ownershipType
      || this.insuranceFromApi.premiumFrequency !== this.insuranceFromClick.premiumFrequency
      || this.isBenefitChanged)
      return true;
    return false;
  }
}
