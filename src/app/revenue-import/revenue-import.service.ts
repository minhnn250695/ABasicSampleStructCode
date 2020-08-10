import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';

import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';

import { ConfigService } from '../common/services/config-service';

// model
import { Router } from '@angular/router';
import { FpStorageService } from '../local-storage.service';
import {
    BaseResponse, CheckingProgressRequest, Entity,
    ManualMatchData, ManualMatchRequest, Pairs,
    RevenueEntity, SubmitImportRequest,
    UploadData,
} from './models';

// const uploadFileApi = "api/ImportRevenue/upload";
// const getEntityDetailApi = "api/ImportRevenue/entity/";
// const manualMatchEntityapi = "api/ImportRevenue/manualMatch/";
// const submitImportApi = "api/ImportRevenue/submit";
// const checkMatchingProgressApi = "api/ImportRevenue/checkmatchingprogress";
// const getMisMatchListByBashIdAPI = "api/ImportRevenue/batch/"

// api related crm
// const getClientsApi = "api/CRMData/Clients";
// const getProductProvidersApi = "api/CRMData/ProductProviders";
// const getClientAssetApi = "api/CRMData/ClientAssets";
// const getInsuranceProvidersApi = "api/CRMData/InsuranceProviders";
// const getOpportunitiesApi = "api/CRMData/Opportunities";
// const getRevenueCategoryOptionsApi = "api/CRMData/RevenueCategoryOptions";
// const getRevenueTypeOptionsApi = "api/CRMData/RevenueTypeOptions";


@Injectable()
export class RevenueImportService {

    file: File = null;
    // misMatchEntities: Entity[];
    // misMatchEntitiesEvent: BehaviorSubject<Entity[]> = new BehaviorSubject<Entity[]>(null);
    updateRevenueEvent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
    batchIdentifier: string = null;
    private companyPattern: string;

    private clients: Pairs[] = null;
    private productProviders: Pairs[] = null;
    private clientAssets: Pairs[];
    private clientDebts: Pairs[];
    private insuranceProviders: Pairs[];
    private opportunities: Pairs[];
    private revenueCategoryOptions: Pairs[];
    private revenueTypeOptions: Pairs[];

    constructor(private http: Http,
        private httpClient: HttpClient,
        private configService: ConfigService,
        private localStorage: FpStorageService,
        private router: Router) {
        this.companyPattern = configService.getCompanyPattern();
    }

    // setMisMatchEntities(list: Entity[]) {
    //     if (list) {
    //         this.misMatchEntities = list.slice();
    //     }
    //     else {
    //         this.misMatchEntities = null;
    //     }

    //     this.notifyMismatchEntitiesChanged(this.misMatchEntities);
    // }

    getClients(): Pairs[] {
        return this.clients;
    }

    getProductProviders(): Pairs[] {
        return this.productProviders;
    }

    getClientAssets(): Pairs[] {
        if (!this.clientAssets)
            this.getClientAssetsFromCrm().toPromise()
                .then(() => {
                    return this.clientAssets;
                });
        else
            return this.clientAssets;
    }

    getClientAssetByKeyWord(key: string) {
        const apiUrl = `api/${this.companyPattern}CRMData/ClientAssets/${key}`;
        return this.httpClient.get(apiUrl).map((json: BaseResponse<Pairs[]>) => {
            this.clientAssets = [...this.clientAssets, ...json.data.data];
            return json;
        });
    }

    getClientDebtByKeyWord(key: string) {
        let apiUrl = `api/${this.companyPattern}CRMData/ClientDebts/${key}`;
        return this.httpClient.get(apiUrl)
            .map((json: BaseResponse<Pairs[]>) => {
                this.clientDebts = [...this.clientDebts, ...json.data.data];
                return json;
            });

    }

    getProductProviderByKeyWord(key: string) {
        let apiUrl = `api/${this.companyPattern}CRMData/ProductProviders/${key}`;
        return this.httpClient.get(apiUrl)
            .map((json: BaseResponse<Pairs[]>) => {
                this.productProviders = [...this.productProviders, ...json.data.data];
                return json;
            });
    }

    getClientDebts(): Pairs[] {
        return this.clientDebts;
    }

    getClientAssets_2() {
        return this.getClientAssetsFromCrm();
    }



