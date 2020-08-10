import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { ClientAsset, HouseHoldResponse } from '../../../client-view/models';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { OptionModel } from '../../models';
import { OnBoardingCommonComponent } from '../../on-boarding-common.component';
import { OnBoardingService } from '../../on-boarding.service';
import { HandleFinancialSituationService } from '../handle-financial-situation.service';
import { AssetType } from '../../../common/models/asset-type.enum';
import { CloseInsurancePolicyActionModel } from '../../../client-view/models/current-scenario/close-insurance-policy-action.model';

/**
 * CONSTRAINTS
 *
 * 1/ Receives contributions from your employer?
 *    => Only show if finpal_assettype = Superannuation (2)
 *
 * 2/ Do you make any contributions to this account?
 *    => Only show if finpal_assetpurpose = Investment (100,000,000)
 *
 * 3/ Amount, Frequency, Contribution Type => Only show if answer to Personal Contributions = Yes
 *
 * 4/ Set Contribution Frequency to Monthly
 *    => Personal Contributions = NO but Employer Contributions = Yes
 *
 * 5/ finpal_assetpurpose = Investment (100,000,000)
 *       Bank account: finpal_assettype = 1
 *       Rental property: finpal_assettype = 100,000,001
 *       Superannuation: finpal_assettype = 2
 *       Investment fund: finpal_assettype = 4
 *       Share portfolio: finpal_assettype = 100,000,002
 *       Income stream: finpal_assettype = 3
 *
 * 6/ finpal_assetpurpose = Lifestyle (100,000,002)
 *       Primary residence: finpal_assettype = 100,000,001
 *       Other: finpal_assettype = 8
 *
 * 7/ Contribution Type:
 *       If Pre-Tax, then Contribution Amount goes into finpal_contributionstaxed
 *       If Post-Tax then Contribution Amount goes into finpal_regularcontribution
 */

declare var $: any;
@Component({
  selector: 'app-asset-type',
  templateUrl: './asset-type.component.html',
  styleUrls: ['./asset-type.component.css']
})
export class AssetTypeComponent extends OnBoardingCommonComponent implements OnInit, OnDestroy {
  //#region Properties
  isShowEmployerQuestion: boolean = false;
  isShowPersonalQuestion: boolean = false;
  personalQuestionAnswer: boolean = false;
  employerQuestionAnswer: boolean = false;
  hasAssetName: boolean = false;

  // resources
  assetTypes: any;
  assetBalance: string = '';
  ownerShipTypes: Array<OptionModel<any>>;
  frequencyTypes: Array<OptionModel<number>>;
  contributionTypes: Array<OptionModel<number>> = [{ name: "Pre-Tax", code: 1 }, { name: "Post-Tax", code: 2 }];

  selectedAssetType: string = undefined;
  primaryClientId: string;

  // view
  itemName: string;
  assetFromApi: ClientAsset = new ClientAsset();
  assetFromClick: ClientAsset = new ClientAsset();
  contributionAmountFromApi: string;
  contributionAmount: string;
  contributionTypeFromApi: number;
  contributionType: number;
  ownership: string;
  frequency: number;
  //#endregion

  //#region Constructors
  constructor(
    protected onboardingService: OnBoardingService,
    private confirmationDialogService: ConfirmationDialogService,
    private financialService: HandleFinancialSituationService) {
    super();
  }

  ngOnInit(): void {
    this.primaryClientId = this.onboardingService.getPrimaryClientId();
    super.initPopover();
    this.initAssetTypeList();
    this.initAssetFromClick();
    this.initOwnershipTypes();
    this.initFrequencyTypeList();
  }

  ngOnDestroy(): void {
    $('.popover').popover('hide');
  }
  //#endregion

  //#region Initial data
  initAssetTypeList() {
    this.onboardingService.getAssetTypeList().subscribe(res => {
      if (res && res.success) {
        this.assetTypes = res.data && res.data.data;
      } else {
        this.showErrorPopup(res.error);
      }
    });
  }

