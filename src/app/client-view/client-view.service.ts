import { HttpClient, HttpHeaders, } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Observable } from 'rxjs/Observable';

// services
import { ConfigService } from '../common/services/config-service';
import { FpStorageService } from '../local-storage.service';
import { SecurityService } from '../security/security.service';
import { CashFlowService } from './cash-flow/cash-flow.service';
import { ClientAssetService } from './client-asset/client-asset.service';
import { ClientDebtService } from './client-debt/client-debt.service';
import { PersonalProtectionService } from './client-protection/personal-protection.service';
import { LoadingSpinnerService } from '../common/components/loading-spinner/loading-spinner.service';

// models
import { ApiDataResult } from '../common/api/api-data-result';
import { ApiResult } from '../common/api/api-result';
import { ConfirmationDialogService } from '../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { BaseResponse } from '../third-party/models/index';
import { Pair } from './client-doc-storage/models/index';
import {
    AssetProjection, Client, ClientCalculation, ClientViewState, Contact, DebtProjection,
    HouseHoldCashFlow, HouseHoldResponse, InvestfitAuthenticationInit, InvestfitAuthenticationStatus,
    PersonalProtectionOutcomesModel, RetirementProjectionModel, RetirementReport, RetirementReportStatus, RetirementReportUrl, ScenarioDetailsModel, ScenarioDebtProjection
} from './models';
import { CurrentScenarioModel } from './models/current-scenario/current-scenario.model';
import { ClientInsuranceService } from './client-insurance/client-insurance.service';
import { FamilyMembers } from './advice-builder/advice-builder.service';

@Injectable()
export class ClientViewService {
    // state data
    isLoadingData = false;
    isGotHouseHoldCashFlow = false;
    isGotPersonalInsuranceOnjective = false;
    debtOnTrack: number;
    houseHoldCashFlow: HouseHoldCashFlow;
    public houseHold: HouseHoldResponse = new HouseHoldResponse();

    currentScenario: CurrentScenarioModel = new CurrentScenarioModel();
    readonly clientViewState: ClientViewState = new ClientViewState();

    // crm clients
    crmClients: Client[];
    recentClients: Pair[];

    // client calculation
    private clientCalculation: ClientCalculation = new ClientCalculation();
    // house hold data
    private clientCalculationSubject: ReplaySubject<ClientCalculation> = new ReplaySubject<ClientCalculation>(1);
    // tslint:disable-next-line:member-ordering
    readonly clientCalculationEvent: Observable<ClientCalculation> = this.clientCalculationSubject.asObservable();

    private houseHoldCashFlowSubject: ReplaySubject<HouseHoldCashFlow> = new ReplaySubject<HouseHoldCashFlow>(1);

    private clients: Client[];
    private selectedClientId: string;
    private loaderReplay: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
    // tslint:disable-next-line:member-ordering
    readonly loaderEvent: Observable<boolean> = this.loaderReplay.asObservable();

    // house hold data
    private houseHoldSubject: ReplaySubject<HouseHoldResponse> = new ReplaySubject<HouseHoldResponse>(1);
    // tslint:disable-next-line:member-ordering
    houseHoldObservable: Observable<HouseHoldResponse> = this.houseHoldSubject.asObservable();
    public familyMembers: FamilyMembers[] = []; // including these member have role: child or spouse
    private companyPattern: string;

