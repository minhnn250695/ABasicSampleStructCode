import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import {
  ClientAsset, DeleteClientAsset, Entity,
  HomeList, HomeUnmatchedList, ImportClientAsset,
  ImportRecord, ImportResponse, Insurance, PersonalDetail, PlatFormData, UpdateClientAsset, ClassFundData,
} from "./models";

import { BaseResponse, Provider } from "./models";

import { ISubscription } from "rxjs/Subscription";
import { ConfigService } from "../common/services/config-service";
import { FpStorageService } from "../local-storage.service";
import { Pairs } from "../revenue-import/models/pairs.model";

import { ConfirmationDialogService } from '../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { LoadingSpinnerService } from '../common/components/loading-spinner/loading-spinner.service';

const uploadFileApi = "api/DataFeedsManualImport";

@Injectable()
export class DataFeedsService {

  isDirty: boolean = false;
  isSelectedDateChanged: boolean = false;

  private selectedProvider = new Provider();
  private baseApiUrl: string;
  private uploadISubscription: ISubscription;
  private companyPattern: string;
  private errorRequest: Subject<any> = new Subject<any>();

  constructor(private http: Http, private httpClient: HttpClient,
    private configService: ConfigService,
    private localStorage: FpStorageService,
    private confirmDialogService: ConfirmationDialogService,
    private loadingService: LoadingSpinnerService) {
    this.baseApiUrl = configService.getApiUrl();
    this.companyPattern = configService.getCompanyPattern();
  }

  //#region LANDING PAGE

  /**
   * 1. GET UNMATCHED LIST
   * 2. DELETE UNMATCHED LIST
   * 3.1 GET ASSET
   * 3.2 GET DEBTS
   * 3.3 GET INSURANCE
   * 3.4 GET HOUSEHOLD
   */

  // 1
  getThirdPartyOverview(): Observable<HomeList> {

    const headers = new HttpHeaders({
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    });

    const apiUrl = `api/${this.companyPattern}DataFeedsMatching/GetRecordStatistics`;
    return this.httpClient.get<BaseResponse<HomeList>>(apiUrl, { headers })
      .map((response) => {
        if (response) {
          const data = response && response.data && response.data.data;
          this.isDirty = false;
          return data;
        }
      });

  }

  getHomeUnMatchedList(): Observable<HomeUnmatchedList[]> {

    const headers = new HttpHeaders({
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    });

    const apiUrl = `api/${this.companyPattern}DataFeedsMatching/GetUnmatched`;
    return this.httpClient.get<BaseResponse<HomeUnmatchedList[]>>(apiUrl, { headers })
      .map((response) => {
        if (response) {
          const data = response && response.data && response.data.data;
          this.isDirty = false;
          return data;
        }
      });
  }

  // 2
  deleteHomeUnMatchedList(list: any[], callback: (error?: string) => void) {
    if (list.length > 0) {
      const form = this.createDeleteHomeUnMatchedForm(list);

      if (form) {
        this.isDirty = true;

        const apiUrl = `api/${this.companyPattern}DataFeedsMatching/DeleteUnmatchedRecords`;
        this.httpClient.post(apiUrl, form)
          .subscribe(() => {
            callback(null);
          }, (error) => {
            callback(error);
          });
      }
    }
  }

  // 3.1
  getAssets(): Observable<any> {
    const apiUrl = `api/${this.companyPattern}CRMData/ClientAssets`;
    return this.httpClient.get<BaseResponse<Pairs[]>>(apiUrl)
      .map((response) => {
        const data = response && response.data && response.data.data;
        return data;
      });
  }

  // 3.2
  getDebts(): Observable<Pairs[]> {
    const apiUrl = `api/${this.companyPattern}CRMData/ClientDebts`;
    return this.httpClient.get<BaseResponse<Pairs[]>>(apiUrl)
      .map((response) => {
        const data = response && response.data && response.data.data;
        return data;
      });
  }

  // 3.3
  getInsurance(): Observable<Pairs[]> {
    const apiUrl = `api/${this.companyPattern}CRMData/InsuranceProviders`;
    return this.httpClient.get<BaseResponse<Pairs[]>>(apiUrl)
      .map((response) => {
        const data = response && response.data && response.data.data;
        return data;
      });
  }

