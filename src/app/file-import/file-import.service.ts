import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';
// services
import { ConfigService } from '../common/services/config-service';
// components
import { DataImportFromFile } from "./models/data-imports-from-file.model";
import { DataImportsEntityManualMap, MatchedRecord, UnMatchedRecord, UnmappedFields, InvalidRecord, EntityImportResponse } from './models';
import { ImportEntityTemplate } from './models/entity-template.model';
import { BaseResponse } from '../client-view/models';
import { Pairs } from '../revenue-import/models';

@Injectable()
export class FileImportService {
    //#region Properties
    private companyPattern: string;
    private reloadRequest = new Subject<any>();
    private loadPageRequest = new Subject<any>();
    private errorDialogRequest = new Subject<any>();
    // state data    
    templateFields: string[] = [];
    targetNames: string[] = [];
    entityFields: { displayName: string, targetName: string }[] = [];
    crmResource: Pairs[] = [];
    searchContacts: Pairs[] = [];
    searchAccounts: Pairs[] = [];
    searchClientAssets: Pairs[] = [];
    searchClientDebts: Pairs[] = [];
    searchHouseHolds: Pairs[] = [];
    searchPersonalInsurances: Pairs[] = [];
    searchSystemUsers: Pairs[] = [];

    file: File;
    entityName: string;
    importTemplate: ImportEntityTemplate;
    uploadResponse: DataImportFromFile;
    isLoadingData = false;
    pageSize = 100;
    //#endregion

    //#region Contructors
    constructor(private http: Http,
        private httpClient: HttpClient,
        private configService: ConfigService,
    ) {
        this.companyPattern = configService.getCompanyPattern();
    }
    //#endregion

    //#region Actions API method GET

    // get matched record list
    getMatchedRecords(executionId: string, pageIndex: number, pageSize: number): Observable<EntityImportResponse<MatchedRecord>> {
        let apiUrl = `api/datafeedsentityimportmatchedrecords/${executionId}?pageSize=${pageSize}&pageIndex=${pageIndex}`;
        return this.httpClient.get<EntityImportResponse<MatchedRecord>>(apiUrl);
    }

    // get unmatched record list 
    getUnmatchedRecords(executionId: string, pageIndex: number, pageSize: number): Observable<EntityImportResponse<UnMatchedRecord>> {
        let apiUrl = `api/datafeedsentityimportunmatchedrecords/${executionId}?pageSize=${pageSize}&pageIndex=${pageIndex}`;
        return this.httpClient.get<EntityImportResponse<UnMatchedRecord>>(apiUrl);
    }

    // get new record list
    getnewRecords(executionId: string, pageIndex: number, pageSize: number): Observable<any> {
        let apiUrl = `api/datafeedsentityimportnewrecords/${executionId}?pageSize=${pageSize}&pageIndex=${pageIndex}`;
        return this.httpClient.get(apiUrl);
    }

    // get invalid record list
    getInvalidRecords(executionId: string, pageIndex: number, pageSize: number): Observable<any> {
        let apiUrl = `api/datafeedsentityimportinvalidrecords/${executionId}?pageSize=${pageSize}&pageIndex=${pageIndex}`;
        return this.httpClient.get(apiUrl);
    }

    // get template which contain how many columns need to show
    getImportEntityTemplate(entityName: string): Observable<ImportEntityTemplate> {
        this.targetNames = [];
        this.templateFields = [];
        let apiUrl = `api/datafeedsentityimportentitytemplate/${entityName}`;
        return this.httpClient.get<ImportEntityTemplate>(apiUrl).map(res => {
            res.fields.forEach(field => {
                if (field.targetName != 'client') {
                    this.templateFields.push(field.displayName);
                    this.targetNames.push(field.targetName);
                }
            });
            this.importTemplate = res;
            return res;
        });
    }

    // get client (contact) list from CRM
    getCrmResources() {
        let name: string;
        switch (this.entityName) {
            case "contacts": name = "Clients"; break;
            case "finpal_households": name = "Households"; break;
            case "finpal_clientassets": name = "ClientAssets"; break;
            case "finpal_clientdebts": name = "ClientDebts"; break;
            case "accounts": name = "ProductProviders"; break;
            case "finpal_personalinsurances": name = "InsuranceProviders"; break;
            case "finpal_insurancebenefits": name = "InsuranceBenefits"; break;
        }

        let apiUrl = `api/${this.companyPattern}CRMData/${name}`;
        this.httpClient.get<BaseResponse<Pairs[]>>(apiUrl).subscribe((json: any) => {
            const clients = json && json.data && json.data.data;
            this.crmResource = [...clients];
        });
    }

