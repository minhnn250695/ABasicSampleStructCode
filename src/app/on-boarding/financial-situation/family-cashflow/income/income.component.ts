import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { OnBoardingCommonComponent } from '../../../on-boarding-common.component';
import { OnBoardingService } from '../../../on-boarding.service';
import { OptionModel, ClientIncome, IncomeType } from '../../../models';
import { ClientAsset } from '../../../../client-view/models';
import { Observable } from 'rxjs';
import { HandleFinancialSituationService } from '../../handle-financial-situation.service';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service'
import { ISubscription } from 'rxjs/Subscription';
import { OwnershipType } from "../../../../common/models";
declare var $: any;
@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.css']
})

export class IncomeComponent extends OnBoardingCommonComponent implements OnInit, OnDestroy {
  //#region Properties
  @Output("addNewAsset") addNewAsset: EventEmitter<boolean> = new EventEmitter();

  private primary_spouse_info: OptionModel<string>[];
  // get data when user click on an item from Income/Expense column
  incomeFromClick: ClientIncome = new ClientIncome();
  showingAssets: ClientAsset[];
  familyMembers: OptionModel<string>[];
  incomeSourceList: OptionModel<number>[];
  employmentTypeList: OptionModel<number>[];
  investmentTypeList: OptionModel<number>[];

  // view
  incomeUpdate: ClientIncome = new ClientIncome();
  grossAnnualIncome: string;
  grossAnnualIncomeFromApi: number;
  isMatchingAssetNull = false;
  //#endregion

  //#region Constructors
  constructor(protected onboardingService: OnBoardingService,
    private _financialService: HandleFinancialSituationService,
    private confirmationDialogService: ConfirmationDialogService) {
    super();
    this.showingAssets = [];
    this.familyMembers = [];
    this._financialService.getIncomeShowingAssets().subscribe(res => {
      if (res) {
        this.showingAssets = res;
      }
    })
  }

  ngOnInit() {
    // get data for family members field
    this.initFamilyMember();

    // init income sources list
    this.incomeSourceList = this.getIncomeSource();

    // init employment type list
    this.employmentTypeList = this.getEmployeeType();

    // init investment type list
    this.investmentTypeList = this.getInvestmentType();
    this.initIncomeFromClick();
  }

  ngOnDestroy() {

  }
  //#endregion

  //#region Initial data
  initIncomeFromClick() {
    // get selected income from the financial summary

    let temp = this._financialService.initIncome();
    if (!temp) { return; }
    this.incomeFromClick = { ...temp };
    this.incomeUpdate = this.incomeFromClick;
    this.grossAnnualIncome = this._financialService.convertNumberToCurrency(this.incomeUpdate.grossIncome + '');
    this.grossAnnualIncomeFromApi = this.incomeUpdate.grossIncome;
    this.showingAssets = this.onboardingService.allAssets.filter(asset => asset.primaryClientId == this.incomeUpdate.contactId)

    if (this.incomeUpdate.ownershipType == "100000001") {
      this.incomeUpdate.contactId = "100000001";
    }

  }


  initFamilyMember() {
    let temp: OptionModel<string>[] = [];
    // if house hold is empty => call it again
    if (!this.onboardingService.houseHold) {
      // cal api get house hold
      this.onboardingService.getHouseHold().subscribe(response => {
        temp = this.getPrimarySpouseFirstNameWithId(response);
        this.onboardingService.storeHouseHold(response);
      });
    } else {
      temp = this.getPrimarySpouseFirstNameWithId(this.onboardingService.houseHold);
    }
    this.primary_spouse_info = temp;
    temp.forEach(m => { this.familyMembers.unshift(m); });
    this.familyMembers.push({ name: "Joint", code: "100000001" });
  }

  /**
   * Set value for view "Gross annual income" based on "Income Source".
   */
  initGrossIncome() {
    if (!this.incomeFromClick) { return; }
    this.incomeUpdate.grossIncome = this.incomeFromClick.grossIncome;
  }
  //#endregion

  //#region View handlers
  /**
  * Add new asset when there is no matching yet
  */
  onBtnAddNewAsset() {
    this.addNewAsset.emit(true);
  }

  onFamilyMemberChange(value: any) {

    if (value == "100000001") {// mean Family value as Joint
      this.showingAssets = this.onboardingService.allAssets.filter(asset => asset.ownershipType == "100000001");
    } else {
      this.showingAssets = this.onboardingService.allAssets.filter(asset => (parseInt(asset.ownershipType) != OwnershipType.JOINT && asset.primaryClientId == value));
    }

  }