    getOpportunities(): Pairs[] {
        return this.opportunities;
    }

    getInsuranceProviders(): Pairs[] {
        return this.insuranceProviders;
    }

    getRevenueCategoryOptions(): Pairs[] {
        return this.revenueCategoryOptions;
    }

    getRevenueTypeOptions(): Pairs[] {
        return this.revenueTypeOptions;
    }

    /**
     * ====================================================================================
     * UPLOAD FILE RELATED FUNCTIONS
     * ====================================================================================
     */

    getNeededData(bashId: string, callback: (result: any) => void) {
        let obs: Array<Observable<BaseResponse<any>>> = [];
        obs.push(this.getProductProvidersFromCrm());
        obs.push(this.getClientAssetsFromCrm());
        obs.push(this.getInsuranceProvidersFromCrm());
        obs.push(this.getClientDebtsFromCrm());
        obs.push(this.getOpportunitiesFromCrm());
        obs.push(this.getRevenueCategoryOptionsFromCrm());
        obs.push(this.getRevenueTypeOptionsFromCrm());
        obs.push(this.getClientsFromCrm());
        // start getting data in parallel
        Observable.forkJoin(obs).subscribe(
            (res) => {
                callback({success: true, data: res});
            },
            (error) => { callback({success: false, data: error}); }
        );
    }

    /**
     * upload file into crm and get list of mis match entities
     * @param {string} file
     */
    uploadFile(file: File, callback: (error?: any, id?: string) => void) {
        if (!file) { callback("File not found"); return; }
        let formData: FormData = new FormData();
        formData.append('file', file, file.name);

        let apiUrl = this.configService.addCompanyIdToUrl("api/ImportRevenue/upload", true);
        this.http.post(apiUrl, formData, { headers: this.configService.getHeaders() })
            .map((res) => res.json())
            .toPromise()
            .then((response: BaseResponse<UploadData>) => {
                this.handleUploadFileSuccess(response, callback);
            })
            .catch((error: BaseResponse<UploadData>) => {
                console.log("error");
                console.log(error);
                callback(error);
            });
    }

    /**
     * upload file url
     * @param url
     * @param callback
     */
    uploadFileUrl(url: string, callback: (error?: any, id?: string) => void) {
        if (!url) { callback("Link is empty"); return; }

        let formData: FormData = new FormData();
        formData.append('onedriveLink', url);

        let apiUrl = this.configService.addCompanyIdToUrl("api/ImportRevenue/upload", true);
        this.http.post(apiUrl, formData, { headers: this.configService.getHeaders() })
            .map((res) => res.json())
            .toPromise()
            .then((response: BaseResponse<UploadData>) => {
                this.handleUploadFileSuccess(response, callback);
            })
            .catch((error) => {
                console.log("error");
                console.log(error);
                callback(this.getErrorMsg(error) || "Upload link failed");
            });
    }

    /**
     * checking matching progress
     * @param callback: a callback
     */
    checkingMatchingProgress(callback: (error?: string, errorCode?: number, percent?: number, list?: Entity[]) => void) {
        let request = new CheckingProgressRequest(this.batchIdentifier);

        let apiUrl = `api/${this.companyPattern}ImportRevenue/checkmatchingprogress`;
        this.httpClient
            .post(apiUrl, request)
            .toPromise()
            .then((res: BaseResponse<any>) => {
                let isMatchSuccess = this.isSuccessResponse(res);
                if (isMatchSuccess) {
                    callback(null, null, 99, res.data.data);
                }
                else if (res.data.code === 4005) {
                    let perc = (res.data.data.processed / res.data.data.total) * 100;
                    callback(null, res.data.code, perc);
                }
                else {
                    callback(this.getErrorMsg(res) || "Unknown error", res.data.code);
                }
            })
            .catch((error: BaseResponse<Entity[]>) => {
                callback(this.getErrorMsg(error) || "Unknown error");
            });
    }

    /**
     * manual match entity
     */