  // 3.4
  getHouseHold(): Observable<Pairs[]> {
    const apiUrl = `api/${this.companyPattern}CRMData/Households`;
    return this.httpClient.get<BaseResponse<Pairs[]>>(apiUrl)
      .map((response) => {
        const data = response && response.data && response.data.data;
        return data;
      });
  }

  getSummaryMatchedList(): Observable<HomeUnmatchedList[]> {

    const apiUrl = `api/${this.companyPattern}DataFeedsMatching/GetMatched`;
    return this.httpClient.get<BaseResponse<HomeUnmatchedList[]>>(apiUrl)
      .map((response) => {
        if (response) {
          const data = response && response.data && response.data.data;
          return data;
        }
      });
  }

  //#endregion

  //#region MANUAL IMPORT

  /**
   * 1. GET MATCHED
   * 2. GET UNMATCHED
   * 3. UPDATE UNMATCHED
   * 4. UPLOAD CSV FILE
   * 5. CANCEL UPLOAD
   * 6. IMPORT RECORDS TO CRM
   * 7. DELETE RECORDS
   */

  // 1
  getMatchedRecords(): Observable<ImportRecord[]> {
    const batchId = this.localStorage.getDataFeedBashId();
    if (!batchId) {
      return Observable.of(null);
    }
    const headers = new HttpHeaders({
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    });
    const apiUrl = `api/${this.companyPattern}DataFeedsManualImport/batch/${batchId}/match`;
    return this.httpClient.get<BaseResponse<any>>(apiUrl, { headers })
      .map((response) => {
        const data = response && response.data && response.data.data;
        return data && data.matchList;
      });
  }

  // 2
  getUnMatchedRecords(): Observable<ImportRecord[]> {
    const batchId = this.localStorage.getDataFeedBashId();
    if (!batchId)
      return Observable.of(null);

    const headers = new HttpHeaders({
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    });
    const apiUrl = `api/${this.companyPattern}DataFeedsManualImport/batch/${batchId}/unmatch`;
    return this.httpClient.get<BaseResponse<any>>(apiUrl, { headers })
      .map((response) => {
        const data = response && response.data && response.data.data;
        return data && data.unMatchList;
      });
  }

  // 3
  updateUnMatchedRecord(record: ImportRecord, callback: (error?: string) => void) {
    const updateForm = this.createUpdateForm(record);

    const apiUrl = `api/${this.companyPattern}DataFeedsManualImport/batch`;
    this.httpClient.put(apiUrl, JSON.stringify(updateForm))
      .subscribe(() => {
        callback(null);
      },
        (err) => {
          console.log(err);
        });
  }

  // 4
  uploadFile(file: File, callback: (error?: string) => void) {
    const formData: FormData = new FormData();
    formData.append("File", file);

    const apiUrl = this.configService.addCompanyIdToUrl(uploadFileApi);

    this.uploadISubscription = this.http.post(this.baseApiUrl + apiUrl, formData, { headers: this.configService.getHeaders() })
      .map((res) => res.json())
      .map((response: BaseResponse<ImportResponse>) => {
        // save bash id to local storage
        const data = response && response.data && response.data.data;
        this.localStorage.saveDataFeedBashId(data && data.batchId);
        return response;
      })
      .subscribe(() => {
        callback(null);
      },
        (err) => {
          console.log("error" + err);
          callback(err);
        });
  }

  // 5
  cancelUploadFile(request: boolean) {
    if (request === true) {
      this.uploadISubscription.unsubscribe();
    }
  }

  // 6
  importRecordsToCRM(records: ImportRecord[], callback: (error?: string) => void) {

    if (records.length === 0) return;

    const list = new ImportClientAsset();
    list.BatchId = this.localStorage.getDataFeedBashId();
    list.ClientAssets = records;

    const apiUrl = `api/${this.companyPattern}DataFeedsImport/ClientAsset`;
    this.httpClient.post(apiUrl, JSON.stringify(list))
      .subscribe(() => {
        callback(null);
      },
        (err) => {
          callback(err);
        });
  }