    /**
     * get entity field list
     */

    getEntityFields(entityName: string): Observable<any> {
        let apiUrl = `api/DataFeedsEntityCRMField/${entityName}`;
        return this.httpClient.get(apiUrl);
    }

    /**
     * 
     * @param entityName : type of entity. Ex: contacts, household, etc.
     * @param value : name of entity
     */
    getCRMInfoByName(entityName: string, value: string): Observable<any> {
        let apiUrl = `api/DataFeedsEntityImportSearchEntities/${entityName}/${value}`;
        return this.httpClient.get<any>(apiUrl).map(response => {
            // map insurance benefit fields from value to friendly name
            // Ex: finpal_benefittype: 100000000 -> finpal_benefittype: Life
            if (entityName == "finpal_insurancebenefits") {
                response.forEach(item => {
                    if (item && item.finpal_benefittype && item.finpal_premiumtype) {
                        item.finpal_benefittype = this.mapInsuranceBenefitType(item.finpal_benefittype.toString());
                        item.finpal_premiumtype = this.mapInsurancePremiumType(item.finpal_premiumtype.toString());
                    }
                })
            }

            if (entityName == "finpal_personalinsurances") {
                response.forEach(item => {
                    if (item && item.finpal_ownershiptype && item.finpal_policystatus) {
                        item.finpal_ownershiptype = this.mapOwnerShipType(item.finpal_ownershiptype.toString());
                        item.finpal_policystatus = this.mapPolicyStatus(item.finpal_policystatus.toString());
                    }
                })
            }

            if (entityName == "finpal_clientassets") {
                response.forEach(item => {
                    if (item && item.finpal_ownershiptype && item.finpal_assetstatus) {
                        item.finpal_ownershiptype = this.mapOwnerShipType(item.finpal_ownershiptype.toString());
                        item.finpal_assetstatus = this.mapAssetDebtStatus(item.finpal_assetstatus.toString());
                    }
                })
            }

            if (entityName == "finpal_clientdebts") {
                response.forEach(item => {
                    if (item && item.finpal_ownertype && item.finpal_debtstatus) {
                        item.finpal_ownertype = this.mapOwnerShipType(item.finpal_ownertype.toString());
                        item.finpal_debtstatus = this.mapAssetDebtStatus(item.finpal_debtstatus.toString());
                    }
                })
            }

            return response;
        });

    }

    /**
     * get status of data import
     */
    getDataFeedsEntityExecution(status: string): Observable<any> {
        let apiUrl = `api/DataFeedsEntityImportExecutions/${status}`;
        return this.httpClient.get<any>(apiUrl);
    }

    /**
     * - Get resource of incorrect relationships in unmatched records
     * - For every types of relationship, map it into { key, value } type.
     * @param relationshipEntity 
     */
    getResourceOfIncorrectRelationships(relationshipEntity: string): Observable<any> {
        let apiUrl = `api/DataFeedsEntityImportSearchEntities/${relationshipEntity}`;
        return this.httpClient.get<any>(apiUrl).map(response => {
            if (response.errorCode) {
                return [];
            } else
                switch (relationshipEntity) {
                    case "contacts":
                        return response.map(i => ({ id: i.contactid, value: `${i.lastname}, ${i.firstname}` }));
                    case "accounts":
                        return response.map(i => ({ id: i.accountid, value: i.name }));
                    case "finpal_clientassets":
                        return response.map(i => ({ id: i.finpal_clientassetid, value: i.finpal_friendlyname }));
                    case "finpal_clientdebts":
                        return response.map(i => ({ id: i.finpal_clientdebtid, value: i.finpal_friendlyname }));
                    case "finpal_households":
                        return response.map(i => ({ id: i.finpal_householdid, value: i.finpal_name }));
                    case "finpal_personalinsurances":
                        return response.map(i => ({ id: i.finpal_personalinsuranceid, value: i.finpal_name }));
                    case "systemusers":
                        return response.map(i => ({ id: i.systemuserid, value: i.fullname }));
                }
        });
    }

