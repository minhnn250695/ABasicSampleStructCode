import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable, ReplaySubject } from 'rxjs';

// models
import {
  BalanceHistory, BaseResponse, ClientAsset, Contact,
  TotalBalancetHistory, TotalClientAssets, UserDoc, ClientCalculation
} from './models';
// services
import { ConfigService } from '../../common/services/config-service';
import { ApiDataResult } from '../../common/api/api-data-result';

@Injectable()
export class ClientAssetService {

  // set a flag to indicate data wasn't got if isCachedDirty == true
  public isCachedDirty = true;
  // save periodKeys to so on total assets history
  public periodKeys: any;
  // total asset
  readonly totalAssets: TotalClientAssets;

  readonly houseHoldEvent: ReplaySubject<Contact[]> = new ReplaySubject(1);
  readonly sortTypeEvent: ReplaySubject<number> = new ReplaySubject(1);
  // asset history
  private totalAssetBalanceHistory: TotalBalancetHistory;
  readonly totalAssetHistoryEvent: ReplaySubject<TotalBalancetHistory> = new ReplaySubject(1);

  private totalAssetsSubject: ReplaySubject<TotalClientAssets> = new ReplaySubject<TotalClientAssets>(1);
  readonly totalAssetsEvent = this.totalAssetsSubject.asObservable();
  
  private assetTypeList: any[] = undefined;
  public houseHolds: Contact[] = [];
  public clientCalculation: ClientCalculation = new ClientCalculation();

  constructor(private httpClient: HttpClient,
    private http: Http,
    private configService: ConfigService) {
    this.totalAssetBalanceHistory = new TotalBalancetHistory([]);
    this.totalAssets = new TotalClientAssets();
  }

  clearAllCached() {
    if (this.totalAssets) this.totalAssets.clear();

  }

  clearCachedFor(id: string) {
    if (this.totalAssets) this.totalAssets.remove(id);
  }

  clearAll() {
    if (this.totalAssets) this.totalAssets.clear();
    this.totalAssetsSubject.next(null);
  }

  getAssetTypeList(): Observable<any> {
    let companyId = localStorage.getItem('companyId');
    if (this.assetTypeList && this.assetTypeList.length >= 0) {
      return Observable.of(this.assetTypeList);
    } else {
      let apiUrl = `api/companies/${companyId}/assettype`;
      return this.httpClient.get(apiUrl).map((res: ApiDataResult<any>) => {
        if (res && res.success) {
          this.assetTypeList = JSON.parse(JSON.stringify(res.data && res.data.data));
        }
        return res.data.data;
      });
    }
  }

  /**
   * get list assets by ids
   */
  getClientAssetsFor(ids: string[]): Observable<any> {
    // if ids is incorrect
    if (!ids || ids && ids.length === 0) {
      this.totalAssetsSubject.next(this.totalAssets);
      return Observable.of(this.totalAssets);
    }
    let cached = this.totalAssets.get(ids[0]);
    // get data if not cached
    if (typeof (cached) === 'undefined')
      this.setCachedDirty(true);
    else
      this.setCachedDirty(false);

    if (!this.isCachedDirty) {
      this.totalAssetsSubject.next(this.totalAssets);
      return Observable.of(this.totalAssets);
    }

    // get list of observable
    return this.getClientAssetsByArrayIds(ids).map(res => {
      if (res && res.data && res.data.data.length > 0) {
        res.data.data.forEach(item => { this.totalAssets.add(item.id, item.listAssets); });
        // this.totalAssets.addList(ids, res.data.data);
      }
      // emit data outside
      this.setCachedDirty(false);
      this.totalAssetsSubject.next(this.totalAssets);
      return this.totalAssets;
    });
  }

  getClientAssetsByArrayIds(contactIds: string[]): Observable<any> {
    let apiUrl = `api/users/Assets/search`;
    return this.httpClient.post<ClientAsset[]>(apiUrl, { IDs: contactIds });
  }