    manualMatch(entity: RevenueEntity, callback: (error?: string) => void) {
        let apiUrl = `api/${this.companyPattern}/RevenueManagementManualMatch/manualMatch/` + entity.entityId;
        let requestBody = new ManualMatchRequest();
        requestBody.batchIdentifier = this.batchIdentifier;
        requestBody.revenueEntity = entity;

        this.httpClient.put(apiUrl, requestBody)
            .toPromise()
            .then((res: BaseResponse<ManualMatchData>) => {
                let isMatchSuccess = this.isSuccessResponse(res);
                if (isMatchSuccess) { callback(); }
                else { callback(this.getErrorMsg(res) || "Unknown error"); }
            })
            .catch((error: BaseResponse<Entity[]>) => {
                callback(this.getErrorMsg(error) || "Unknown error");
            });
    }


    /**
     * submit import file
     */
    submitImportFile(callback: (error?: string) => void) {
        let request = new SubmitImportRequest(this.batchIdentifier);

        let apiUrl = `api/${this.companyPattern}ImportRevenue/submit`;

        this.httpClient.post(apiUrl, request)
            .toPromise()
            .then((response: BaseResponse<any>) => {
                let isSuccess = this.isSuccessResponse(response);
                if (isSuccess) {
                    this.localStorage.removeBashId();
                    callback();
                }
                else callback(this.getErrorMsg(response) || "Unexpected error");
            })
            .catch((error) => {
                console.log("error");
                console.log(error);
                callback("Import file failed");
            });
    }

    getMatchedRevenueRecords(companyId: string, batchId: string): Observable<any> {
        if (!batchId || batchId === "" || batchId == null) {
            this.router.navigate(["/revenue/upload"]);
            return Observable.of(null);
        }
        this.batchIdentifier = batchId;
        let apiUrl = `api/companies/${companyId}/ImportRevenue/batch/${batchId}/matched`;
        return this.httpClient.get<any>(apiUrl);
    }

    getUnmatchedRevenueRecords(companyId: string, batchId: string): Observable<any> {
        if (!batchId || batchId === "" || batchId == null) {
            this.router.navigate(["/revenue/upload"]);
            return Observable.of(null);
        }
        this.batchIdentifier = batchId;
        let apiUrl = `api/companies/${companyId}/ImportRevenue/batch/${batchId}/unmatched`;
        return this.httpClient.get<any>(apiUrl);
    }

    /**
     * get client assets from CRM
     *
     * @returns {Observable<EventMessage>}
     * @memberof CRMHandlerService
     */
    getClientAssetsFromCrm(): Observable<BaseResponse<Pairs[]>> {
        let apiUrl = `api/${this.companyPattern}CRMData/ClientAssets`;
        return this.httpClient.get(apiUrl)
            .map((json: BaseResponse<Pairs[]>) => {

                this.clientAssets = json.data.data;
                return json;
            });
    }

    /***
     * get client debts from CRM
     *
     */

    getClientDebtsFromCrm(): Observable<BaseResponse<Pairs[]>> {
        let apiUrl = `api/${this.companyPattern}CRMData/ClientDebts`;
        return this.httpClient.get(apiUrl)
            .map((json: BaseResponse<Pairs[]>) => {

                this.clientDebts = json.data.data;
                return json;
            });
    }

    /**
     * get InsuranceProviders from CRM
     *
     * @returns {Observable<EventMessage>}
     * @memberof CRMHandlerService
     */
    getInsuranceProvidersFromCrm(): Observable<BaseResponse<Pairs[]>> {
        let apiUrl = `api/${this.companyPattern}CRMData/InsuranceProviders`;
        return this.httpClient.get(apiUrl)
            .map((json: BaseResponse<Pairs[]>) => {

                this.insuranceProviders = json.data.data;
                return json;
            });
    }

    private handleUploadFileSuccess(response: BaseResponse<UploadData>, callback: (error?: any, id?: string) => void) {
        let isSuccessResponse = this.isSuccessResponse(response);
        if (isSuccessResponse) {
            this.batchIdentifier = response.data.data.batchIdentifier;
            callback(null, this.batchIdentifier);
        }
        else {
            callback(response.error);
        }
    }

    private getErrorMsg(response: BaseResponse<any>): string {
        if (!response) return null;
        if (response.error && response.error.errorMessage) return response.error.errorMessage;
        if (response.data && response.data.message) return response.data.message;
    }