  btnAddClick(type: number) {
    this._financialService.closeFinancialModal();
    this._financialService.openLoading();

    this.createUpdateObseverblesFromIncomeSource(type).subscribe(responses => {
      let error = { errorCode: 0, errorMessage: "", isEmpty: false };
      responses.forEach(res => {
        if (res.success == false) {
          // reload incomes list
          this._financialService.closeLoading();
          error = res.error;
          return;
        }
      });
      if (error.errorCode == 0) {
        // Investment income => update client asset => also refresh asset list
        if (this.incomeUpdate.incomeType == IncomeType.Investment) {
          this._financialService.reloadAssetAndIncomes();
        } else {
          this._financialService.reloadIncomes();
        }
      }
      else {
        let subcription: ISubscription = this.confirmationDialogService.showModal({
          title: "Error #" + error.errorCode,
          message: "" + error.errorMessage,
          btnOkText: "Ok"
        }).subscribe(() => {
          subcription.unsubscribe();
        });
      }
      this.resetValues();
    });
  }
  //#endregion

  //#region Helpers
  createUpdateObseverblesFromIncomeSource(type: number): Observable<any> {
    let incomeSourceName = "";
    if (type == 1)// add new income
    {
      this.incomeUpdate.incomeFrequency = 100000003;
      let selectedMember = this.onboardingService.houseHold.members.find(member => member.id == this.incomeUpdate.contactId);
      incomeSourceName = this.incomeSourceList.find(incomeSource => incomeSource.code == this.incomeUpdate.incomeType).name;
      this.incomeUpdate.incomeName = selectedMember && (selectedMember.firstName || selectedMember.lastName) + "'s " + incomeSourceName.toLowerCase();
      this.incomeUpdate.houseHoldId = this.onboardingService.houseHold.id;
    }
    if (this.incomeUpdate.grossIncome < 0) {
      return Observable.of(null);
    }

    let observables: Observable<any>[] = [];

    // Investment income => update client asset
    if (this.incomeUpdate.incomeType == IncomeType.Investment) {

      let asset: ClientAsset = new ClientAsset();
      asset = this.showingAssets.find(asset => asset.id == this.incomeUpdate.id);
      if (!this.incomeUpdate.id || !asset) {
        return Observable.of(null);
      }
      asset.incomeDrawn = this.incomeUpdate.grossIncome;
      asset.incomeFrequency = 100000003;
      // selected member == "Joint"
      if (this.incomeUpdate.contactId == "100000001") {
        observables.push(this.onboardingService.updateClientAsset(this.onboardingService.getPrimaryClientId(), asset));
      } else
        // selected member = primary/spouse == this.incomeUpdate.contactId
        if (this.incomeUpdate.contactId && this.incomeUpdate.contactId != "100000001") {
          observables.push(this.onboardingService.updateClientAsset(this.incomeUpdate.contactId, asset));
        }
    }
    // Gross salary / Other / Goverment benefit =>  update income 

    if (this.incomeUpdate.incomeType == IncomeType.GrossSalary || this.incomeUpdate.incomeType == IncomeType.Other) {
      //#region currently HIDEN THIS FEATURE selected member == "Joint"
      // gross salary => update for both primary client and their spouse 
      // if (this.incomeUpdate.contactId == "100000001") {
      //   // each spouse have a half of gross income

      //   this.primary_spouse_info.forEach(element => {
      //     let spouseIncome = this.incomeUpdate;
      //     spouseIncome.contactId = element.code;
      //     spouseIncome.grossIncome = spouseIncome.grossIncome / 2;
      //     spouseIncome.incomeName = element.name + "'s " + incomeSourceName;
      //     if(type == 1){
      //       observables.push(this.onboardingService.addNewClientIncome(spouseIncome));

      //     }
      //   });
      // } else
      //#endregion

      // selected member = primary/spouse
      if (this.incomeUpdate.contactId && this.incomeUpdate.contactId != "100000001") {
        if (type == 1) {
          observables.push(this.onboardingService.addNewClientIncome(this.incomeUpdate));

        } else if (type == 2) {
          observables.push(this.onboardingService.updateClientIncome(this.incomeUpdate));
        }
      }
    }

    if (this.incomeUpdate.incomeType == IncomeType.GovernmentBenefit) { // goverment benefit
      // selected member == "Joint"
      if (this.incomeUpdate.contactId == "100000001") {
        this.incomeUpdate.contactId = this.onboardingService.getPrimaryClientId();
      }
      if (type == 1) { //add new goverment benefit
        observables.push(this.onboardingService.addNewClientIncome(this.incomeUpdate));
      } else if (type == 2) { //update goverment benefit
        observables.push(this.onboardingService.updateClientIncome(this.incomeUpdate));
      }
    }
    // zip all results as one and send to server.
    return Observable.zip.apply(null, observables);
  }

  resetValues(): void {
    this.incomeUpdate = new ClientIncome();
    this.incomeFromClick = undefined;
    this.grossAnnualIncome = undefined;
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

  private onAmountKeyup(event, field) {
    let value = event.target && event.target.value;
    this.incomeUpdate[field] = parseInt(this._financialService.convertCurrencyToNumber(value));
  }
  //#endregion

  // Handle data changes
  private detectDataChanges() {
    if (this.incomeFromClick.grossIncome != this.grossAnnualIncomeFromApi)
      return true;
    return false;
  }
}