    //#endregion API method GET     

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    //#region Actions API method POST  --------------------------- */

    // send file to temp server    
    upLoadFileImportData(file: File, entityName: string): Observable<any> {
        if (!file) return;
        let formData: FormData = new FormData();
        formData.append("file", file, file.name);
        let apiUrl = `api/DataFeedsEntityImportFile/${entityName}`;
        return this.http.post(this.configService.getApiUrl() + apiUrl,
            formData, { headers: this.configService.getHeaders() })
            .map((response: any) => {
                let body = response && JSON.parse(response._body);
                // differ "Required" and "Optional" mapped records for autoMatchColumn.
                let allMapped: UnmappedFields[] = body && body.data && body.data.data && body.data.data.autoMappedColumns;
                let requiredMapped: UnmappedFields[] = body && body.data && body.data.data && body.data.data.autoMappedFields;
                // change isRequired of "allMapped" if duplicated with "requiredMapped".
                if (allMapped && allMapped.length > 0 && requiredMapped && requiredMapped.length > 0) {
                    allMapped.forEach((record: UnmappedFields) => {
                        let index = requiredMapped.findIndex(f => { return f.targetName == record.targetName });
                        if (index != -1) {
                            record.isRequired = true;
                        }
                    });
                }
                if (body && body.data && body.data.data && body.data.data.sourceColumns) {
                    body.data.data.sourceColumns = body.data.data.sourceColumns.map(column => {
                        return column.trim();
                    });
                }
                return body;
            });
    }

    upLoadFileImportXPlanData(file: File, entityName: string): Observable<any> {
        let formData: FormData = new FormData();
        formData.append("file", file, file.name);
        let apiUrl = `/api/xplannewimport/contact`;
        return this.http.post(this.configService.getApiUrl() + apiUrl,
            formData, { headers: this.configService.getHeaders() })
            .map((response: any) => {
                let body = response && JSON.parse(response._body);
                return body;
            });
    }

    // match fields from file with fields in crm
    matcheFieldName(resource: DataImportsEntityManualMap): Observable<any> {
        let apiUrl = 'api/DataFeedsEntityImportManualMap';
        return this.httpClient.post<any>(apiUrl, resource);
    }

    /**
     * import data from file to matched, unmatched list
     * @param executionID 
     */
    startImportDataFeed(executionID: string): Observable<any> {
        let apiUrl = `api/DataFeedsEntityImportStartImportBackground/${executionID}`;
        return this.httpClient.post(apiUrl, {});
    }

    /**set "unmatched record is matched" 
     * 
     * also using for "edit matched record"
     */
    manualMatchRecord(executionId: string, rowKey: string, crmId: string): Observable<any> {
        let apiUrl = `api/datafeedsentityimportmanualmatch`;
        let body = { ExecutionId: executionId, RowKey: rowKey, CrmId: crmId };
        return this.httpClient.post(apiUrl, body);
    }

    /** set unmatched record is new record */
    setRecordAsNewEnties(executionId: string, rowKeys: string[]): Observable<any> {
        if (!rowKeys || rowKeys.length == 0) return Observable.of(null);
        let apiUrl = `api/datafeedsentityimportsetnew`;
        let body = { "ExecutionId": executionId, "RowKeys": rowKeys };
        return this.httpClient.post(apiUrl, body);
    }

    /** import matched record to CRM*/
    updateEntitiesIntoCRM(executionId: string): Observable<any> {
        let apiUrl = `api/datafeedsentityimportupdateentitiesbackground/${executionId}`;
        return this.httpClient.post(apiUrl, {});
    }

    /** import new record to CRM */
    createNewEntitiesInCRM(executionId: string): Observable<any> {
        let apiUrl = `api/datafeedsentityimportcreateentitiesbackground/${executionId}`;
        return this.httpClient.post(apiUrl, {});
    }


    /** move matched record to umatched record */
    unlinkMatchedRecord(executionId: string, rowKey: string, crmId: string): Observable<any> {
        let apiUrl = `api/datafeedsentityimportunmatch`;
        let body = { ExecutionId: executionId, RowKey: rowKey, CrmId: crmId };
        return this.httpClient.post(apiUrl, body);
    }

    /**
     * Update incorrect relationship entity
     */
    updateEntityImportMatchRelationship(matchedRelationship: any): Observable<any> {
        let apiUrl = "api/DataFeedsEntityImportMatchRelationship";
        return this.httpClient.post(apiUrl, matchedRelationship);
    }