    /**
     * Consider a response is error not not
     */
    private isSuccessResponse(response: BaseResponse<any>) {
        // only response with code = 200 is success one
        if (!response || !response.data || !response.data.code) return false;
        return response.data.code === 200;
    }

    /**
     * ====================================================================================
     * PRIVATE PART
     * ====================================================================================
     */
    /**
     * Get list of clients from CRM
     *
     * @returns {Observable<EventMessage>}
     * @memberof CRMHandlerService
     */
    private getClientsFromCrm(): Observable<BaseResponse<Pairs[]>> {
        let apiUrl = `api/${this.companyPattern}CRMData/Clients`;

        return this.httpClient.get(apiUrl)
            .map((json: BaseResponse<Pairs[]>) => {

                this.clients = json.data.data;
                return json;
            });
    }

    /**
     * get product providers from CRM
     *
     * @returns {Observable<EventMessage>}
     * @memberof CRMHandlerService
     */
    private getProductProvidersFromCrm(): Observable<BaseResponse<Pairs[]>> {
        let apiUrl = `api/${this.companyPattern}CRMData/ProductProviders`;
        return this.httpClient.get(apiUrl)
            .map((json: BaseResponse<Pairs[]>) => {
                this.productProviders = json.data.data;
                return json;
            });
    }

    /**
     * get Opportunities from CRM
     *
     * @returns {Observable<EventMessage>}
     * @memberof CRMHandlerService
     */
    private getOpportunitiesFromCrm(): Observable<BaseResponse<Pairs[]>> {
        let apiUrl = `api/${this.companyPattern}CRMData/Opportunities`;
        return this.httpClient.get(apiUrl)
            .map((json: BaseResponse<Pairs[]>) => {

                this.opportunities = json.data.data;
                return json;
            });
    }


    /**
     * get RevenueCategoryOptions from CRM
     *
     * @returns {Observable<EventMessage>}
     * @memberof CRMHandlerService
     */
    private getRevenueCategoryOptionsFromCrm(): Observable<BaseResponse<Pairs[]>> {
        let apiUrl = `api/${this.companyPattern}CRMData/RevenueCategoryOptions`;

        return this.httpClient.get(apiUrl)
            .map((json: BaseResponse<Pairs[]>) => {

                this.revenueCategoryOptions = json.data.data;
                // this.revenueCategoryOptions.unshift({ id: "0", value: "" }); // default option
                return json;
            });
    }

    /**
     * get RevenueTypeOptions from CRM
     *
     * @returns {Observable<EventMessage>}
     * @memberof CRMHandlerService
     */
    private getRevenueTypeOptionsFromCrm(): Observable<BaseResponse<Pairs[]>> {
        let apiUrl = `api/${this.companyPattern}CRMData/RevenueTypeOptions`;
        return this.httpClient.get(apiUrl)
            .map((json: BaseResponse<Pairs[]>) => {

                this.revenueTypeOptions = json.data.data;
                return json;
            });
    }

    // private getMisMatchListByBashId(bashId: string, forceUpdate: boolean = false): Observable<BaseResponse<Entity[]>> {
    //     // if bash id is not valid and there is some mis match entities already
    //     // ==> return
    //     // bashId = "test-improve-revenue-category201906130221284057.xlsx_4b8c455b-e507-43af-87c2-50726a8d8850";
    //     if (!forceUpdate && (this.misMatchEntities || !bashId)) return null;

    //     this.batchIdentifier = bashId;

    //     let headers = new HttpHeaders({
    //         'Cache-Control': 'no-cache',
    //         'Pragma': 'no-cache',
    //     });

    //     let apiUrl = `api/${this.companyPattern}ImportRevenue/batch/` + bashId;
    //     return this.httpClient.get(apiUrl, { headers })
    //         .map((res: BaseResponse<Entity[]>) => {
    //             // save data into variable
    //             this.misMatchEntities = res.data.data;
    //             this.notifyMismatchEntitiesChanged(this.misMatchEntities);
    //             return res;
    //         });
    // }

    /**
     * Notify mismatch entities list
     */
    // private notifyMismatchEntitiesChanged(list: Entity[]) {
    //     this.misMatchEntitiesEvent.next(list);
    // }

    // handler update matched and unmatched list
    // private updateRevenues() {
    //     this.updateRevenueEvent.next(true);
    // }
}
