import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { BehaviorSubject, Observable, Subject } from "rxjs";

import { InsuranceBenefit, InsuranceInfo } from '../client-view/client-protection/models';
import { BaseResponse, CashFlow, ClientAsset, ClientDebt, Contact, HouseHoldResponse, HouseHoldCashFlow } from "../client-view/models";
import { ConfigService } from "../common/services/config-service";
import { ClientExpense, ClientIncome, ListAssets, OptionModel } from "./models";

@Injectable()
export class OnBoardingService {

  allAssets: ClientAsset[];
  allIncome: ClientIncome[];
  allExpense: ClientExpense[];
  allDebt: ClientDebt[];
  allCashFlow: CashFlow[];
  allInsurance: InsuranceInfo[];
  spousePrimaryFirstName: Array<OptionModel<number>>;

  // primaryClientId: string = localStorage.getItem("selected_client_id_in_client_view");
  houseHold: HouseHoldResponse;
  baseApiUrl: string;
  productProviders: any[];

  private updateBeginSource = new BehaviorSubject("");
  // tslint:disable-next-line:member-ordering
  updateBegin = this.updateBeginSource.asObservable();

  private updateEndSource = new BehaviorSubject("");
  // tslint:disable-next-line:member-ordering
  updateEnd = this.updateEndSource.asObservable();

  private updateHeaderRequest = new Subject<any>();
  constructor(private httpClient: HttpClient, private configService: ConfigService, private http: Http) {
    this.baseApiUrl = this.configService.getApiUrl();
    this.allAssets = [];
    this.allDebt = [];
    this.allIncome = [];
    this.allExpense = [];
    this.allCashFlow = [];
    this.spousePrimaryFirstName = [];
    this.houseHold = new HouseHoldResponse();
  }

  //#region STORE VALUES TO SERVICES
  /***************************************************************************************************/

  storeAssets(list: ListAssets[]): void {
    this.allAssets = [];
    if (list && list.length > 0) {
      list.forEach((member) => {
        if (member.listAssets && member.listAssets.length > 0) {
          member.listAssets.forEach((asset) => {
            this.allAssets.push(asset);
          });
        }
      });
    }
  }

  storeIncome(list: any[]): void {
    if (list && list.length > 0) {
      this.allIncome = list;
    }
  }

  storeExpense(list: any[]): void {
    if (list && list.length > 0) {
      this.allExpense = list;
    }
  }

  storeDebt(list: any[]): void {
    if (list && list.length > 0) {
      this.allDebt = list;
    }
  }

  storeCashFlows(list: any[]): void {
    if (list && list.length > 0)
      this.allCashFlow = list;
  }

  storeInsurance(list: any[]): void {
    if (list && list.length > 0)
      this.allInsurance = list;
  }

  storeSpousePrimaryFirstName(list: Array<OptionModel<number>>): void {
    if (!list || list.length < 1) { return; }
    this.spousePrimaryFirstName = list;
  }

  storeHouseHold(houseHold: HouseHoldResponse) {
    if (houseHold) {
      this.houseHold = houseHold;
    }
  }
  //#endregion

  //#region GET ITEM LIST
  /***************************************************************************************************/

  getPrimaryClientId(): string {
    if (this.houseHold) {
      return localStorage.getItem("selected_client_id_in_client_view");
    }
  }

  /**
   * Get member's name based on their id.
   * @param id
   */
  getMemberFirstName(id: string): string {
    if (this.houseHold && this.houseHold.members && this.houseHold.members.length > 0) {
      let members = this.houseHold.members;
      let name = "";
      members.forEach((member) => {
        if (member.id === id)
          name = member.firstName;
      });
      return name;
    }
  }

  getHouseHold(): Observable<any> {
    let id = localStorage.getItem("selected_client_id_in_client_view");

    if (!id) { return Observable.of(null); }

    // if (this.houseHold && this.houseHold.id) {
    //   return Observable.of(this.houseHold);
    // } else {
    //   return this.httpClient.get<HouseHoldResponse>("api/Households/" + id);
    // }
    return this.httpClient.get<HouseHoldResponse>("api/Households/" + id);
  }

