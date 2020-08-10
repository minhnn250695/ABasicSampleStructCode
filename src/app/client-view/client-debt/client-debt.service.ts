import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable, ReplaySubject } from 'rxjs';

// services
import { ConfigService } from '../../common/services/config-service';

// models
import {
  BalanceHistory, BaseResponse, ClientDebt, Contact, TotalBalancetHistory, TotalClientDebts,
  UserDoc
} from './models';

@Injectable()
export class ClientDebtService {
  // Client debts
  readonly totalDebts: TotalClientDebts;
  public periodKeys: any;
  readonly houseHoldsEvent: ReplaySubject<Contact[]> = new ReplaySubject(1);
  readonly sortLengthEvent: ReplaySubject<number> = new ReplaySubject(1);
  readonly totalDebtHistoryEvent: ReplaySubject<TotalBalancetHistory> = new ReplaySubject(1);

  public isCachedDirty = true;

  private totalDebtsSubject: ReplaySubject<TotalClientDebts> = new ReplaySubject<TotalClientDebts>(1);
  private totalDebtHistory: TotalBalancetHistory;
  readonly totalDebtsEvent = this.totalDebtsSubject.asObservable();

  constructor(private httpClient: HttpClient,
    private http: Http,
    private configService: ConfigService) {
    this.totalDebtHistory = new TotalBalancetHistory([]);
    this.totalDebts = new TotalClientDebts();
  }

  clearAllCached() {
    if (this.totalDebts) this.totalDebts.clear();
  }

  clearCachedFor(id: string) {
    if (this.totalDebts) this.totalDebts.remove(id);
  }

  clearAll() {
    if (this.totalDebts) this.totalDebts.clear();
    this.totalDebtsSubject.next(null);
  }

  setCachedDirty(dirty: boolean = true) {
    this.isCachedDirty = dirty;
  }

  getClientDebtsFor(ids: string[]): Observable<any> {
    // if ids is incorrect
    if (!ids || ids && ids.length === 0) {
      this.totalDebtsSubject.next(this.totalDebts);
      return Observable.of(this.totalDebts);
    }

    let cached = this.totalDebts.get(ids[0]);
    // get data if not cached
    if (typeof (cached) === 'undefined')
      this.setCachedDirty(true);
    else
      this.setCachedDirty(false);

    if (!this.isCachedDirty) {
      this.totalDebtsSubject.next(this.totalDebts);
      return Observable.of(this.totalDebts);
    }
    // get list of observable
    return this.getClientDebtsByArrayIds(ids).
      map(res => {
        if (res && res.data && res.data.data.length > 0) {
          this.totalDebts.addList(ids, res.data.data);
        }
        // emit data outside
        this.setCachedDirty(false);
        this.totalDebtsSubject.next(this.totalDebts);
        return this.totalDebts;
      });
  }

  getClientDebtsByArrayIds(contactIds: string[]): Observable<any> {
    let apiUrl = `api/users/Debts/search`;
    return this.httpClient.post<ClientDebt[]>(apiUrl, { IDs: contactIds });
  }
  getTotalDebts(): TotalClientDebts {
    return this.totalDebts;
  }

  /**
   * 
   */
  getDebtHistoriesFor(ids: string[]): Observable<TotalBalancetHistory> {
    // if ids is incorrect
    if (!ids || ids && ids.length === 0) {
      this.totalDebtHistoryEvent.next(this.totalDebtHistory);
      return Observable.of(this.totalDebtHistory);
    }
    let newIds = [];
    // save ids
    ids.forEach(id => {
      let cached = this.totalDebtHistory.get(id);
      // get data if not cached
      if (!cached || this.isCachedDirty) {
        newIds.push(id);
      }
    });

    if (!newIds || newIds.length === 0) {
      this.totalDebtHistoryEvent.next(this.totalDebtHistory);
      return Observable.of(this.totalDebtHistory);
    }

    let apiUrl = `api/users/DebtsHistory/search`;
    let body = { ids: newIds };
    return this.httpClient.post<BaseResponse<BalanceHistory[]>>(apiUrl, body).map(res => {

      this.totalDebtHistory.addList(newIds, res && res.data && res.data.data);
      this.setCachedDirty(false);
      this.totalDebtHistoryEvent.next(this.totalDebtHistory);
      return this.totalDebtHistory;
    });
  }

  getDebtHistoryOfUser(userId: string): Observable<BalanceHistory[]> {
    let apiUrl = `api/users/${userId}/DebtsHistory`;

    return this.httpClient.get<BalanceHistory[]>(apiUrl).map(res => {
      return res;
    });
  }

  /**
   * debt projections
   */
  getDebtProjectionOfUser(userId: string) {
    let apiUrl = `api/users/${userId}/DebtProjections`;
    return this.httpClient.get<any[]>(apiUrl).map(res => {
      return res;
    });
  }

  /**
   *
   * @param userId
   */
  getUserDocumentsInDebt(userId: string, entityId): Observable<UserDoc[]> {
    let apiUrl = `api/users/${userId}/documents/Debts/${entityId}`;
    return this.httpClient.get<UserDoc[]>(apiUrl)
      .map(res => {
        return res;
      });
  }

  /**
   * upload user documents
   * @param userId
   */
  uploadUserDebtDocuments(userId: string, entityId: string, file: File): Observable<any> {
    let apiUrl = `${this.configService.getApiUrl()}api/users/${userId}/documents/Debts/${entityId}`;
    let formData = new FormData();
    formData.append('files', file, file.name);
    let headers = this.configService.getHeaders();
    return this.http.post(apiUrl, formData, { headers }).map(res => {
      return res;
    });
  }

  /**
   * get user documents
   * @param userId
   */
  deleteUserDebtDocuments(userId: string, entityId: string, documentName: string): Observable<any> {
    let apiUrl = `api/users/${userId}/documents/Debts/${entityId}/${documentName}`;
    return this.httpClient.delete(apiUrl).map(res => {
      return res;
    });
  }
}