  // 7
  deleteRecords(records: ImportRecord[], callback: (error?: string) => void) {

    const list = this.createDeleteForm(records);
    const apiUrl = `api/${this.companyPattern}DataFeedsManualImport/batch/delete`;
    this.httpClient.post(apiUrl, JSON.stringify(list))
      .subscribe(() => {
        callback(null);
      },
        (err) => {
          callback(err);
        });
  }

  //#endregion

  //#region PERSONAL INSURANCE

  /**
   * 1.1 SET PROVIDER
   * 1.2 GET PROVIDER
   * 2.1 SEARCH BY POLICY #
   * 2.2 SEARCH BY CRMID
   * 3. GET MATCHED
   * 4. GET UNMATCHED
   * 5. UPDATE UNMATCHED
   * 6. IMPORT TO CRM
   * 7. DELETE RECORDS
   */

  // 1.1
  setSelectedProvider(name: string) {
    if (name) {
      this.selectedProvider.Provider = name;
      // this.selectedProvider.Date = date ? date: null;
      this.isSelectedDateChanged = true;
      localStorage.setItem("selectedProvider", JSON.stringify(this.selectedProvider));
    }
  }

  // 1.2
  getSelectedProvider(): Provider {
    const provider = localStorage.getItem("selectedProvider");
    if (provider) {
      return JSON.parse(provider);
    }
    return null;
  }

  removeSelectedProvider() {
    const provider = localStorage.getItem("selectedProvider");
    if (provider) {
      localStorage.setItem("selectedProvider", undefined);
    }
  }

  // 2.1
  getInsuranceProviderbyPolicyNumber(id: number): Observable<Insurance> {
    if (!id) { return; }

    const apiUrl = `api/${this.companyPattern}DataFeedsMatching/SearchInsuranceByPolicy/${id}`;
    return this.httpClient.get<BaseResponse<Insurance>>(apiUrl)
      .map((response) => {
        const data = response && response.data && response.data.data;
        return data;
      });
  }

  // 2.2
  getInSuranceProviderbyCrmId(id: string): Observable<any> {
    if (!id) { return; }

    const apiUrl = `api/${this.companyPattern}DataFeedsMatching/SearchInsuranceById/${id}`;
    return this.httpClient.get<BaseResponse<any>>(apiUrl);
  }

  // 3
  getInsuranceMatchedList(provider: Provider): Observable<Array<Entity<Insurance>>> {
    if (provider) {
      const apiUrl = `api/${this.companyPattern}DataFeedsMatching/MatchedInsurance`;
      return this.httpClient.post<BaseResponse<any>>(apiUrl, JSON.stringify(provider))
        .map((response) => {
          const data = response && response.data && response.data.data;
          return data;
        });
    }
  }

  // 4
  getInsuranceUnMatchedList(provider: Provider): Observable<any> {
    if (provider) {
      const apiUrl = `api/${this.companyPattern}DataFeedsMatching/UnmatchedInsurance`;
      return this.httpClient.post<BaseResponse<any>>(apiUrl, JSON.stringify(provider))
        .map((response) => {
          const data = response && response.data && response.data.data;
          return data;
        });
    }
  }

  // 5
  updateUnMatchedInsurance(record: any): Observable<any> {
    if (record) {
      this.isDirty = true;
      const apiUrl = `api/${this.companyPattern}DataFeedsMatching/ManualMatch`;
      return this.httpClient.put<BaseResponse<any>>(apiUrl, JSON.stringify(record)).debounceTime(500);
    }
  }

  importInsuranceRecordsToCRM(records: Array<Entity<Insurance>>): Observable<any> {
    const form = this.convertFromEntityToInsurance(records);
    this.isDirty = true;

    const apiUrl = `api/${this.companyPattern}DataFeedsImport/Insurance`;
    return this.httpClient.post(apiUrl, form);
  }

  // 7
  deleteInsuranceRecords(name: string, records: Array<Entity<Insurance>>, callback: (error?: string) => void) {
    if (!records || records.length === 0) return;
    this.isDirty = true;

    const deleteIds = records.map((record) => record.externalId);
    const deleteForm = this.createInsuranceDeleteForm(deleteIds);

    const apiUrl = `api/${this.companyPattern}DataFeedsMatching/${name}`;
    this.httpClient.post(apiUrl, deleteForm)
      .subscribe(() => {
        callback(null);
      }, (error) => {
        callback(error);
      });
  }