  /**
   * Update client asset
   * @param userId
   * @param asset
   */
  updateClientAsset(userId: string, asset: ClientAsset) {
    let apiUrl = `api/users/${userId}/Assets`;
    return this.httpClient.put(apiUrl, asset).map(res => {
    });
  }

  getAssetHistoriesFor(userIds: string[]): Observable<TotalBalancetHistory> {
    if (!userIds || userIds && userIds.length === 0) {
      return Observable.of(this.totalAssetBalanceHistory);
    }

    let newIds = [];
    // save ids
    userIds.forEach(id => {
      let cached = this.totalAssetBalanceHistory.get(id);
      // get data if not cached
      if (!cached || this.isCachedDirty) {
        newIds.push(id);
      }
    });

    if (!newIds || newIds.length === 0) {
      return Observable.of(this.totalAssetBalanceHistory);
    }

    let apiUrl = `api/users/AssetsHistory/search`;
    let body = { ids: newIds };
    return this.httpClient.post<BaseResponse<BalanceHistory[]>>(apiUrl, body).map(res => {
      this.totalAssetBalanceHistory.addList(newIds, res && res.data && res.data.data);
      this.setCachedDirty(false);
      return this.totalAssetBalanceHistory;
    });
  }

  getUserAssetHistories(userIds: string[]): Observable<TotalBalancetHistory> {
    if (!userIds) {
      return Observable.of(this.totalAssetBalanceHistory);
    }
    // get list of observable
    let obs: Array<Observable<any>> = [];
    userIds.forEach(id => {
      let cached = this.totalAssetBalanceHistory.get(id);
      if (!cached) {
        let ob = this.getAssetHistoryOfUser(id).map(res => { return { id, history: res }; });
        obs.push(ob);
      }
    });

    if (!obs || obs && obs.length === 0) {
      // notify outside the existing
      return Observable.of(this.totalAssetBalanceHistory);
    }

    return Observable.zip.apply(null, obs).map((res: any[]) => {
      if (res) res.forEach(item => {
        this.totalAssetBalanceHistory.add(item.id, item.history);
      });
      return this.totalAssetBalanceHistory;
    });
  }

  /**
   * get asset history of user
   * @param userId
   */
  getAssetHistoryOfUser(userId: string): Observable<BalanceHistory[]> {
    let apiUrl = `api/users/${userId}/AssetsHistory`;

    return this.httpClient.get<BalanceHistory[]>(apiUrl).map(res => {
      return res;
    });
  }

  /**
   * get user documents
   * @param userId
   */
  getUserDocuments(userId: string, entityId: string): Observable<UserDoc[]> {
    let apiUrl = `api/users/${userId}/documents/Assets/${entityId}`;
    return this.httpClient.get<UserDoc[]>(apiUrl)
      .map(res => {
        return res;
      });
  }


  /**
   * upload user documents
   * @param userId
   */
  uploadUserAssetDocuments(userId: string, entityId: string, file: File): Observable<any> {
    let apiUrl = `${this.configService.getApiUrl()}api/users/${userId}/documents/Assets/${entityId}`;
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
  deleteUserAssetDocuments(userId: string, entityId: string, documentName: string): Observable<any> {
    let apiUrl = `api/users/${userId}/documents/Assets/${entityId}/${documentName}`;
    return this.httpClient.delete(apiUrl).map(res => {
      return res;
    });
  }

  getAssetProjectionOfuser(userId: string): Observable<any> {
    let apiUrl = `api/users/${userId}/AssetProjections`;
    return this.httpClient.get<any>(apiUrl)
      .map(res => {
        return res;
      });
  }

  // use to get asset (if avalible )
  getTotalAssets(): TotalClientAssets {
    return this.totalAssets;
  }

  private setCachedDirty(dirty: boolean = true) {
    this.isCachedDirty = dirty;
  }
}


