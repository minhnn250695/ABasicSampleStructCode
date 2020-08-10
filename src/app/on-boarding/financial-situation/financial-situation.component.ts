import { Component, OnInit, ViewChild } from "@angular/core";
import { ISubscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { OnBoardingCommonComponent } from "../on-boarding-common.component";
import { OnBoardingService } from "../on-boarding.service";
import { ClientAsset, ClientDebt, HouseHoldResponse } from "../../client-view/models";
import { Observable } from "rxjs/Observable";
import { AssetTypeComponent } from './asset-type/asset-type.component';
import { DebtTypeComponent } from './debt-type/debt-type.component';
import { HandleFinancialSituationService } from './handle-financial-situation.service';
import { ClientIncome, ClientExpense, IncomeType, ExpenseType } from '../models';
import { InsuranceInfo } from '../../client-view/client-protection/models';
import { InsuranceTypeComponent } from './insurance-type/insurance-type.component';
import { FamilyCashFlowComponent } from './family-cashflow/family-cashflow.component';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { AssetTypeEnum } from '../models/asset-type.enum';
import { HandleErrorMessageService } from '../../common/services/handle-error.service';


declare var $: any;
@Component({
  selector: "app-financial-situation",
  templateUrl: "./financial-situation.component.html",
  styleUrls: ["./financial-situation.component.css"]
})
export class FinancialSituationComponent extends OnBoardingCommonComponent implements OnInit {

  //#region Properties
  @ViewChild("asset") asset: AssetTypeComponent;
  @ViewChild("debt") debt: DebtTypeComponent;
  @ViewChild("cashflow") cashFlow: FamilyCashFlowComponent;
  @ViewChild("insurance") insurance: InsuranceTypeComponent;

  private contacIds: string[] = [];

  onLoadComponent: boolean = true;
  selectedFinancialType: number;
  // resources
  assetList: ClientAsset[] = [];
  debtList: ClientDebt[] = [];
  insuranceList: InsuranceInfo[] = [];
  todayClientIncomeList: ClientIncome[] = [];
  todayClientExpenseList: ClientExpense[] = [];
  fixedExpense: string;
  discretionaryExpense: string;
  private iSubscription: ISubscription;
  //#endregion

  //#region Constructors
  constructor(
    protected confirmationDialogService: ConfirmationDialogService,
    protected router: Router,
    protected onboardingService: OnBoardingService,
    protected _financialService: HandleFinancialSituationService,
    protected handleErrorMessageService: HandleErrorMessageService) {
    super();

    this._financialService.handleOnOffLoading().subscribe(response => {
      this.showLoading(response);
    });

    /**
     * Handle on/off of financial modal
     * If other component wants to toggle on/off financial modal,
     * use show/closeFinancialModal() in HandleFinancialSituationService
     */
    this._financialService.handleOnOffFinancialModal().subscribe(response => {
      if (response) {
        $('.modal').modal('show');
      } else
        $('.modal').modal('hide');
    });

    // reload financial resources based on request
    this.iSubscription = this._financialService.handleReloadFinancialResources().subscribe(response => {
      if (response == 1) {
        // reload assets
        this.reloadFinancialResources(true, false, false, false, false);
      }
      else if (response == 2) {
        // reload debts
        this.reloadFinancialResources(false, true, false, false, false);
      }
      else if (response == 3) {
        // reload incomes
        this.reloadFinancialResources(false, false, true, false, false);
      }
      else if (response == 4) {
        // reload expenses
        this.reloadFinancialResources(false, false, false, true, false);
      }
      else if (response == 5) {
        // reload insurane
        this.reloadFinancialResources(false, false, false, false, true);
      }
      else if (response == 6) {
        // reload asset and income
        this.reloadFinancialResources(true, false, true, false, false);
      }
    });
  }

  ngOnInit(): void {
    this.myLoadingSpinner.closeImmediate();
    super.scrollTop();
    super.initPopover();
    super.initTooltip();

    this.onboardingService.updateCurrentStep(4);

    // bind house hold info to view
    // get and store all financial situation
    this.onboardingService.getHouseHold().subscribe(response => {
      this.initHouseHoldInfo(response);
      this.initFinancialResources();
    }, error => {
      this.onLoadComponent = false;
      let subcription = this.confirmationDialogService.showModal({
        title: "Error",
        message: "Internal service error",
        btnOkText: "Close"
      }).subscribe(() => subcription.unsubscribe());
    });
    $("#asset-modal").on('hidden.bs.modal', () => {
      this.asset.resetValues();
    });
  }

  ngOnDestroy() {
    if (this.iSubscription) {
      this.iSubscription.unsubscribe();
    }
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }
  //#endregion 

  //#region View Handlers
  /**
  * Set selecting type: 
  * 1: incomes/expenses (cashflow).
  * 2: assets
  * 3: debts
  * 4: insurance
  * @param option 
  */
  onTypeChange(option: number) {
    this.selectedFinancialType = option;
    this._financialService.resetCashFlow();
  }

  /**
   * 
   * @param cashFlow : income or expense
   * @param type 1 - income / 2 - expense
   */
  cashFlowClick(cashFlow: any, type: number): void {
    this.onTypeChange(1);
    if (!cashFlow) { // no cashFlow is add new
      if (this.cashFlow) {
        this.cashFlow.resetValues();
        // reset list showing asset
        this.cashFlow.income.showingAssets = this.onboardingService.allAssets;
      }
      return;
    } else { this.cashFlow.getItemName(); }

    if (type == 1) // income
      this.incomeClick(cashFlow);
    else if (type == 2)
      this.expenseClick(cashFlow);
  }

  incomeClick(income: ClientIncome) {
    this._financialService.saveFinancialNameFromClick(income.incomeName);
    // bind selected income to financial service
    this._financialService.saveFinancialFromClick(income, income.incomeType);
    // after income-type component is created
    if (this.cashFlow) {
      this.cashFlow.onTabChange(1);
      this.cashFlow.onIncomeClick();
    }
  }

  expenseClick(expense: ClientExpense) {
    this._financialService.saveFinancialNameFromClick(expense.expenseName);
    // bind selected income to financial service
    this._financialService.saveFinancialFromClick(expense, expense.expenseType);

    // after income-type component is created
    if (this.cashFlow) {
      this.cashFlow.onTabChange(2);
      this.cashFlow.onExpenseClick();

    }
  }

  assetClick(asset: ClientAsset): void {
    this.onTypeChange(2);
    // add new asset
    if (!asset) {
      if (this.asset) {
        this.asset.resetValues();
      }
      return;
    }

    // edit asset
    this._financialService.saveFinancialFromClick(asset);
    this._financialService.saveFinancialNameFromClick(asset.name);

    if (this.asset)
      this.asset.initAssetFromClick();
  }

  debtClick(debt: ClientDebt): void {
    this.onTypeChange(3);
    // add new debt
    if (!debt) {
      if (this.debt) {
        this.debt.resetDebt();
      }
      return;
    }

    // edit debt
    this._financialService.saveFinancialFromClick(debt);
    this._financialService.saveFinancialNameFromClick(debt.name);
    if (this.debt)
      this.debt.initDebtFromClick();
  }

  insuranceClick(insurance: InsuranceInfo): void {
    this.onTypeChange(4);
    this.insurance.resetInsurance();
    if (insurance) {
      // bind selected income to financial service
      this._financialService.saveFinancialFromClick(insurance);
      this._financialService.saveFinancialNameFromClick(insurance.name);

      this.insurance.removeUnSaveBenefits();
      this.insurance.initInsuranceFromClick();
    }
  }
  //#endregion

  //#region Apis
  reloadFinancialResources(asset: boolean, debt: boolean, income: boolean, expense: boolean, insurance: boolean) {
    // hide the previous (Income/asset/debt/insurance editor) component when get finacial resource
    this.selectedFinancialType = undefined;
    let iSub: ISubscription = this.financialResourceObservables(asset, debt, income, expense, insurance).subscribe(response => {
      // handle loading
      if (this.onLoadComponent)
        this.onLoadComponent = false;
      else
        this.showLoading(false);

      let index = 0;

      if (asset) {
        if (response[index].success == true && response[index].data && response[index].data.data)
          this.initAssetList(response[index++].data.data);
      }

      if (debt) {
        if (response[index].success == true && response[index].data && response[index].data.data)
          this.initDebtList(response[index++].data.data);
      }

      if (income) {
        if (response[index].success == true && response[index].data && response[index].data)
          this.initIncomeList(response[index++].data);
      }

      if (expense) {
        if (response[index].success == true && response[index].data && response[index].data)
          this.initExpenseList(response[index++].data);
      }

      if (insurance) {
        if (response[index].success == true && response[index].data && response[index].data.data)
          this.initInsuranceList(response[index++].data.data);
      }
    }, error => {
      console.log("error");
      console.log(error);
      this.showLoading(false);
    });
  }

  private financialResourceObservables(asset: boolean, debt: boolean, income: boolean, expense: boolean, insurance: boolean) {
    if (!this.contacIds) {
      return;
    }
    let observables: Observable<any>[] = [];

    if (asset) {
      observables.push(this.onboardingService.getListAssetFromContactIds(this.contacIds));
    }

    if (debt) {
      observables.push(this.onboardingService.getListDebtFromContactIds(this.contacIds));
    }

    if (income) {
      observables.push(this.onboardingService.getClientIncome(this.onboardingService.houseHold.id));
    }

    if (expense) {
      observables.push(this.onboardingService.getClientExpense(this.onboardingService.houseHold.id));
    }

    if (insurance) {
      observables.push(this.onboardingService.getInsuranceList(this.contacIds));
    }
    return Observable.zip.apply(null, observables);
  }

  private initFinancialResources() {
    // hide the previous (Income/asset/debt/insurance editor) component when get finacial resource
    this.selectedFinancialType = undefined;
    // first call api to get data for asset/debt
    this.financialAssetDebtObservables().subscribe(response_1 => {
      if (response_1) {
        let index_1 = 0;
        //asset  
        if (response_1[index_1].success == true && response_1[index_1].data && response_1[index_1].data.data)
          this.initAssetList(response_1[index_1++].data.data);
        //debt
        if (response_1[index_1].success == true && response_1[index_1].data && response_1[index_1].data.data)
          this.initDebtList(response_1[index_1++].data.data);

        // continue call api get data for income/expense/insurance
        this.financialIncomeExpenseInsuranceObservables().subscribe(response_2 => {

          // handle loading
          if (this.onLoadComponent) { this.onLoadComponent = false; }
          else { this.showLoading(false); }

          let index_2 = 0;
          //incomeExpense
          if (response_2[index_2].success == true && response_2[index_2].data && response_2[index_2].data) {
            this.initIncomeList(response_2[index_2].data.income);
            this.initExpenseList(response_2[index_2].data.expense);
          }
          // insurance
          if (response_2[index_2++].success == true && response_2[index_2].data && response_2[index_2].data.data)
            this.initInsuranceList(response_2[index_2].data.data);

        }, error => {
          console.log("error");
          console.log(error);
          this.showLoading(false);
        });
      }
    }, error => {
      console.log("error");
      console.log(error);
      this.showLoading(false);
    });
  }

  private financialAssetDebtObservables() {
    if (!this.contacIds) {
      return;
    }
    let observables: Observable<any>[] = [];
    observables.push(this.onboardingService.getListAssetFromContactIds(this.contacIds));
    observables.push(this.onboardingService.getListDebtFromContactIds(this.contacIds));

    return Observable.zip.apply(null, observables);
  }

  private financialIncomeExpenseInsuranceObservables() {
    if (!this.contacIds) {
      return;
    }
    let observables: Observable<any>[] = [];

    observables.push(this.onboardingService.getClientIncomeExpense(this.onboardingService.houseHold.id));
    observables.push(this.onboardingService.getInsuranceList(this.contacIds));

    return Observable.zip.apply(null, observables);
  }
  //#endregion

  //#region Helpers  
  private initHouseHoldInfo(houseHold: HouseHoldResponse) {
    if (!houseHold) { return; }
    this.contacIds = super.getListContactId(houseHold);

    // store spouse & primary first name
    this.onboardingService.storeHouseHold(houseHold);
  }

  private initAssetList(data: any) {
    if (!data) { return; }
    this.onboardingService.storeAssets(data);
    this.assetList = this.onboardingService.allAssets;
    let showAssets = this.assetList.filter(asset => asset.annualIncome > 0);
    this._financialService.submitIncomeShowingAssets(showAssets);
  }

  private initDebtList(data: any) {
    if (!data) { return; }
    this.onboardingService.storeDebt(data);
    this.debtList = this.onboardingService.allDebt;
    return;
  }

  private initIncomeList(data: any) {

    if (data) {
      data.forEach(income => {
        income.incomeFrequency = 100000003;
      });
    }
    this.assetList.forEach(asset => {
      if (asset.annualIncome > 0) {
        let temp: ClientIncome = new ClientIncome();
        // add investment income from asset to client income list
        temp.id = asset.id;
        temp.incomeType = IncomeType.Investment;
        temp.contactId = asset.primaryClientId;
        temp.incomeFrequency = 100000003;
        temp.incomeName = (asset.primaryClientFirstName || asset.primaryClientLastName || asset.owner) + "'s investment income";
        temp.ownershipType = asset.ownershipType;
        temp.grossIncome = asset.incomeDrawn;
        data.push(temp);
      }
      // else data.incomeName = (asset.primaryClientFirstName || asset.primaryClientLastName) + "'s investment income";
    });
    if (!data) { return; }
    this.onboardingService.storeIncome(data);
    this.todayClientIncomeList = this.onboardingService.allIncome;
    return;
  }

  private initExpenseList(data: any) {
    if (!data) { return; }
    this.onboardingService.storeExpense(data);
    this.todayClientExpenseList = this.onboardingService.allExpense;//.filter(expense => expense.);
    return;
  }

  private initHouseHoldSpendingList(data: any) {
    if (!data || !data.id) { return; }
    this.fixedExpense = data.lifeStyleExpensesFixed;
    this.discretionaryExpense = data.lifeStyleExpensesDiscretionary;
    return;
  }

  private initInsuranceList(data: any) {

    if (!data) { return; }
    this.onboardingService.storeInsurance(data);
    this.insuranceList = this.onboardingService.allInsurance;

    return;
  }

  private getClientFirstName(clientId: string): string {
    let firstName = "";
    let clients = this.onboardingService.houseHold.members.filter(member => member.id == clientId);
    firstName = clients.length > 0 ? clients[0].firstName : "";
    return firstName;
  }

  private navigateToStep(url: string) {
    this.router.navigate([url]);
  }

  setAssetIconClasses(assetType: string): string {
    let temp = "";
    switch (parseInt(assetType)) {
      case AssetTypeEnum.ZZDeprecatedCentrelinkBenefit: temp = "fa-hand-holding-usd"; break;
      case AssetTypeEnum.Property: temp = "fa-home-heart"; break;
      case AssetTypeEnum.SuperannuationAccount: temp = "fa-piggy-bank"; break;
      case AssetTypeEnum.RetirementIncomeStream: temp = "fa-hands-usd"; break;
      case AssetTypeEnum.InvestmentFund: temp = "fa-hand-holding-usd"; break;
      case AssetTypeEnum.DirectShares: temp = "fa-exchange"; break;
      case AssetTypeEnum.CashAccount: temp = "fa-university"; break;
      case AssetTypeEnum.WholeofLife: temp = "fa-gem"; break;
      case AssetTypeEnum.Endowment: temp = "fa-gem"; break;
      case AssetTypeEnum.InsuranceBond: temp = "fa-gem"; break;
      case AssetTypeEnum.FixedInterest: temp = "fa-gem"; break;
      case AssetTypeEnum.Other: temp = "fa-gem"; break;
      case AssetTypeEnum.Legacy: temp = "fa-pen-nib"; break;
      case AssetTypeEnum.Alternatives: temp = "fa-map-signs"; break;
    }
    return temp;
  }

  setDebtIconClasses(debtName: string): string {
    debtName = debtName.toLowerCase();
    let temp = "";
    if (debtName.includes("home mortgage")) temp = "fa-key";
    if (debtName.includes("rental property loan")) temp = "fa-sign";
    if (debtName.includes("credit card")) temp = "fa-credit-card-front";
    if (debtName.includes("car loan")) temp = "fa-car";
    if (debtName.includes("personal loan")) temp = "fa-file-signature";
    if (debtName.includes("investment loan")) temp = "fa-hand-holding-seedling";
    if (debtName.includes("other")) temp = "fa-usd-circle";
    return temp == "" ? "fa-sign" : temp;
  }

  getIncomeIconClass(type: number): string {
    switch (type) {
      case IncomeType.Investment: return "fa-dollar-sign";
      case IncomeType.GrossSalary: return "fa-money-bill-alt";
      case IncomeType.GovernmentBenefit: return "fa-hand-holding-usd";
      case IncomeType.Other: return "fa-money-check-alt";
    }
  }

  getExpenseIconClass(type: number): string {
    switch (type) {
      case ExpenseType.Fixed: return "fa-cart-arrow-down";
      case ExpenseType.Discretionary: return "fa-cart-arrow-down";
      case ExpenseType.Other: return "fa-cart-arrow-down";
    }
  }
  //#endregion

}