  //#endregion

  //#region CLIENT ASSET

  /**
   * 1. GET MATCH
   * 2. GET UNMATCH
   * 3. GET IGNORE
   * 4. UPDATE RECORD
   * 5. IMPORT CLIENT ASSET FROM MONEY SOFT TO CRM
   * 6. IMPORT CLIENT ASSET TO CRM
   * 7. IGNORE RECORD
   * 8. RETURN IGNORED
   * 9. DELETE IGNORED
   */

  // 1
  getClientAssetMatchedList(provider: any): Observable<Array<Entity<any>>> {
    if (provider) {
      const apiUrl = `api/${this.companyPattern}DataFeedsMatching/matched`;
      return this.httpClient.post<BaseResponse<any>>(apiUrl, JSON.stringify(provider))
        .map((response) => {
          const data = response && response.data && response.data.data;
          return data;
        });
    }
  }


  // 2
  getClientAssetUnMatchedList(provider: any): Observable<Array<Entity<any>>> {
    if (provider) {
      const apiUrl = `api/${this.companyPattern}DataFeedsMatching/Unmatched`;
      return this.httpClient.post<BaseResponse<any>>(apiUrl, JSON.stringify(provider))
        .map((response) => {
          const data = response && response.data && response.data.data;
          return data;
        });
    }
  }

  // 3
  getClientAssetIgnoredList(): Observable<Array<Entity<ClientAsset>>> {
    const headers = new HttpHeaders({
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    });

    const apiUrl = `api/${this.companyPattern}DataFeedIgnore/MoneySoft/ClientAsset`;
    return this.httpClient.get<BaseResponse<any>>(apiUrl, { headers })
      .map((response) => {
        const data = response.data.data;
        return data;
      });
  }

  // 4 using to match these client asset unmatched yet
  updateClientAssetRecord(record: Entity<any>, option?: number, isPlatFormData?: boolean): Observable<number> {
    if (!record) return;
    this.isDirty = true;

    const form = this.createClientAssetUpdateForm(record, option, isPlatFormData);

    const apiUrl = `api/${this.companyPattern}DataFeedsMatching/ManualMatch`;
    return this.httpClient.put<BaseResponse<any>>(apiUrl, form)
      .map((response) => {
        const data = response && response.data && response.data.code;
        return data;
      });
  }

  // 5
  importClientAssetFromMoneySoftToCRM(records: Array<Entity<ClientAsset>>, callback: (error?: string) => void) {
    if (records.length > 0) {

      const importForm = this.createClientAssetImportForm(records);
      this.isDirty = true;

      if (importForm.FinancialAccounts.length > 0) {
        const apiUrl = `api/${this.companyPattern}DataFeedsImport/MoneySoft/FinancialAccount`;

        this.httpClient.post(apiUrl, importForm)
          .subscribe(() => {
            callback(null);
          }, (error) => {
            callback(error);
          });
      }
    }
  }

  // 6
  importClientAssetToCRM(provider: string, records: Array<Entity<PlatFormData>>): Observable<any> {
    if (records.length > 0) {
      const importForm = this.createClientAssetPlatFormDataImport(records);
      // this.isDirty = true;
      if (importForm.ClientAssets.length > 0) {
        const apiUrl = `api/${this.companyPattern}DataFeedsImport/${provider}/ClientAssetsImport`;

        return this.httpClient.post(apiUrl, importForm);
      }
    }
  }

  // // 6
  // importClientAssetToCRM(provider: string, records: Entity<PlatFormData>[], callback: (error?: string) => void) {
  //   if (records.length > 0) {
  //     let importForm = this.createClientAssetPlatFormDataImport(records);
  //     this.isDirty = true;

  //     if (importForm.ClientAssets.length > 0) {
  //       let apiUrl = `api/${this.companyPattern}DataFeedsImport/${provider}/ClientAssetsImport`;

  //       this.httpClient.post(apiUrl, importForm)
  //         .subscribe((response: any) => {
  //           if (response.success)
  //             callback(null);
  //           else {
  //               callback(response);
  //           }
  //         }, error => {
  //           callback(error);
  //         })
  //     }
  //   }
  // }

