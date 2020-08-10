import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../common/services/config-service';
import { ISubscription } from 'rxjs/Subscription';
import { ApiDataResult } from '../../common/api/api-data-result';

// Service
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { SecurityService } from '../../security/security.service';
import { ClientViewService } from '../client-view.service';

// Entity
import { BaseResponse, GoalsModel, ScenarioDetailsModel, AssetActionModel, CloseAssetActionModel, DebtActionModel, TransferAssetToDebtActionModel, InsurancePolicyActionModel, HouseHoldCashFlow, HouseHoldResponse, TransferAssetToAssetModel, ActionModel, DebtProjection, DebtProjectionDetails, InsuranceProjectionDetails, AssetProjectionDetails, ContributeAssetActionModel, ContributeDebtActionModel, DrawFundFromDebtModel, GoalType, CashFlowDetails } from '../models';
import { Pairs } from '../../revenue-import/models';
import { ClientIncome } from '../../on-boarding/models';
import { Report } from '../../document-generator/generate-report/report.model';
import { CancelInsurancePolicyActionModel } from '../models/current-scenario/cancel-insurance-policy-action.model';
import { DrawFundFromAssetModel } from '../models/current-scenario/draw-fund-from-asset.model';
import { max } from 'rxjs/operator/max';

@Injectable()
export class AdviceBuilderService {
  private companyPattern: string;
  public selectedScenario: ScenarioDetailsModel = new ScenarioDetailsModel();
  public familyMembers: FamilyMembers[] = [];
  public strategyList: ScenarioDetailsModel[] = [];
  public selectedStrategyIndex: number = 0;
  public clientIncomeSource: ClientIncome[] = [];
  public houseHold: HouseHoldResponse = new HouseHoldResponse();
  public isChangeExistingPolicy: boolean = false;
  public isUpdateAction: boolean = false;
  public debtProjections: DebtProjectionDetails[] = [];
  public insuranceProjection: InsuranceProjectionDetails[] = [];
  public assetProjections: AssetProjectionDetails[] = [];
  public cashFlowDetails: CashFlowDetails[] = [];
  public actionReadOnly: boolean = true;
  // handle observable event
  private reloadData = new Subject<any>();
  private selectedAction: BehaviorSubject<ActionModel> = new BehaviorSubject(null);
  // variable storage reload data
  public actions: ActionModel[];
  public notClosedAssetList: Pairs[];
  public debtList: Pairs[];
  public activeInsuranceList: Pairs[];
  public closedAssetList: Pairs[] = [];
  public closedInsuranceList: Pairs[] = [];
  constructor(
    private clientService: ClientViewService,
    private httpClient: HttpClient,
    private configService: ConfigService,
    private confirmationDialogService: ConfirmationDialogService,
    private securityService: SecurityService
  ) {
    this.companyPattern = configService.getCompanyPattern();
  }

  //#region API get Method
  public getScenarioList(houseHoldId: string): Observable<any> {
    if (!houseHoldId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios`;
    return this.httpClient.get<any>(apiUrl);
  }

  public getScenarioList_v2(houseHoldId: string): Observable<any> {
    if (!houseHoldId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios`;
    return this.httpClient.get<any>(apiUrl).map(response => {
      if (response.success) {
        this.strategyList = response.data;
        return { success: true, response }
      } else if (response.sessionExpired) { return response; }

      return { success: false, response }
      // TODO: Handle return success = false here
    })
  }

  public getScenarioDetails(houseHoldId: string, scenarioID: string): Observable<any> {
    if (!houseHoldId || !scenarioID) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioID}`;
    return this.httpClient.get<any>(apiUrl);
  }

  public getClientIncomesByScenarioId(householdId: string, scenarioId: string): Observable<any> {
    if (!householdId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}/incomes`;
    return this.httpClient.get<any>(apiUrl);
  }