  /**
   * Initiate `Asset` component when user click on an item in financial resources.
   */
  initAssetFromClick() {
    let temp = this.financialService.initFinancial();
    this.hasAssetName = this.assetFromClick.name ? true : false;
    if (!temp) {
      return;
    }
    this.assetFromApi = { ...temp };
    this.assetFromClick = { ...temp };

    this.personalQuestionAnswer = this.assetFromClick.personalContribution;
    this.employerQuestionAnswer = this.assetFromClick.employerContribution;

    this.selectedAssetType = this.assetFromClick.assetType;
    this.assetBalance = this.financialService.convertNumberToCurrency(this.assetFromClick.currentBalance + '');
    this.initContributionFromClick();
    this.initOwnerShipTypeFromClick(this.assetFromClick.ownershipType);
    // tslint:disable-next-line:radix
    this.manageAssetView(parseInt(temp.assetType), parseInt(temp.assetPurpose));

  }

  initOwnershipTypes() {
    let temp: Array<OptionModel<any>> = this.getOwnershipType();
    // if house hold is empty => call it again
    if (!this.onboardingService.houseHold) {
      // cal api get house hold
      this.onboardingService.getHouseHold().subscribe(response => {
        this.unshiftMemberToOwnership(temp, response);
        this.onboardingService.storeHouseHold(response);
      });
    } else {
      this.unshiftMemberToOwnership(temp, this.onboardingService.houseHold);
    }
  }

  initFrequencyTypeList() {
    this.frequencyTypes = this.getFrequencyType();
  }

  private unshiftMemberToOwnership(temp: any, houseHold) {
    let individual: Array<OptionModel<string>> = this.getPrimarySpouseFirstNameWithId(houseHold);
    individual.forEach(m => { temp.unshift(m); });
    this.ownerShipTypes = temp;
    // return temp;
  }

  initOwnerShipTypeFromClick(ownershipType) {
    if (!ownershipType) { return; }

    if (ownershipType !== "100000000") {
      this.ownership = ownershipType;
      return;
    } else {
      this.ownership = this.assetFromClick.primaryClientId;
      return;
    }
  }

  initContributionFromClick() {
    if (this.assetFromClick && this.assetFromClick.regularContributions && this.assetFromClick.regularContributions > 0) {
      this.assetFromClick.personalContribution = true;
      this.contributionAmount = this.financialService.convertNumberToCurrency(this.assetFromClick.regularContributions + '');
      this.contributionAmountFromApi = this.financialService.convertNumberToCurrency(this.assetFromClick.regularContributions + '');
      this.frequency = this.assetFromClick.contributionFrequency;
      this.contributionType = 2;
      this.contributionTypeFromApi = 2
    }
    else if (this.assetFromClick && this.assetFromClick.contributionsTax && this.assetFromClick.contributionsTax > 0) {
      this.assetFromClick.personalContribution = true;
      this.contributionAmount = this.financialService.convertNumberToCurrency(this.assetFromClick.contributionsTax + '');
      this.contributionAmountFromApi = this.financialService.convertNumberToCurrency(this.assetFromClick.contributionsTax + '');
      this.frequency = this.assetFromClick.contributionFrequency;
      this.contributionType = 1;
      this.contributionTypeFromApi = 1
    }
    else {
      this.assetFromClick.personalContribution = false;
      this.contributionAmount = undefined;
      this.contributionType = undefined;
      this.contributionTypeFromApi = undefined;
      this.frequency = undefined;
    }
  }
  //#endregion

  //#region Actions
  onAssetTypeChange() {
    if (!this.selectedAssetType) {
      return;
    }
    // update asset purpose    
    this.assetFromClick.assetType = this.selectedAssetType.toString();
    let assetPurpose = this.findAssetPurposeFromAssetType(parseInt(this.selectedAssetType));
    this.assetFromClick.assetPurpose = assetPurpose && assetPurpose.toString();

    this.manageAssetView(parseInt(this.selectedAssetType), assetPurpose);
    this.handleAssetName();

  }

