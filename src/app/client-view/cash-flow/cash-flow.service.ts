import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { ConfigService } from '../../common/services/config-service';

import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import {
    CashFlow, CashFlowCal
} from '../models';


@Injectable()
export class CashFlowService {

    public isCachedDirty = false;
    // total cash flow
    readonly cashFlowCal: CashFlowCal;
    private cashFlowSubject: ReplaySubject<CashFlowCal> = new ReplaySubject<CashFlowCal>(1);
    // tslint:disable-next-line:member-ordering
    readonly cashFlowEvent = this.cashFlowSubject.asObservable();
    private companyPattern: string;

    constructor(private httpClient: HttpClient,
        private confirmationDialogService: ConfirmationDialogService,
        private router: Router) {
        this.cashFlowCal = new CashFlowCal();
        this.companyPattern = ""; // configService.getCompanyPattern()
    }

    clearAllCached() {
        if (this.cashFlowCal) this.cashFlowCal.clear();
    }

    clearCachedFor(id: string) {
        if (this.cashFlowCal) this.cashFlowCal.remove(id);
    }


    clearAll() {
        if (this.cashFlowCal) this.cashFlowCal.clear();
        this.cashFlowSubject.next(null);
    }

    setCachedDirty(dirty: boolean = true) {
        this.isCachedDirty = dirty;
    }
    /**
     * get cash flow of id list by one api
     * @param ids
     */
    getCashFlowsFor(ids: string[]): Observable<any> {
        if (!ids || ids && ids.length === 0) {
            this.cashFlowSubject.next(this.cashFlowCal);
            return Observable.of(this.cashFlowCal);
        }
        let cached = this.cashFlowCal.get(ids[0]);
        // get data if not cached
        if (typeof (cached) === 'undefined')
            this.setCachedDirty(true);
        else
            this.setCachedDirty(false);
        if (!this.isCachedDirty) {
            this.cashFlowSubject.next(this.cashFlowCal);
            return Observable.of(this.cashFlowCal);
        }
        // get list of observable
        return this.getCashFlowByArrayIds(ids).map(res => {

            if (res && res.success && res.data && res.data.data && res.data.data.length > 0) {
                res.data.data.forEach(item => { this.cashFlowCal.add(item.primaryClientId, item); });
            }
            else {
                this.showErrorModal(res);
            }
            // emit data outside
            this.setCachedDirty(false);
            this.cashFlowSubject.next(this.cashFlowCal);
            return this.cashFlowCal;
        });
    }

    getCashFlowByArrayIds(contactIds: string[]): Observable<any> {
        let apiUrl = `api/users/CashFlow/search`;
        return this.httpClient.post<any>(apiUrl, { IDs: contactIds });
    }

    /**
     * get cash flow of id list with many request
     * @param ids
     */
    getCashFlows(ids: string[]): Observable<CashFlowCal> {
        if (!ids) {
            this.cashFlowSubject.next(this.cashFlowCal);
            return Observable.of(this.cashFlowCal);
        }
        // save ids
        // get list of observable
        let getError = false;
        let observables: Array<Observable<any>> = [];
        ids.forEach(id => {
            if (!getError) {
                let cashed = this.cashFlowCal.get(id);
                // get data if not cached, or the cached is dirty
                if (!cashed || this.isCachedDirty) {
                    let ob = this.getCashFlowById(id).map(res => {
                        if (res.success) {
                            let data = res.data && res.data.data && res.data.data.value;
                            return { id, cash: data };
                        }
                        else if (!getError) {
                            this.showErrorModal(res);
                            getError = true;
                        }
                    });
                    observables.push(ob);
                }
            } else return;
        });

        if (getError) return Observable.of(null);

        if (!observables || observables && observables.length === 0) {
            this.cashFlowSubject.next(this.cashFlowCal);
            return Observable.of(this.cashFlowCal);
        }

        return Observable.zip.apply(null, observables)
            .map(res => {
                if (res) {
                    res.forEach(item => { this.cashFlowCal.add(item.id, item.cash); });
                }
                // emit data outside
                this.cashFlowSubject.next(this.cashFlowCal);
                return this.cashFlowCal;
            });
    }

    getCashFlowById(contactId: string): Observable<any> {
        let apiUrl = `api/users/${contactId}/CashFlow`;
        let headers = new HttpHeaders({
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        });

        return this.httpClient.get<any>(apiUrl, { headers });
    }

    /**
     * @param cashFlowDetail
     * @param callback
     */
    updateCashFlowDetail(contactId: string, cashFlowDetail: CashFlow) {
        let apiUrl = `api/CashFlow`;
        return this.httpClient.put(apiUrl, JSON.stringify(cashFlowDetail))
            .map(res => {
                return res;
            });
    }

    showErrorModal(res: any) {
        let message = res.error && res.error.errorMessage.slice(0, 200);
        let errorCode = res.error && res.error.errorCode;
        let iSub: ISubscription = this.confirmationDialogService.showModal({
            title: "Error #" + errorCode,
            message: "" + message,
            btnOkText: "Close"
        }).subscribe((btnOkText) => {
            iSub.unsubscribe();
            this.router.navigate(['/client-view']);
        });
    }
}