  // 7
  ignoreList(providers: Array<Entity<ClientAsset>>, callback: (error?: string) => void) {

    if (providers) {
      this.isDirty = true;

      const apiUrl = `api/${this.companyPattern}DataFeedIgnore`;
      const ignoreIds = providers.map((x) => x.externalId);
      const ignoreForm = this.createIgnoreForm(ignoreIds);


      this.httpClient.post<BaseResponse<any>>(apiUrl, JSON.stringify(ignoreForm))
        .subscribe((response) => {
          const result = response.data.data;
          callback(null);

        }, (error) => {
          callback(error);
        });
    }
  }

  // 8
  returnIgnoredRecord(record: Entity<ClientAsset>, option?: number): Observable<number> {
    if (!record) return;
    this.isDirty = true;

    const form = this.createClientAssetUpdateForm(record, option);
    if (form) {
      const apiUrl = `api/${this.companyPattern}DataFeedIgnore/manualMatch`;
      return this.httpClient.post<BaseResponse<any>>(apiUrl, form)
        .map((response) => {
          const data = response && response.data && response.data.code;
          return data;
        });
    }

  }

  // 9
  deleteIgnoredList(providers: Array<Entity<ClientAsset>>, callback: (error?: string) => void) {
    if (!providers || providers.length === 0) return;
    this.isDirty = true;

    const apiUrl = `api/${this.companyPattern}DataFeedIgnore/delete`;
    const ignoreIds = providers.map((x) => x.externalId);
    const ignoreForm = this.createIgnoreForm(ignoreIds);

    this.httpClient.post<BaseResponse<any>>(apiUrl, ignoreForm)
      .subscribe((response) => {
        const result = response.data.data;
        callback(null);

      }, (error) => {
        console.log(error);
        callback(error);
      });
  }



  //#endregion

  //#region CLIENT

  /**
   * 1. GET MATCHED
   * 2. GET UNMATCHED
   * 3. UPDATE RECORD
   */

  // get matched client
  getClientMatchedList(provider: any): Observable<Array<Entity<PersonalDetail>>> {
    if (provider) {
      const apiUrl = `api/${this.companyPattern}DataFeedsMatching/matched`;
      return this.httpClient.post<BaseResponse<any>>(apiUrl, JSON.stringify(provider))
        .map((response) => {
          const data = response && response.data && response.data.data;
          return data;
        });
    }
  }

  // get unmatched client
  getClientUnMatchedList(provider: any): Observable<Array<Entity<PersonalDetail>>> {
    if (provider) {
      const apiUrl = `api/${this.companyPattern}DataFeedsMatching/Unmatched`;
      return this.httpClient.post<BaseResponse<any>>(apiUrl, JSON.stringify(provider))
        .map((response) => {
          const data = response && response.data && response.data.data;
          return data;
        });
    }
  }

  // update client
  updateClientRecord(record: Entity<any>, callback: (error?: string) => void) {
    if (!record) return;
    this.isDirty = true;

    const apiUrl = `api/${this.companyPattern}DataFeedsMatching/ManualMatch`;
    this.httpClient.put(apiUrl, record).subscribe(() => {
      callback(null);
    }, (error) => {
      console.log(error);
      callback(error);
    });
  }

  //#endregion

  //#region Common APIs

  updateMatchedRecords(form: any): Observable<number> {
    const apiUrl = `api/${this.companyPattern}DataFeedsMatching/Matched`;

    if (form !== undefined) {
      return this.httpClient.put<BaseResponse<any>>(apiUrl, form).map((res) => {
        const data = res && res.data && res.data.code;
        return data;
      });
    }
  }

  showError(): Observable<any> {
    return this.errorRequest.asObservable();
  }

  showErrorRequest(message: string) {
    this.errorRequest.next(message);
  }
  //#endregion

  //#region Class
  /**
   *
   * 1. GET ACCOUNT MATCHED
   * 2. GET CLIENT MATCHED
   * 3. GET CLIENT BY ID
   * 4. GET CRM DATA - LIST
   * 5. UPDATE MANUAL MATCH RECORD
   */