  onOwnershipChange(event: any) {
    let value = event && event.target && event.target.value;
    if (!value) { return; }
    // Asset with ownership type 100000001 is Joint
    // set ownership type here
    if (value === "100000001" || value === "100000002" || value === "100000003" || value === "100000005")
      this.assetFromClick.ownershipType = value;
    else {
      this.assetFromClick.ownershipType = "100000000";
      this.assetFromClick.primaryClientId = value;
    }

    this.handleAssetName();
  }

  /**
   * Listen on question change
   * - 1: Employer Contributions Question
   * - 2: Personal Contributions Question
   * - if 2 = yes => show all frequency types
   * - if 1 = yes, 2 = false => contribution frequency = "Monthly"
   */
  onQuestionsChange(question: number, answer: boolean) {
    if (question === 1) {
      this.employerQuestionAnswer = answer;
    } else if (question === 2) {
      this.personalQuestionAnswer = answer;
    }

    if (this.employerQuestionAnswer === true && this.personalQuestionAnswer === false) {
      this.frequency = 100000000;
    } else {
      this.frequency = this.assetFromClick.contributionFrequency;
    }
  }

  btnAddItemClick(type: number) {
    if (!this.isValidToSave()) { return; }

    if (this.assetFromClick.personalContribution) {
      this.updateContributionAmountAndFrequency(parseInt(this.contributionType.toString()));
    }
    
    this.financialService.closeFinancialModal();
    this.financialService.openLoading();
    // add new asset
    if (type === 1) {
      this.onboardingService.addNewClientAsset(this.primaryClientId, this.assetFromClick).subscribe(response => {
        if (response.success) {
          this.resetValues();
          this.financialService.reloadAssets();
        } else {
          this.financialService.closeLoading();
          this.confirmationDialogService.showModal({
            title: "Error #" + response.error.errorCode,
            message: response.error.errorMessage,
            btnOkText: "OK"
          });
        }
      }, error => {
        this.financialService.closeLoading();
      });
    }
    // update asset
    if (type === 2) {
      this.onboardingService.updateClientAsset(this.primaryClientId, this.assetFromClick).subscribe(response => {
        if (response.success) {
          this.resetValues();
          this.financialService.reloadAssetAndIncomes();
        } else {
          this.financialService.closeLoading();
          this.financialService.openFinancialModal();
          this.confirmationDialogService.showModal({
            title: "Error #" + response.error.errorCode,
            message: response.error.errorMessage,
            btnOkText: "OK"
          });
        }
      }, error => {
        this.financialService.closeLoading();
      });
    }
  }
  //#endregion

  //#region Helpers
  resetValues() {
    this.assetFromClick = new ClientAsset();
    this.ownership = undefined;
    this.hasAssetName = false;
    this.selectedAssetType = undefined;
    this.assetBalance = "";

    this.resetContributions();
  }

  handleAssetName() {

    let assetTypeName: string;
    let ownershipName: string;
    // set asset type
    if (this.selectedAssetType) {
      let assetType = this.assetTypes.filter(asset => asset.value == parseInt(this.selectedAssetType));
      assetTypeName = assetType.length > 0 && assetType[0].label;
    }
    // set ownership name
    if (this.assetFromClick.ownershipType && this.assetFromClick.ownershipType !== "100000000") {
      ownershipName = this.ownerShipTypes.find(owner =>
        owner.code.toString() === this.assetFromClick.ownershipType).name;
    } else if (this.assetFromClick.primaryClientId) {
      ownershipName = this.ownerShipTypes.find(owner =>
        owner.code.toString() === this.assetFromClick.primaryClientId).name;
    }

    if (ownershipName && assetTypeName)
      this.assetFromClick.name = ownershipName + " - " + assetTypeName;
    else if (assetTypeName)
      this.assetFromClick.name = assetTypeName;
  }

