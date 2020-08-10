import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable, ReplaySubject } from 'rxjs';
import { TotalPersonalInsuranceSummary, TotalPersonalInsurance, TotalInsuranceObjective, TotalInsuranceInfo, BaseResponse, PersonalInsuranceSummary, PersonalInsuranceOutcomes, InsuranceObjective, InsuranceInfo, UserDoc } from './models';
import { ConfigService } from '../../common/services/config-service';
@Injectable()
export class ClientInsuranceService {
  // insurance summary
  private totalPersonalInsuranceSummary: TotalPersonalInsuranceSummary;
  // readonly personalInsuranceEvent: ReplaySubject<TotalPersonalInsuranceSummary> = new ReplaySubject(1);
  // insurance outcome
  private totalPersonalInsuranceOutcome: TotalPersonalInsurance;
  readonly totalPersonalInsuranceOutComeEvent: ReplaySubject<TotalPersonalInsurance> = new ReplaySubject(1);
  // insurance objective
  private totalInsuranceObjective: TotalInsuranceObjective;
  //
  private totalInsuranceInfo: TotalInsuranceInfo;

  private isCachedDirty = true;

  constructor(private httpClient: HttpClient,
    private http: Http,
    private configService: ConfigService) {
    // instance value
    this.totalPersonalInsuranceSummary = new TotalPersonalInsuranceSummary([]);
    this.totalPersonalInsuranceOutcome = new TotalPersonalInsurance();
    this.totalInsuranceObjective = new TotalInsuranceObjective();
    this.totalInsuranceInfo = new TotalInsuranceInfo();
  }

  clearAll() {
    if (this.totalPersonalInsuranceOutcome) this.totalPersonalInsuranceOutcome.clear();
    this.totalPersonalInsuranceOutComeEvent.next(null);
    this.totalPersonalInsuranceSummary = new TotalPersonalInsuranceSummary([]);
    this.totalInsuranceInfo = new TotalInsuranceInfo();
    this.totalInsuranceObjective = new TotalInsuranceObjective();
  }

  setCachedDirty(dirty: boolean = true) {
    this.isCachedDirty = dirty;
  }

  /**
   * get personal insurances of list of user
   * @param userIds
   */
  getPersonalInsuranceSummariesFor(userIds: string[]): Observable<TotalPersonalInsuranceSummary> {
    if (!userIds || userIds && userIds.length === 0) {
      return Observable.of(this.totalPersonalInsuranceSummary);
    }

    let newIds: string[] = [];

    userIds.forEach(id => {
      let cached = this.totalPersonalInsuranceSummary.get(id);
      if (!cached || this.isCachedDirty) {
        newIds.push(id);
      }
    });

    if (!newIds || newIds && newIds.length === 0) {
      return Observable.of(this.totalPersonalInsuranceSummary);
    }

    let apiUrl = `api/users/PersonalInsurancesSummary/search`;
    let body = { ids: newIds };
    return this.httpClient.post<BaseResponse<PersonalInsuranceSummary[]>>(apiUrl, body).map(res => {
      this.totalPersonalInsuranceSummary.addList(newIds, res && res.data && res.data.data);
      this.setCachedDirty(false);
      return this.totalPersonalInsuranceSummary;
    });
  }

  /**
   *
   * @param userId
   */
  getPersonalInsuranceOfUser(userId: string): Observable<PersonalInsuranceSummary[]> {
    let apiUrl = `api/users/${userId}/PersonalInsurancesSummary`;

    return this.httpClient.get<PersonalInsuranceSummary[]>(apiUrl).map(res => {
      return res;
    });
  }

  /**
   * get personal insurance outcomes
   * @param userIds list of user id
   */
  getPersonalInsuranceOutcomesFor(userIds: string[]): Observable<any> {
    if (!userIds || userIds && userIds.length === 0) {
      this.totalPersonalInsuranceOutComeEvent.next(this.totalPersonalInsuranceOutcome);
      return Observable.of(this.totalPersonalInsuranceOutcome);
    }
    let cached = this.totalPersonalInsuranceOutcome.get(userIds[0]);
    // get data if not cached
    if (typeof (cached) === 'undefined')
      this.setCachedDirty(true);
    else
      this.setCachedDirty(false);

    if (!this.isCachedDirty) {
      this.totalPersonalInsuranceOutComeEvent.next(this.totalPersonalInsuranceOutcome);
      return Observable.of(this.totalPersonalInsuranceOutcome);
    }
    // get list of observable
    return this.getPersonalInsuranceOutComeByArrayIds(userIds).map(res => {
      if (res && res.data && res.data.data.length > 0) {
        res.data.data.forEach(item => { this.totalPersonalInsuranceOutcome.add(item.primaryClientId, item); });
      }
      // emit data outside
      this.setCachedDirty(false);
      this.totalPersonalInsuranceOutComeEvent.next(this.totalPersonalInsuranceOutcome);
      return this.totalPersonalInsuranceOutcome;
    });
  }