  getListAssetFromContactIds(listContact: string[]): Observable<any> {
    if (!listContact) { return; }
    let api: string = `api/users/ClientOnBoarding/Assets/search`;
    return this.httpClient.post<BaseResponse<ListAssets[]>>(api, { IDs: listContact });
  }

  getListDebtFromContactIds(listContact: string[]): Observable<any> {
    if (!listContact) { return; }
    let api: string = `api/users/ClientOnBoarding/Debts/search`;
    return this.httpClient.post<BaseResponse<any[]>>(api, { IDs: listContact });
  }

  getListCashflowFromContactIds(ids: string[]): Observable<any> {
    if (!ids || ids.length < 1) { return; }
    let apiUrl = `api/users/ClientOnBoarding/CashFlow/search`;
    return this.httpClient.post<BaseResponse<any[]>>(apiUrl, { IDs: ids });
  }

  getInsuranceList(ids: string[]): Observable<any> {
    if (!ids || ids.length < 1) { return; }
    let apiUrl = `api/users/ClientOnboarding/PersonalInsurancesDetail/search`;
    return this.httpClient.post<BaseResponse<any[]>>(apiUrl, { IDs: ids });
  }

  getHouseholdSpending(): Observable<any> {
    let id = this.houseHold.id;
    let apiUrl = `api/households/${id}/cashflow`;
    return this.httpClient.get(apiUrl);
  }

  getProductProviderList(): Observable<any> {
    let companyId = localStorage.getItem('companyId');
    let apiUrl = `api/companies/${companyId}/CRMData/ProductProviders`;
    return this.httpClient.get(apiUrl);
  }

  getClientIncome(householdId: string): Observable<any> {
    let apiUrl = `api/cashflow/households/${householdId}/income`;
    return this.httpClient.get(apiUrl);
  }

  getClientExpense(householdId: string): Observable<any> {
    let apiUrl = `api/cashflow/households/${householdId}/expense`;
    return this.httpClient.get(apiUrl);
  }

  getClientIncomeExpense(householdId: string): Observable<any> {
    let apiUrl = `api/cashflow/households/${householdId}/incomeExpense`;
    return this.httpClient.get(apiUrl);
  }

  getAssetTypeList(): Observable<any> {
    let companyId = localStorage.getItem('companyId');
    let apiUrl = `api/companies/${companyId}/assettype`;
    return this.httpClient.get(apiUrl);
  }
  //#endregion

  //#region UPDATE VALUES
  /***************************************************************************************************/

  updateProfileImg(id: string, file: File): Observable<any> {
    if (!id) { return; }
    let memberId: string = id;
    let apiUrl: string = `api/users/${memberId}/profileimage`;

    let formData: FormData = new FormData();
    formData.append("File", file);
    return this.http.post(this.baseApiUrl + apiUrl, formData, { headers: this.configService.getHeaders() })
      .map((res) => res.json())
      .map((response) => {
        if (response.success) {
          return response.imageUrl;
        }
      });
  }

  updatePersonalInformation(user: Contact): Observable<any> {
    if (!user) { return; }
    return this.httpClient.put("api/Contacts", user);
  }

  updateClientAsset(id: string, asset: ClientAsset): Observable<any> {
    if (!id) { return; }
    let apiUrl: string = `api/users/${id}/Assets`;
    return this.httpClient.put(apiUrl, asset);
  }

  updateClientDebt(id: string, debt: ClientDebt): Observable<any> {
    if (!id) { return; }
    let apiUrl: string = `api/users/${id}/Debts`;
    return this.httpClient.put(apiUrl, debt);
  }

  updateCashFlow(form: any): Observable<any> {
    if (!form) { return; }
    let apiUrl = `api/CashFlow`;
    return this.httpClient.put(apiUrl, form);
  }

  updateHouseHoldSpending(form: any): Observable<any> {
    if (!form) { return; }
    let apiUrl = `api/Households/cashflow`;
    return this.httpClient.put(apiUrl, form);
  }