    getXPlanMatchFieldNameData(executionID: string): Observable<any> {
        let apiUrl = `api/DataFeedsEntityImportValidateFile`;
        return this.httpClient.post(apiUrl, { executionId: executionID });
    }
    //#endregion API method POST

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    //#region Actions Handle Request

    handleReloadDataRequest() {
        return this.reloadRequest.asObservable();
    }

    handleLoadPageRequest() {
        return this.loadPageRequest.asObservable();
    }

    reloadMatchedRecords() {
        this.reloadRequest.next(1);
    }

    reloadNewRecords() {
        this.reloadRequest.next(2);
    }

    reloadMatchedAndUnmatched() {
        this.reloadRequest.next(3);
    }

    reloadNewAndUnmatched() {
        this.reloadRequest.next(4);
    }

    loadMatchedRecordsPage(pageIndex: number) {
        this.loadPageRequest.next({ matchType: 1, pageIndex: pageIndex });
    }

    loadNewRecordsPage(pageIndex: number) {
        this.loadPageRequest.next({ matchType: 2, pageIndex: pageIndex });
    }

    loadUnmatchedRecordsPage(pageIndex: number) {
        this.loadPageRequest.next({ matchType: 3, pageIndex: pageIndex });
    }

    loadInvalidRecordsPage(pageIndex: number) {
        this.loadPageRequest.next({ matchType: 4, pageIndex: pageIndex });
    }

    handleShowErrorDialog() {
        return this.errorDialogRequest.asObservable();
    }

    showErrorDialog(message: any) {
        this.errorDialogRequest.next(message);
    }

    //#endregion Handle Request

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    //#region Helpers

    getPageIndex(list: any[]): number {
        let pageCount = 0;
        if (list) {
            pageCount = list.length / this.pageSize;
            let pageCountModule = list.length % this.pageSize;
            if (pageCountModule == 0)
                pageCount--;
        }
        return pageCount;
    }

    mapOwnerShipType(value: string): string {
        switch (value) {
            case "100000000":
                return "Individual"
            case "100000001":
                return "Joint"
            case "100000004":
                return "Client Asset"
            case "100000003":
                return "Company"
            case "100000005":
                return "Super Trust"
            case "100000002":
                return "Trust"
            default:
                return value
        }
    }

    mapPolicyStatus(value: string): string {
        switch (value) {
            case "100000000":
                return "Active"
            case "100000001":
                return "Application"
            case "100000002":
                return "Closed"
            case "100000003":
                return "In Force"
            case "100000008":
                return "Lapsed"
            case "509000000":
                return "Overdue"
            case "100000004":
                return "Pending"
            case "100000005":
                return "Rolled Over"
            case "100000007":
                return "Suspended"
            case "100000006":
                return "Transferred"
            case "788150001":
                return "Under Claim"
            case "788150000":
                return "Unknown"
            default:
                return value
        }
    }

    mapInsurancePremiumType(value: string): string {
        switch (value) {
            case "100000001":
                return "Hybrid"
            case "100000002":
                return "Level 65"
            case "100000003":
                return "Level 70"
            case "100000000":
                return "Stepped"
            case "788150000":
                return "Unitised"
            default:
                return value
        }
    }

    mapInsuranceBenefitType(value: string): string {
        switch (value) {
            case "100000000":
                return "Life"
            case "100000001":
                return "TPD"
            case "100000002":
                return "Trauma"
            case "100000003":
                return "Income Protection"
            case "100000005":
                return "Child Trauma"
            case "100000004":
                return "Business Expenses"
            default:
                return value
        }
    }

    mapAssetDebtStatus(value: string): string {
        switch (value) {
            case "100000000":
                return "Active"
            case "100000001":
                return "Application"
            case "100000002":
                return "Closed"
            case "100000003":
                return "In Force"
            case "100000008":
                return "Lapsed"
            case "509000000":
                return "Overdue"
            case "100000004":
                return "Pending"
            case "100000005":
                return "Rolled Over"
            case "100000007":
                return "Suspended"
            case "100000006":
                return "Transferred"
            case "788150001":
                return "Under Claim"
            case "788150000":
                return "Unknown"
            default:
                return value
        }
    }
    //#endregion   
}
