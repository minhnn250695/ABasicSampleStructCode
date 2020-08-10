import { Injectable } from '@angular/core';
import { ClientIncome } from '../models';
import { Subject } from 'rxjs';
import { InsuranceBenefit } from '../../client-view/client-protection/models';

@Injectable()
export class HandleFinancialSituationService {

  private data: any;
  private type: number;
  private name: string;
  private financialModal = new Subject<boolean>();
  private loadingRequest = new Subject<boolean>();
  private reloadRequest = new Subject<any>();
  private insuranceBenefitUpdateRequest = new Subject<any>();
  private incomeShowingAssets = new Subject<any>();


  initIncome(): ClientIncome {
    if (this.type || this.type == 0) {
      let temp = new ClientIncome();
      temp = this.data;
      return temp;
    } else {
      return;
    }
  }

  initTax(): any {
    if (this.type == -1 && this.data) {
      return {
        tax: this.data.incomeTax,
        primaryClientId: this.data.primaryClientId
      };
    } else {
      return;
    }
  }

  initHouseHoldSpending() {
    // set type for spending

    if (this.data) {
      return this.data
    } else {
      return;
    }
  }

  initFinancial(): any {
    return this.data ? this.data : undefined;
  }

  getType(): number {
    return this.type || this.type == 0 ? this.type : undefined;
  }

  getName(): string {
    return this.name;
  }

  /**
   * SAVE DATA
   * ******************************************************************************************
   */

  // handle action when user click on a cashflow
  saveFinancialFromClick(data: any, cashflowType?: number) {
    this.data = data;
    this.type = cashflowType || cashflowType == 0 ? cashflowType : undefined;
  }

  saveFinancialNameFromClick(name: string) {
    if (!name) { return; }

    this.name = name;
  }

  resetCashFlow() {
    this.data = null;
    this.type = null;
  }

  /**
  * HANDLE ON/OFF FINANCIAL MODAL
  * ******************************************************************************************
  */
  handleInsuranceBenefitUpdateRequest() {
    return this.insuranceBenefitUpdateRequest.asObservable();
  }

  updateInsuranceBenefit(position: number, benefit: InsuranceBenefit) {
    this.insuranceBenefitUpdateRequest.next({ position: position, benefit: benefit });
  }

  /**
   * HANDLE ON/OFF FINANCIAL MODAL
   * ******************************************************************************************
   */
  handleOnOffFinancialModal() {
    return this.financialModal.asObservable();
  }

  openFinancialModal() {
    this.financialModal.next(true);
  }

  closeFinancialModal() {
    this.financialModal.next(false);
  }

  /**
   * HANDLE ON/OFF LOADING
   * ******************************************************************************************
   */
  handleOnOffLoading() {
    return this.loadingRequest.asObservable();
  }

  openLoading() {
    this.loadingRequest.next(true);
  }

  closeLoading() {
    this.loadingRequest.next(false);
  }

  /**
   * HANDLE RELOAD REQUEST
   * ******************************************************************************************
   */
  handleReloadFinancialResources() {
    return this.reloadRequest.asObservable();
  }

  reloadAssets() {
    this.reloadRequest.next(1);
  }

  reloadDebts() {
    this.reloadRequest.next(2);
  }

  reloadIncomes() {
    this.reloadRequest.next(3);
  }

  reloadExpenses() {
    this.reloadRequest.next(4);
  }

  reloadInsurance() {
    this.reloadRequest.next(5);
  }

  reloadAssetAndIncomes() {
    this.reloadRequest.next(6);
  }

  reloadIncomesExpenses() {
    this.reloadRequest.next(6);
  }



  /**Handle get new list showing asset */
  getIncomeShowingAssets() {
    return this.incomeShowingAssets.asObservable();
  }

  submitIncomeShowingAssets(assets: any) {
    return this.incomeShowingAssets.next(assets);
  }

  /**
   * HANDLE NUMBER CONVERSION
   * ******************************************************************************************
   */
  convertNumberToCurrency(value) {
    return '$' + value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  convertCurrencyToNumber(value) {
    return value.replace(/[^0-9.`-]+/g, "");
  }

}