  public getClientIncomeDetails(householdId: string, scenarioId: string, incomeId: string): Observable<any> {
    if (!householdId || !scenarioId || !incomeId) return;
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}/incomes/${incomeId}`;
    return this.httpClient.get<any>(apiUrl);
  }

  public getGoalDetailsById(householdId: string, scenarioId: string, goalId: string): Observable<any> {
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}/goals/${goalId}`;
    return this.httpClient.get<any>(apiUrl);
  }

  public getInsuraceCompany(): Observable<any> {
    let apiUrl = `api/${this.companyPattern}CRMData/ProductProviders`;
    return this.httpClient.get<any>(apiUrl);
  }

  public getActionDetailByActionID(householdId: string, scenarioId: string, actionId: string): Observable<any> {
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}/actions/${actionId}`;
    return this.httpClient.get<any>(apiUrl);
  }

  public getAssetProjectionByScenarioId(householdId: string, scenarioId: string): Observable<any> {
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}/assetProjections`;
    return this.httpClient.get<any>(apiUrl);
  }

  public getDebtProjectionByScenarioId(householdId: string, scenarioId: string): Observable<any> {
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}/debtProjections`;
    return this.httpClient.get<any>(apiUrl);
  }

  public getPersonalInsuranceProjectionByScenarioId(householdId: string, scenarioId: string): Observable<any> {
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}/personalInsuranceProjections`;
    return this.httpClient.get<any>(apiUrl);
  }

  // get actions
  public getActionList(householdId: string, scenarioId: string) {
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}/actions`;
    return this.httpClient.get<any>(apiUrl);
  }

  // Available asset list started in future
  public getAvailableAssetList(householdId: string, scenarioId: string, isNotClosed: boolean) {
    let futureAssets = '';
    if (isNotClosed)
      futureAssets = '&startedInFuture=true';
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}/assets?notclosed=${isNotClosed}${futureAssets}`;
    return this.httpClient.get<any>(apiUrl);
  }

  // Debt list(including debt from onboarding and debt action)
  public getDebtList(householdId: string, scenarioId: string) {
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}/debts`;
    return this.httpClient.get<any>(apiUrl);
  }


  // Available insurance not closed list
  public getAvailableInsuranceList(householdId: string, scenarioId: string, isNotClosed: boolean) {
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}/personalinsurances?notclosed=${isNotClosed}`;
    return this.httpClient.get<any>(apiUrl);
  }

  // Active insurance details
  public getActiveInsuranceDetails(householdId: string, scenarioId: string, personalInsuranceId: string) {
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}/personalinsurances/${personalInsuranceId}`;
    return this.httpClient.get<any>(apiUrl);
  }

  public getSuperannuationAccount(householdId: string, scenarioId: string, assetType: number) {
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}/assets/${assetType}?status=1`;
    return this.httpClient.get<any>(apiUrl);
  }
  //#endregion API get method

  //#region API post method
  public createStrategyFrom(houseHoldId: string, scenarioID: string): Observable<any> {
    if (!houseHoldId || !scenarioID) return;
    let apiUrl = `api/${this.companyPattern}scenarios`;
    let body = {
      "scenarioId": scenarioID,
      "householdId": houseHoldId
    };
    return this.httpClient.post<any>(apiUrl, body);
  }

  public createGoal(scenarioID: string, houseHoldId: string, goal: GoalsModel, goalType: number) {
    let apiUrlSpendingType = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioID}/Goals/spending`;
    let apiUrlNoneSpendingType = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioID}/Goals/nonspending`;
    let apiUrlIncomeType = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioID}/Goals/income`;
    let apiUrl = ``;

    if (goalType == 1) apiUrl = apiUrlSpendingType;
    else if (goalType == 2) apiUrl = apiUrlNoneSpendingType;
    else if (goalType == 3) apiUrl = apiUrlIncomeType;
    else if (goalType == 4) return;

    return this.httpClient.post<any>(apiUrl, goal);
  }

  /**Create action strategy */
  public createNewAsset(houseHoldId: string, scenarioId: string, asset: AssetActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/asset`;
    return this.httpClient.post<any>(apiUrl, asset);
  }

  public createCloseAsset(houseHoldId: string, scenarioId: string, asset: CloseAssetActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/closeasset`;
    return this.httpClient.post<any>(apiUrl, asset);
  }

  public createContributeFundToAsset(houseHoldId: string, scenarioId: string, contributeAsset: ContributeAssetActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/transfertoasset`;
    return this.httpClient.post<any>(apiUrl, contributeAsset);
  }

  public createDrawFundFromAsset(houseHoldId: string, scenarioId: string, drawAsset: DrawFundFromAssetModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/drawfromasset`;
    return this.httpClient.post<any>(apiUrl, drawAsset);
  }

  public createDebtAction(houseHoldId: string, scenarioId: string, debt: DebtActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/debt`;
    return this.httpClient.post<any>(apiUrl, debt);
  }

  public createContributeFundToDebt(houseHoldId: string, scenarioId: string, contributeDebt: ContributeDebtActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/transfertodebt`;
    return this.httpClient.post<any>(apiUrl, contributeDebt);
  }

  public createDrawFundFromDebt(houseHoldId: string, scenarioId: string, drawDebt: DrawFundFromDebtModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/drawfromdebt`;
    return this.httpClient.post<any>(apiUrl, drawDebt);
  }

  public createTransferFundAssetToDebt(houseHoldId: string, scenarioId: string, asset: TransferAssetToDebtActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/assettodebt`;
    return this.httpClient.post<any>(apiUrl, asset);
  }

  public createTransferFundTwoAssets(houseHoldId: string, scenarioId: string, asset: TransferAssetToAssetModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/assettoasset`;
    return this.httpClient.post<any>(apiUrl, asset);
  }

  public createNewInsurancePolicy(houseHoldId: string, scenarioId: string, insurance: InsurancePolicyActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/insurancePolicy`;
    return this.httpClient.post<any>(apiUrl, insurance);
  }

  public createChangeInsurancePolicy(houseHoldId: string, scenarioId: string, insurance: InsurancePolicyActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/changeinsurancepolicy`;
    return this.httpClient.post<any>(apiUrl, insurance);
  }

  public createCancelInsurancePolicy(houseHoldId: string, scenarioId: string, insurance: CancelInsurancePolicyActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/closeinsurancepolicy`;
    return this.httpClient.post<any>(apiUrl, insurance);
  }

  //#endregion API post method

  //#region API PUT method
  public editStrategy(houseHoldId: string, strategy: any): Observable<any> {
    if (!houseHoldId || !strategy) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios`;
    return this.httpClient.put<any>(apiUrl, strategy);
  }

  public updateActionToggleOnOff(houseHoldId: string, scenarioID: string, actionId: string) {
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioID}/Actions/${actionId}`;
    return this.httpClient.put<any>(apiUrl, {});
  }

  public updateGoal(scenarioID: string, houseHoldId: string, goal: GoalsModel, goalType: number) {
    let apiUrlSpendingType = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioID}/Goals/spending`;
    let apiUrlNoneSpendingType = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioID}/Goals/nonspending`;
    let apiUrlIncomeType = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioID}/Goals/income`;
    let apiUrl = "";
    if (goalType == GoalType.spending) apiUrl = apiUrlSpendingType;
    else if (goalType == GoalType.non_spending) apiUrl = apiUrlNoneSpendingType;
    else if (goalType == GoalType.income) apiUrl = apiUrlIncomeType;
    return this.httpClient.put<any>(apiUrl, goal);
  }

  public updateRetirementIncomeGoal(scenarioID: string, houseHoldId: string, goal: any) {
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioID}/retirementProjections`;
    return this.httpClient.put<any>(apiUrl, goal);
  }

  public updateGenericInformationOfAction(houseHoldId: string, scenarioId: string, action: ActionModel) {
    if (!houseHoldId || !scenarioId || !action) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions`;
    return this.httpClient.put<any>(apiUrl, action);
  }

  public updateInsurancePolicy(houseHoldId: string, scenarioId: string, insurance: InsurancePolicyActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/insurancePolicy`;
    return this.httpClient.put<any>(apiUrl, insurance);
  }

  public updateChangeInsurancePolicy(houseHoldId: string, scenarioId: string, insurance: InsurancePolicyActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/changeinsurancepolicy`;
    return this.httpClient.put<any>(apiUrl, insurance);
  }

  public updateCancelInsurancePolicy(houseHoldId: string, scenarioId: string, closeInsurance: CancelInsurancePolicyActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/closeinsurancepolicy`;
    return this.httpClient.put<any>(apiUrl, closeInsurance);
  }

  public updateAssetAction(houseHoldId: string, scenarioId: string, asset: AssetActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/asset`;
    return this.httpClient.put<any>(apiUrl, asset);
  }

  public updateContributeFundToAsset(houseHoldId: string, scenarioId: string, contributeAsset: ContributeAssetActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/transfertoasset`;
    return this.httpClient.put<any>(apiUrl, contributeAsset);
  }

  public updateDrawFundFromAsset(houseHoldId: string, scenarioId: string, drawAsset: DrawFundFromAssetModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/drawfromasset`;
    return this.httpClient.put<any>(apiUrl, drawAsset);
  }

  public updateDebtAction(houseHoldId: string, scenarioId: string, debt: DebtActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/debt`;
    return this.httpClient.put<any>(apiUrl, debt);
  }

  public updateContributeFundToDebt(houseHoldId: string, scenarioId: string, contributeDebt: ContributeDebtActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/transfertodebt`;
    return this.httpClient.put<any>(apiUrl, contributeDebt);
  }

  public updateDrawFundFromDebt(houseHoldId: string, scenarioId: string, drawDebt: DrawFundFromDebtModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/drawfromdebt`;
    return this.httpClient.put<any>(apiUrl, drawDebt);
  }

  public updateTransferBetweenTwoAsset(houseHoldId: string, scenarioId: string, assetToAsset: TransferAssetToAssetModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/assettoasset`;
    return this.httpClient.put<any>(apiUrl, assetToAsset);
  }

  public updateTransferAssetDebt(houseHoldId: string, scenarioId: string, assetToDebt: TransferAssetToDebtActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/assettodebt`;
    return this.httpClient.put<any>(apiUrl, assetToDebt);
  }

  public updateClosedAssetAction(houseHoldId: string, scenarioId: string, closeasset: CloseAssetActionModel) {
    if (!houseHoldId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/${scenarioId}/Actions/closeasset`;
    return this.httpClient.put<any>(apiUrl, closeasset);
  }
  //#endregion API PUT method

  //#region API DELETE method
  public deleteScenario(householdId: string, scenarioId: string): Observable<any> {
    if (!householdId || !scenarioId) return;
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}`;
    return this.httpClient.delete<any>(apiUrl);
  }

  public deleteAction(householdId: string, scenarioId: string, actionId: string): Observable<any> {
    if (!householdId || !scenarioId || !actionId) return;
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}/Actions/${actionId}`;
    return this.httpClient.delete<any>(apiUrl);
  }

  public deleteGoal(householdId: string, scenarioId: string, goalId: string): Observable<any> {
    if (!householdId || !scenarioId || !goalId) return;
    let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/${scenarioId}/Goals/${goalId}`;
    return this.httpClient.delete<any>(apiUrl);
  }
  //#endregion

  //#region API for Generate Report
  public getReportTemplates(): Observable<any> {
    let apiUrl = `api/${this.companyPattern}templates`;
    return this.httpClient.get<any>(apiUrl);
  }

  public generateReport(report: Report, scenarioId: string): Observable<any> {
    let user = this.securityService.authenticatedUser();
    report.userId = user.id;
    report.scenarioId = scenarioId;
    let apiUrl = `api/${this.companyPattern}reports`;
    return this.httpClient.post<ApiDataResult<string>>(apiUrl, JSON.stringify(report));
  }
  //#endregion

  /**
   * 
   Handle function
   */

  /**
     * 
     * @param keyCode: 32 = space
     * 27: esc
     * 18: alt
     * 91, 92: window
     * 13: enter of number key side
     * 9: tab
     * 8: backspace
     * 17: Ctr
     * 32: space
     */
  checkNumbersOnly(e: any) {
    var key = e.keyCode ? e.keyCode : e.which;
    if (!([8, 9, 13, 27, 91, 92, 18, 32].indexOf(key) !== -1 || // add , 190 or 110 into array if we want input have dot sign
      (key >= 48 && key <= 57) ||
      (key >= 96 && key <= 105)
    )) e.preventDefault();
  }

  // Check number is valid year
  validateCreatedYear(compareYear: number, compareToYear: number) {
    let isValid = true;
    if (compareYear < compareToYear)
      isValid = false;
    return isValid;
  }

  showInvalidYearMessage(year: number) {
    let iSub = this.confirmationDialogService.showModal({
      title: "Validation error",
      message: "Starting year must be equal or greater than " + year,
      btnOkText: "Ok"
    }).subscribe(res => {
      iSub.unsubscribe();
    });
  }

  // Validate maximum year can input in End Year field
  validateYearField(year: number, minYear: number, maxYear: number) {
    let isValid = true;
    if (year < minYear || year > maxYear)
      isValid = false;
    return isValid;
  }

  showInvalidEndYearMessage(minYear: number, maxYear: number) {
    let iSub = this.confirmationDialogService.showModal({
      title: "Validation error",
      message: "The year must be equal or greater than " + minYear + ' and less than or equal ' + maxYear ,
      btnOkText: "Ok"
    }).subscribe(res => {
      iSub.unsubscribe();
    });
  }

  //#region handle Observable event
  public handleReloadData() {
    return this.reloadData.asObservable();
  }

  public reloadAllData() {
    // incluce Asset/Debt/Insurance, Action, reload strategy details
    this.reloadData.next(0);
  }

  public reloadStrategyDetails() {
    this.reloadData.next(1);
  }

  public reloadAssetDebtInsuranceList() {
    this.reloadData.next(2);
  }

  public reloadActions() {
    this.reloadData.next(3);
  }

  public reloadClientIncome() {
    this.reloadData.next(4);
  }

  public reloadStrategyDetailsAndActions() {
    this.reloadData.next(5);
  }

  public reloadActionsAndAsset() {
    this.reloadData.next(6);
  }

  public reloadActionsAndInsurance() {
    this.reloadData.next(7);
  }

  public handleSelectedActionValue() {
    return this.selectedAction.asObservable();
  }

  public reloadActionsAssetListCloseAndNot() {
    this.reloadData.next(8);
  }

  public reloadActionsInsuranceCloseAndNot() {
    this.reloadData.next(9);
  }

  public storageSelectedAction(action: ActionModel) {
    this.selectedAction.next(action);
  }

  //#endregion

  // #region handle spinner loading
  showLoading() {
    this.clientService.showLoading();
  }

  hideLoading() {
    this.clientService.hideLoading();
  }
}

export class FamilyMembers {
  contactId: string;
  firstName: string;
  retirementAge: number;
  profileImageUrl: string;
}