  updatePersonalInsurance(id: string, insurance: InsuranceInfo): Observable<any> {
    if (!id) { return; }
    let apiUrl = `api/users/${id}/PersonalInsurance`;
    return this.httpClient.put(apiUrl, insurance);
  }

  updateClientIncome(income: ClientIncome): Observable<any> {
    let apiUrl = `api/cashflow/income`;
    return this.httpClient.put(apiUrl, income);
  }

  updateClientExpense(expense: ClientExpense): Observable<any> {
    let apiUrl = `api/cashflow/householdexpense`;
    return this.httpClient.put(apiUrl, expense);
  }

  updateInsuranceBenefit(benefitId: string, benefit: InsuranceBenefit): Observable<any> {
    if (!benefitId) { return; }
    let apiUrl = `api/InsuranceBenefit/${benefitId}`;
    return this.httpClient.put(apiUrl, benefit);
  }

  updateCurrentStep(step: number) {
    if (!step || step < 2 || !this.houseHold) { return; }
    let apiUrl = `api/households/${this.houseHold.id}/ClientOnboardingProcess/${step}`;
    this.httpClient.put(apiUrl, {}).subscribe((response) => {

    });
  }

  updateStatusClientOnboardingComplete(householdId: string): Observable<any> {
    if (!householdId) { return; }
    let apiUrl = `api/households/${householdId}/ClientOnboardingComplete`;
    return this.httpClient.put(apiUrl, {});
  }

  updateHeader(): Observable<any> {
    return this.updateHeaderRequest.asObservable();
  }

  setUpdateBegin(message) {
    this.updateBeginSource.next(message);
  }

  setUpdateEnd(message) {
    this.updateEndSource.next(message);
  }

  //#endregion

  //#region ADD NEW ITEMS
  /***************************************************************************************************/

  addNewMember(user: Contact): Observable<any> {
    if (!user) { return; }
    return this.httpClient.post("api/Contacts", user);
  }

  addNewClientAsset(id: string, asset: ClientAsset): Observable<any> {
    if (!id) {
      return;
    }
    let apiUrl: string = `api/users/${id}/Assets`;
    return this.httpClient.post(apiUrl, asset);
  }

  addNewDebt(id: string, debt: any): Observable<any> {
    if (!id) { return; }
    let apiUrl: string = `api/users/${id}/Debts`;
    return this.httpClient.post(apiUrl, debt);
  }

  addNewPersonalInsurance(id: string, insurance: InsuranceInfo): Observable<any> {
    if (!id) { return; }
    let apiUrl = `api/users/${id}/PersonalInsurance`;
    return this.httpClient.post(apiUrl, insurance);
  }

  addNewClientIncome(income: ClientIncome): Observable<any> {
    if (!income) return;
    let apiUrl = `api/cashflow/income`;
    return this.httpClient.post(apiUrl, income);
  }

  addNewClientExpense(expense: ClientExpense): Observable<any> {
    if (!expense) return;
    let apiUrl = `api/cashflow/householdexpense`;
    return this.httpClient.post(apiUrl, expense);
  }
  //#endregion

  //#region DELETE/RESET VALUES
  deleteBenefit(id: string): Observable<any> {
    if (!id) { return; }
    let apiUrl = `api/InsuranceBenefit/${id}`;
    return this.httpClient.delete(apiUrl);
  }

  resetHouseHold() {
    if (this.houseHold && this.houseHold.id) {
      this.houseHold = new HouseHoldResponse();
    }
  }

  clear() {
    this.allAssets = [];
    this.allDebt = [];
    this.allCashFlow = [];
    this.allInsurance = [];
    this.spousePrimaryFirstName = [];
    // this.primaryClientId = undefined;
    // this.baseApiUrl = undefined;
    this.houseHold = new HouseHoldResponse();
  }
  //#endregion

  //#region OTHER
  sendUpdateHeaderRequest() {
    this.updateHeaderRequest.next();
  }
  //#endregion
}