    constructor(private httpClient: HttpClient,
        private fpStorageService: FpStorageService,
        public clientAssetService: ClientAssetService,
        public clientDebtService: ClientDebtService,
        public cashFlowService: CashFlowService,
        private configService: ConfigService,
        private confirmationDialog: ConfirmationDialogService,
        public clientInsuranceService: ClientInsuranceService,
        private loadingService: LoadingSpinnerService,
        private securityService: SecurityService) {
        // selected client id;
        this.selectedClientId = fpStorageService.getClientId();
        this.companyPattern = configService.getCompanyPattern();

        /**
         * setup calculation object
         */
        this.cashFlowService.cashFlowEvent.subscribe(res => {
            this.clientCalculation.setTotalCashFlows(res);
            this.clientCalculationSubject.next(this.clientCalculation);
        });
        this.clientAssetService.totalAssetsEvent.subscribe(res => {
            this.clientCalculation.setTotalAssets(res);
            this.clientCalculationSubject.next(this.clientCalculation);
        });
        this.clientDebtService.totalDebtsEvent.subscribe(res => {
            this.clientCalculation.setTotalDebts(res);
            this.clientCalculationSubject.next(this.clientCalculation);
        });

        this.houseHoldObservable.subscribe(res => {
            this.clientCalculation.setHouseHoldResponse(res);
            this.clientCalculationSubject.next(this.clientCalculation);
        });

        this.houseHoldCashFlowSubject.subscribe(res => {
            this.clientCalculation.setHouseHoldCashFlow(res);
            this.clientCalculationSubject.next(this.clientCalculation);
        });
    }

    clearCache() {
        this.houseHoldSubject.next(null);
        this.houseHoldSubject = new ReplaySubject<HouseHoldResponse>(1);
        this.houseHoldObservable = this.houseHoldSubject.asObservable();
        this.houseHoldObservable.subscribe(res => {
            this.clientCalculation.setHouseHoldResponse(res);
            this.clientCalculationSubject.next(this.clientCalculation);
        });

        this.selectedClientId = this.fpStorageService.getClientId();

        this.clientAssetService.clearAll();
        this.clientDebtService.clearAll();
        this.cashFlowService.clearAll();
        this.clientInsuranceService.clearAll();
    }

    clearCacheHouseHolds() {
        this.houseHoldSubject.next(null);
        this.houseHoldSubject = new ReplaySubject<HouseHoldResponse>(1);
        this.houseHoldObservable = this.houseHoldSubject.asObservable();
        this.houseHoldObservable.subscribe(res => {
            this.clientCalculation.setHouseHoldResponse(res);
            this.clientCalculationSubject.next(this.clientCalculation);
        });
    }

    hideLoading() {
        this.loadingService.hide();
    }

    showLoading() {
        this.loadingService.show();
    }

    /**
     *
     * get client list
     *
     * @param callback a callback
     */
    getClients(callback: (err?: string, list?: Client[]) => void) {
        let apiUrl = `api/${this.companyPattern}clients`;

        // cached data is available
        if (this.clients && (this.clients.length > 0)) {
            callback(null, this.clients);
            return;
        }

        this.httpClient.get<Client[]>(apiUrl).subscribe(list => {
            this.clients = list;
            callback(null, list);
        },
            err => {
                console.log(err);
                callback(err);
            });
    }

    //#region Current Scenario