  // Get CRM Client - Account Type Matched
  getCRMClientAccountTypeMatch(): Observable<Array<Pairs>> {
    const apiUrl = `api/${this.companyPattern}CRMData/ProductProviders`;
    return this.httpClient.get<BaseResponse<any>>(apiUrl)
      .map((response) => {
        const data = response && response.data && response.data.data ? response.data.data : [];
        return data;
      });
  }

  // Get CRM Client Matched
  getCRMClientMatch(): Observable<Array<Pairs>> {
    const apiUrl = `api/${this.companyPattern}CRMData/Clients`;
    return this.httpClient.get<BaseResponse<any>>(apiUrl)
      .map((response) => {
        const data = response && response.data && response.data.data ? response.data.data : [];
        return data;
      });
  }

  // Get Client Asset Ignored List
  getClientAssetIgnoredRecords(provider: string): Observable<Array<Entity<ClientAsset>>> {
    const apiUrl = `api/${this.companyPattern}DataFeedIgnore/${provider}/ClientAsset`;
    return this.httpClient.get<BaseResponse<any>>(apiUrl)
      .map((response) => {
        const data = response && response.data && response.data.data ? response.data.data : [];
        return data;
      });
  }

  // Get CRM Member List
  getCRMDataMembers(): Observable<Array<Pairs>> {
    const apiUrl = `api/${this.companyPattern}CRMData/Members`;
    return this.httpClient.get<BaseResponse<any>>(apiUrl)
      .map((response) => {
        const data = response && response.data && response.data.data ? response.data.data : [];
        return data;
      });
  }

  // Get CRM Member List
  getCRMDataClientAssets(): Observable<Array<Pairs>> {
    const apiUrl = `api/${this.companyPattern}CRMData/ClientAssets`;
    return this.httpClient.get<BaseResponse<any>>(apiUrl)
      .map((response) => {
        const data = response && response.data && response.data.data ? response.data.data : [];
        return data;
      });
  }

  // Get CRM Client - Account Type Matched
  getCRMClientAccountById(clientId: string): Observable<any> {
    const apiUrl = `api/${this.companyPattern}CRMData/Accounts/${clientId}`;
    return this.httpClient.post<BaseResponse<any>>(apiUrl, JSON.stringify(clientId))
      .map((response) => {
        const data = response && response.data && response.data.data ? response.data.data : {};
        return data;
      });
  }

  // Get CRM Client - Account Type Matched
  getCRMClientById(clientId: string): Observable<any> {
    const reqPayload = { "ContactId": clientId };
    const apiUrl = `api/${this.companyPattern}CRMData/Contacts`;
    return this.httpClient.post<BaseResponse<any>>(apiUrl, JSON.stringify(reqPayload))
      .map((response) => {
        const data = response && response.data && response.data.data ? response.data.data : {};
        return data;
      });
  }
  // Get CRM Client - Account Type Matched
  getCRMClientAssetById(clientId: any): Observable<any> {
    const apiUrl = `api/${this.companyPattern}CRMData/ClientAssets`;
    const reqPayload = { assetsId: clientId };
    return this.httpClient.post<BaseResponse<any>>(apiUrl, JSON.stringify(reqPayload))
      .map((response) => {
        const data = response && response.data && response.data.data ? response.data.data[0] : {};
        return data;
      });
  }
  // Get CRM Client - Account Type Matched
  getCRMMemberById(member: any): Observable<any> {
    const apiUrl = `api/${this.companyPattern}CRMData/Members`;
    const reqPayload = { memberID: member };
    return this.httpClient.post<BaseResponse<any>>(apiUrl, JSON.stringify(reqPayload))
      .map((response) => {
        const data = response && response.data && response.data.data ? response.data.data : {};
        return data;
      });
  }

  // Update record
  updateClassManualMatchRecord(form: any, isMatched: boolean) {
    const type = isMatched ? "Matched" : "ManualMatch";
    const apiUrl = `api/${this.companyPattern}DataFeedsMatching/${type}`;
    return this.httpClient.put<BaseResponse<any>>(apiUrl, JSON.stringify(form))
      .map((response) => {
        const data = response && response.data && response.data.code;
        return data;
      });
  }