  /**
   * get personal insurance outcome of the specified user
   */
  getPersonalInsuranceOutComeByArrayIds(userIds: string[]): Observable<any> {
    let apiUrl = `api/users/PersonalInsuranceOutcomes/search`;
    return this.httpClient.post<PersonalInsuranceOutcomes[]>(apiUrl, { IDs: userIds });
  }

  /**
   * ================================================================================================================
   *  Personal Insurance objective
   * ================================================================================================================
   */

  /**
   * get personal insurance objective user
   * @param userIds list of user id
   */
  getPersonalInsuranceObjectiveFor(userIds: string[]): Observable<any> {
    if (!userIds || userIds && userIds.length === 0) {
      return Observable.of(this.totalInsuranceObjective);
    }
    let cached = this.totalInsuranceObjective.get(userIds[0]);
    // get data if not cached
    if (typeof (cached) === 'undefined') {
      this.setCachedDirty(false);
    } else {
      this.setCachedDirty(true);
    }
    if (this.isCachedDirty) {
      return Observable.of(this.totalInsuranceObjective);
    }

    // get list of observable
    return this.getPersonalInsuranceOnjectiveofUserByArrayIds(userIds).map(res => {
      if (res && res.data && res.data.data.length > 0) {
        res.data.data.forEach(item => { this.totalInsuranceObjective.add(item.primaryClientId, item); });
      }
      // emit data outside
      this.setCachedDirty(false);
      return this.totalInsuranceObjective;
    });
  }

  /**
   *
   * @param userId
   */
  getPersonalInsuranceOnjectiveofUserByArrayIds(userId: string[]): Observable<any> {
    let apiUrl = `api/users/PersonalInsuranceObjectives/search`;
    return this.httpClient.post<InsuranceObjective[]>(apiUrl, { IDs: userId }).map(res => {
      return res;
    });
  }

  /**
   *
   * @param userId
   */
  getPersonalInsuranceObjectiveofUser(userId: string): Observable<InsuranceObjective> {
    let apiUrl = `api/users/${userId}/PersonalInsuranceObjectives`;

    return this.httpClient.get<InsuranceObjective>(apiUrl).map(res => {
      return res;
    });
  }

  /**
   *
   * @param userId
   */
  updatePersonalInsuranceOnjectiveofUser(objective: InsuranceObjective): Observable<any> {
    let apiUrl = `api/users/PersonalInsuranceObjectives`;

    return this.httpClient.put<any>(apiUrl, objective).map(res => {
      return res;
    });
  }


  /**
   * ================================================================================================================
   *  Personal Insurance policy details
   * ================================================================================================================
   */

  /**
   * get personal insurance outcomes
   * @param userIds list of user id
   */
  getInsurancePolicyDetailsFor(userIds: string[]): Observable<TotalInsuranceInfo> {
    if (!userIds || userIds && userIds.length === 0) {
      return Observable.of(this.totalInsuranceInfo);
    }
    let subs: Array<Observable<any>> = [];

    userIds.forEach(id => {
      let cached = this.totalInsuranceInfo.get(id);
      if (!cached || this.isCachedDirty) {
        let sub = this.getInsurancePolicyDetailsForUser(id).map((list: InsuranceInfo[]) => {
          return { id, list };
        });
        subs.push(sub);
      }
    });

    if (!subs || subs && subs.length === 0) {
      return Observable.of(this.totalInsuranceInfo);
    }

    return Observable.zip.apply(null, subs).map((res: any[]) => {
      if (res) res.forEach(item => {
        this.totalInsuranceInfo.add(item.id, item.list);
      });
      this.setCachedDirty(false);
      return this.totalInsuranceInfo;
    });
  }

  /**
   *
   * @param userId
   */
  getInsurancePolicyDetailsForUser(userId: string): Observable<InsuranceInfo[]> {
    let apiUrl = `api/users/${userId}/PersonalInsurancesDetail`;
    return this.httpClient.get<InsuranceInfo[]>(apiUrl).map(res => {
      return res;
    });
  }

  /**
   *
   * @param userId
   */
  getUserDocuments(userId: string, entityId): Observable<UserDoc[]> {
    let apiUrl = `api/users/${userId}/documents/PersonalInsurances/${entityId}`;
    return this.httpClient.get<UserDoc[]>(apiUrl)
      .map(res => {
        return res;
      });
  }

  /**
   * upload user documents
   * @param userId
   */
  uploadUserDocuments(userId: string, entityId: string, file: File): Observable<any> {
    let apiUrl = `api/users/${userId}/documents/PersonalInsurances/${entityId}`;
    let formData = new FormData();
    formData.append('files', file, file.name);
    let headers = this.configService.getHeaders();
    let newApiUrl = this.configService.addCompanyIdToUrl(apiUrl);
    return this.http.post(this.configService.getApiUrl() + newApiUrl, formData, { headers }).map(res => {
      return res;
    });
  }

  /**
   * get user documents
   * @param userId
   */
  deleteUserDocuments(userId: string, entityId: string, documentName: string): Observable<any> {
    let apiUrl = `api/users/${userId}/documents/PersonalInsurances/${entityId}/${documentName}`;
    return this.httpClient.delete(apiUrl).map(res => {
      return res;
    });
  }
}