    getCurrentScenario(houseHoldId: string): Observable<ApiDataResult<CurrentScenarioModel>> {
        if (this.currentScenario !== undefined && this.currentScenario.goals.length > 0) {
            let apiDataResult: ApiDataResult<CurrentScenarioModel> = new ApiDataResult<CurrentScenarioModel>();
            apiDataResult.success = true;
            apiDataResult.data = this.currentScenario;
            return Observable.of(apiDataResult);
        }
        else {
            if (!houseHoldId) return Observable.of(null);

            let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/current`;
            return this.httpClient.get<ApiDataResult<CurrentScenarioModel>>(apiUrl)
                .map((response: ApiDataResult<CurrentScenarioModel>) => {
                    if (response.success) {
                        // save debt on track before filter
                        this.debtOnTrack = response.data.goals.find(goal => goal.type === 2).onTrack;
                        response.data.goals = response.data.goals.filter(goals => goals.type !== 0 && goals.type !== 2 && goals.type !== 3);
                        this.currentScenario = { ...response.data };
                    }
                    return response;
                });
        }
    }

    reloadCurrentScenario(houseHoldId: string): Observable<ApiDataResult<CurrentScenarioModel>> {
        if (!houseHoldId) return Observable.of(null);
        let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/current`;
        return this.httpClient.get<ApiDataResult<CurrentScenarioModel>>(apiUrl)
            .map((response: ApiDataResult<CurrentScenarioModel>) => {
                if (response.success) {
                    // save debt on track before filter
                    this.debtOnTrack = response.data.goals.find(goal => goal.type === 2).onTrack;
                    response.data.goals = response.data.goals.filter(goals => goals.type !== 0 && goals.type !== 2 && goals.type !== 3);
                    this.currentScenario = { ...response.data };
                }
                return response;
            });
    }

    updateRetirementIncomeTarget(incomeTargetObj: any, householdId: string): Observable<ApiDataResult<RetirementProjectionModel>> {
        let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/current/retirementProjections`;
        return this.httpClient.put<ApiDataResult<RetirementProjectionModel>>(apiUrl, incomeTargetObj);
    }

    updateAssetProjections(assetProjection: any, houseHoldId: string): Observable<ApiDataResult<AssetProjection>> {
        let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/current/assetProjections`;
        return this.httpClient.put<ApiDataResult<AssetProjection>>(apiUrl, assetProjection).map(response => {
            if (response.success) {
                this.currentScenario.assetProjections = { ...response.data };
            }
            return response;
        });
    }

    updateDebtProjections(debtProjection: any, houseHoldId: string): Observable<ApiDataResult<ScenarioDebtProjection>> {
        let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/current/debtProjections`;
        return this.httpClient.put<ApiDataResult<ScenarioDebtProjection>>(apiUrl, debtProjection).map(response => {
            if (response.success) {
                this.currentScenario.debtProjections = { ...response.data };
            }
            return response;
        });
    }

    updatePersonalProtectionInsuranceOutcomes(outcome: PersonalProtectionOutcomesModel, houseHoldId): Observable<ApiDataResult<any>> {
        let apiUrl = `api/${this.companyPattern}households/${houseHoldId}/scenarios/current/personalInsuranceOutcomes`;
        return this.httpClient.put<ApiDataResult<any>>(apiUrl, outcome);
    }

    updateDesireYearToPay(houseHoldId: string, desireYear: number) {
        let apiUrl = `api/Households/DebtDesireYearToPay`;
        let body = { id: houseHoldId, DebtReductionGoal: desireYear };
        return this.httpClient.put<any>(apiUrl, body);
    }

    public updateStrategyDuration(duration: number, householdId: string) {
        let apiUrl = `api/${this.companyPattern}households/${householdId}/scenarios/parameters`;
        let body = { "StrategyDuration": duration };
        return this.httpClient.put<any>(apiUrl, body);
    }

    //#endregion


    /**
     * get client list from CRM
     *
     * @param callback
     */
    getCrmClients() {
        let apiUrl = `api/${this.companyPattern}CRMData/Clients`;
        return this.httpClient.get(apiUrl)
            .map((json: any) => {
                let newClients: Client[] = [];
                let clients = json && json.data && json.data.data;
                if (clients) {
                    newClients = clients.map(item => {
                        let client = new Client(item.id, item.value);
                        return client;
                    });
                }
                this.crmClients = newClients;
                return newClients;
            });
    }

    getRecentClients(loginedUserId: string): Observable<Pair[]> {
        let apiUrl = `api/${this.companyPattern}CRMData/RecentClients/${loginedUserId}`;
        return this.httpClient.get<BaseResponse<Pair[]>>(apiUrl).map(res => {
            this.recentClients = res && res.data && res.data.data;
            return this.recentClients;
        });
    }

    addToRecentClients(loginedUserId: string, client: Pair): Observable<Pair[]> {
        let apiUrl = `api/${this.companyPattern}CRMData/RecentClient`;
        let payload = {
            userid: loginedUserId,
            clientid: client.id,
            clientname: client.value
        };

        return this.httpClient.post<any>(apiUrl, payload).map(res => {
            // this.recentClients.push(client);
            return res;
        });
    }

    /**
     * get clients house hold
     *
     * @param contactId contact id as string
     * @param callback
     */
    getClientHouseHolds(id: string = null, reload: boolean = false): Observable<HouseHoldResponse> {
        if (!reload && this.clientViewState.houseHolds) {
            return Observable.of(this.clientViewState.houseHolds);
        }

        let newId = id || this.selectedClientId;
        let apiUrl = `api/Households/${newId}`;

        let headers = new HttpHeaders({
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        });

        // get house hold, orther can subscribe into it's observable
        return this.httpClient.get<HouseHoldResponse>(apiUrl, { headers })
            .map(response => {
                this.houseHoldSubject.next(response);
                this.clientViewState.houseHolds = response;
                return response;
            });
    }

    getHouseHoldCashFlow(houseHoldId: String): Observable<HouseHoldCashFlow> {
        let apiUrl = `api/Households/${houseHoldId}/cashflow`;

        return this.httpClient.get<HouseHoldCashFlow>(apiUrl)
            .map(res => {
                this.houseHoldCashFlowSubject.next(res);
                this.houseHoldCashFlow = res;
                return res;
            });
    }

    updateHouseHoldCashFlow(cashFlow: HouseHoldCashFlow): Observable<any> {
        let apiUrl = `api/Households/cashflow`;

        return this.httpClient.put(apiUrl, cashFlow)
            .map(res => {
                this.houseHoldCashFlowSubject.next(cashFlow);
                this.houseHoldCashFlow = cashFlow;
                return res;
            });
    }

    /**
     *
     * @param newContact
     * @param callback
     */
    getContactInfo(): Observable<any> {
        let companyId = localStorage.getItem('companyId');
        let apiUrl = `api/companies/${companyId}`;
        return this.httpClient.get(apiUrl);
    }

    updateContactInfo(newContact: Contact) {
        let apiUrl = `api/Contacts`;
        return this.httpClient.put(apiUrl, JSON.stringify(newContact));
    }

    getRetirementReport(clientId: string) {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/users/' + clientId + '/retirementreport';
        return this.httpClient.get<RetirementReport>(apiUrl);
    }

    getRetirementReportStatus(reportId: string) {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/retirementreportstatus/' + reportId;
        return this.httpClient.get<RetirementReportStatus>(apiUrl);
    }

    getRetirementReportUrl(reportId: string) {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/retirementreport/' + reportId + '/url';
        return this.httpClient.get<RetirementReportUrl>(apiUrl);
    }

    getInvestfitLoginUrl() {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/investfitAuthentication';
        return this.httpClient.get<InvestfitAuthenticationInit>(apiUrl);
    }

    completeInvestfitLogin(code: string): Observable<ApiResult> {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/investfitAuthentication/' + code;
        return this.httpClient.post<ApiResult>(apiUrl, null);
    }

    getInvestfitAuthenticationStatus() {
        let user = this.securityService.authenticatedUser();
        let apiUrl = 'api/companies/' + user.companyId + '/investfitAuthentication/status';
        return this.httpClient.get<InvestfitAuthenticationStatus>(apiUrl);
    }

    /**
     *
     * @param houseHoldId
     * @param retirementIncome
     */
    updateRetirementIncome(houseHoldId: string, retirementIncome: number) {
        // api/HouseHolds/retirement   ${this.companyPattern}
        let apiUrl = `api/HouseHolds/retirement`;

        let data = { id: houseHoldId, RetirementIncome: retirementIncome };
        return this.httpClient.put(apiUrl, data).map(res => {
            this.clientCalculation.updateRetirementIncome(retirementIncome);
            this.clientCalculationSubject.next(this.clientCalculation);
            return res;
        });
    }

    //#region Api with PUT method
    updateGoalForCurrentSituation(houseHoldId: string, goalType: number, goal: any) {
        let goalTypeString = "";
        if (goalType == 1) { goalTypeString = "spending" }
        else if (goalType == 2) { goalTypeString = "nonspending" }
        else if (goalType == 3) { goalTypeString = "income" }

        let apiUrl = `api/households/${houseHoldId}/Goals/${goalTypeString}`;
        return this.httpClient.put<any>(apiUrl, goal);
    }
    //#endregion Api with PUT method
}