  // Update Ignored record
  updateClassManualMatchIgnoredRecord(form: any) {
    // const type = isMatched ? "Matched" : "ManualMatch";
    const apiUrl = `api/${this.companyPattern}DataFeedIgnore/manualMatch`;
    return this.httpClient.post<BaseResponse<any>>(apiUrl, JSON.stringify(form))
      .map((response) => {
        const data = response && response.data && response.data.code;
        return data;
      });
  }

  // add Ignore match records
  addClientAssetIgnoredRecords(provider: string, list: Array<Entity<ClientAsset>>, callback: (error?: string) => void) {

    if (list) {
      this.isDirty = true;

      const apiUrl = `api/${this.companyPattern}DataFeedIgnore`;
      const ignoreIds = list.map((x) => x.externalId);
      const ignoreForm = this.createClientAssetIgnoreForm(ignoreIds, provider);

      this.httpClient.post<BaseResponse<any>>(apiUrl, JSON.stringify(ignoreForm))
        .subscribe((response) => {
          const result = response.data.data;
          callback(null);

        }, (error) => {
          callback(error);
        });
    }
  }

  // add Ignore match records
  deleteClientAssetIgnoredRecords(provider: string, list: Array<Entity<ClientAsset>>, callback: (error?: string) => void) {

    if (list) {
      this.isDirty = true;

      const apiUrl = `api/${this.companyPattern}DataFeedIgnore/delete`;
      const ignoreIds = list.map((x) => x.externalId);
      const ignoreForm = this.createClientAssetIgnoreForm(ignoreIds, provider);

      this.httpClient.post<BaseResponse<any>>(apiUrl, JSON.stringify(ignoreForm))
        .subscribe((response) => {
          const result = response.data.data;
          callback(null);

        }, (error) => {
          callback(error);
        });
    }
  }

  // Import Account record to CRM
  importClassManualMatchToCRM(providerType: string, records: Array<Entity<any>>): Observable<any> {
    if (records.length > 0) {
      if (providerType == "ClientAsset") {
        const importForm = this.createClientAssetPlatFormDataImport(records);
        if (importForm.ClientAssets.length > 0) {
          const apiUrl = `api/${this.companyPattern}DataFeedsImport/Class/ClientAssetsImport`;
          return this.httpClient.post(apiUrl, importForm);
        }
      }
      else if (providerType == "Member") {
        const importForm = this.createClassManualMatchImport(records);
        if (importForm.ExternalIds.length > 0) {
          const apiUrl = `api/${this.companyPattern}DataFeedsImport/${providerType}`;
          return this.httpClient.post(apiUrl, importForm);
        }
      }
      else if (providerType == "Client") {
        const type = ["Account", "Client"];
        const matchType = ["Company", "Contact"];
        for (var i = 0; i < type.length; i++) {
          const list = records.filter(rec => rec.entityName == type[i]);
          const importForm = this.createClassManualMatchImport(list);
          if (importForm.ExternalIds.length > 0) {
            const apiUrl = `api/${this.companyPattern}DataFeedsImport/${matchType[i]}`;
            return this.httpClient.post(apiUrl, importForm);
          }
        }
      }
    }
  }
  // Import Client record to CRM
  // Import Client Asset record to CRM
  // Import Member record to CRM
  // Create Class Manual Match Import form
  // Create Client Asset Add Ignore record form
  private createClassManualMatchImport(records: Array<Entity<any>>) {
    const formResult = {
      Provider: "Class",
      ExternalIds: []
    };

    records.forEach((element) => {
      if (element.externalId)
        formResult.ExternalIds.push(element.externalId);
    });

    return formResult;
  }

  private createClientAssetIgnoreForm(providerId: string[], provider: string) {
    const form = {
      ProviderName: provider,
      EntityName: "ClientAsset",
      ExternalId: providerId,
    };
    return form;
  }
  //#endregion

  /**
   * PRIVATE SECTION
   *
   */

  //#region Import form