  private findAssetPurposeFromAssetType(type: number) {
    if (type === AssetType.Other) {
      return 100000002;
    } else if (type === AssetType.Cash_Account || type === AssetType.Property || type === AssetType.Superannuation_Account
      || type === AssetType.Investment_Fund || type === AssetType.Direct_Shares || type === AssetType.Retirement_Income_Stream
      || type === AssetType.Whole_of_Life || type === AssetType.Endowment || type === AssetType.Insurance_Bond
      || type === AssetType.Fixed_Interest) {
      return 100000000;
    } else {
      return 100000002;
    }
  }


  private showErrorPopup(error: any) {
    let errorCode = error && error.errorCode || undefined;
    let errorMessage = error && error.errorMessage || 5000;
    let iSub: ISubscription = this.confirmationDialogService.showModal({
      title: "Error #" + errorCode,
      message: "" + errorMessage.slice(0, 200),
      btnOkText: "Ok"
    }).subscribe(() => { iSub.unsubscribe(); });
  }

  /** Manage questions appearance */
  private manageAssetView(assetType: number, assetPurpose: number) {
    if (assetPurpose === 100000000) {
      if (assetType === 2) {
        this.isShowEmployerQuestion = true;
      }
      else {
        this.isShowEmployerQuestion = false;
      }

      this.isShowPersonalQuestion = true;

    } else {
      this.resetContributions();
    }
  }

  private updateContributionAmountAndFrequency(type: number) {
    if (!type) { return; }
    if (type === 1) {
      if (this.personalQuestionAnswer === false) {
        this.assetFromClick.contributionsTax = 0;
      } else {
        this.assetFromClick.contributionsTax = parseInt(this.financialService.convertCurrencyToNumber(this.contributionAmount));
        this.assetFromClick.regularContributions = undefined;
      }
    }
    if (type === 2) {
      if (this.personalQuestionAnswer === false) {
        this.assetFromClick.regularContributions = 0;
      } else {
        this.assetFromClick.contributionsTax = undefined;
        this.assetFromClick.regularContributions = parseInt(this.financialService.convertCurrencyToNumber(this.contributionAmount));
      }
    }

    this.assetFromClick.contributionFrequency = this.frequency;
  }

  private isValidToSave(): boolean {
    if (!this.assetFromClick.name || !this.assetFromClick.currentBalance || !this.assetFromClick.ownershipType || !this.assetFromClick.assetType)
      return false;
    return true;
  }

  private resetContributions() {
    this.contributionAmount = undefined;
    this.contributionType = undefined;
    this.frequency = undefined;

    this.isShowEmployerQuestion = false;
    this.isShowPersonalQuestion = false;
    this.personalQuestionAnswer = false;
    this.employerQuestionAnswer = false;
  }
  //#endregion

  //#region Input handler
  private onAmountFocus(value, field) {
    if (value && value != "") {
      this[field] = this.financialService.convertCurrencyToNumber(value);
    }
  }

  private onAmountFocusOut(value, field) {
    if (value && value != "") {
      this[field] = this.financialService.convertNumberToCurrency(value);
    }
  }

  private onAmountKeyup(event, field) {
    let value = event.target && event.target.value;
    if (field !== "contributionAmount")
      this.assetFromClick[field] = parseInt(this.financialService.convertCurrencyToNumber(value));
  }

  //#endregion

  //#region Handle Input Validation and Button Clickable
  private detectSaveChanges() {
    if (this.assetFromApi.assetType !== this.assetFromClick.assetType
      || this.assetFromApi.ownershipType !== this.assetFromClick.ownershipType
      || this.assetFromApi.name !== this.assetFromClick.name
      || this.assetFromApi.currentBalance !== this.assetFromClick.currentBalance
      || this.assetFromApi.employerContribution !== this.assetFromClick.employerContribution
      || this.assetFromApi.personalContribution !== this.assetFromClick.personalContribution
      || (this.assetFromClick.personalContribution && this.detectContributionChanges()))
      return true;
    return false;
  }

  private detectContributionChanges() {
    if (this.contributionTypeFromApi !== this.contributionType
      || this.contributionAmountFromApi !== this.contributionAmount
      || this.assetFromApi.contributionFrequency !== this.frequency) {
      return true;
    }
    return false;
  }
  //#endregion
}