  /**
   * Convert from list of entity<insurance> to list of insurance
   *
   * @param records
   */
  private convertFromEntityToInsurance(records: Array<Entity<Insurance>>) {
    const importList: Insurance[] = [];

    if (records && records.length > 0) {
      records.forEach((record) => {
        const element: Insurance = new Insurance();

        element.providerName = record.providerName;
        element.entityName = record.entityName;
        element.externalId = record.externalId;
        element.crmId = record.information.crmId;
        element.productProvider = record.information.productProvider;
        element.policyType = record.information.policyType;
        element.policyNumber = record.information.policyNumber;
        element.policyStatus = record.information.policyStatus;
        element.policyOwner = record.information.policyOwner;
        element.issueDate = record.information.issueDate;
        element.insuranceBenefits = record.information.insuranceBenefits;

        importList.push(element);
      });
    }

    const form = {
      ProviderName: "TAL",
      SourceName: "PersonalInsurance",
      PersonalInsurances: importList,
    };

    return form;
  }

  // client asset form for moneysoft
  private createClientAssetImportForm(records: Array<Entity<ClientAsset>>) {
    const formResult = {
      FinancialAccounts: [],
    };

    records.forEach((element) => {

      const form = {
        Number: element.information.number,
        CurrentBalance: element.information.currentBalance,
        CrmId: element.information.crmId,
        AssetType: element.information.assetType,
        ExternalId: element.externalId,
      };
      if (form)
        formResult.FinancialAccounts.push(form);
    });

    return formResult;
  }

  // client asset form for Hub24
  private createClientAssetPlatFormDataImport(records: Array<Entity<PlatFormData>>) {
    const formResult = {
      ClientAssets: [],
    };

    records.forEach((element) => {

      const form = {
        Number: element.platformData.accountData.accountID,
        CurrentBalance: 0,
        CrmId: element.platformData.accountCRMID,
        AssetType: 1,
        ExternalId: element.externalId,
      };
      if (form)
        formResult.ClientAssets.push(form);
    });

    return formResult;
  }
  //#endregion

  //#region Update form

  // manual import
  private createUpdateForm(record: ImportRecord): UpdateClientAsset {
    if (record) {
      const form = new UpdateClientAsset();
      form.ProviderName = this.localStorage.getDataFeedBashId();
      form.EntityName = "ClientAsset";
      form.ExternalId = record.externalId;
      form.LocalId = record.crmId;
      form.EntityData = record;
      return form;
    }
  }

  // client asset
  private createClientAssetUpdateForm(record: Entity<any>, option?: number, isPlatFormData = false): UpdateClientAsset {
    if (!record) return null;

    else {
      const form = new UpdateClientAsset();
      form.ProviderName = record.providerName;
      form.EntityName = record.entityName;
      form.ExternalId = record.externalId;
      form.CrmId = record.crmId;
      form.OverwriteOption = option ? option : 0;
      form.Information = {};
      // if this record's type is PlatFormData then assign platformData for form object
      // to avoid undefined "record.platformData"
      if (isPlatFormData) {
        form.PlatFormData = record.platformData;
      } else form.PlatFormData = {};
      return form;
    }
  }

  //#endregion

  //#region delete form

  // home page
  private createDeleteHomeUnMatchedForm(list: any[]) {
    if (list.length > 0) {
      const form = {
        Items: [],
      };
      list.forEach((item) => {
        const temp = {
          ProviderName: item.name,
          EntityName: item.type.replace(" ", ""),
          Date: item.date,
        };
        form.Items.push(temp);
      });

      return form;
    }
  }

  // client asset
  private createDeleteForm(records: ImportRecord[]): DeleteClientAsset {

    if (records) {
      const list = new DeleteClientAsset();
      list.BatchId = this.localStorage.getDataFeedBashId();
      list.ExternalId = records.map((x) => x.externalId);

      return list;
    }

    return null;
  }

  private createIgnoreForm(providerId: string[]) {
    const form = {
      ProviderName: "MoneySoft",
      EntityName: "ClientAsset",
      ExternalId: providerId,
    };
    return form;
  }

  // insurance
  private createInsuranceDeleteForm(records: string[]) {
    const form = {
      ProviderName: "TAL",
      EntityName: "PersonalInsurance",
      Records: records,
    };

    return form;
  }
  // manual match
  //#endregion

  //#region handling loading spinner
  showLoading() {
    this.loadingService.show();
  }

  hideLoading() {
    this.loadingService.hide();
  }
  //#endregion

}