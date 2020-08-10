import { ChangeDetectorRef } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
// components
import { BaseComponentComponent } from './base-component.component';

// models
import { Result, UiEvent } from '../../models';
import { ConfigService } from '../../services/config-service';

// utils
import { RxUtils } from '../../utils';

export abstract class BaseEventComponent extends BaseComponentComponent {
    rxUtils: RxUtils = new RxUtils();

    private eventObservable: ReplaySubject<UiEvent> = new ReplaySubject(1);
    private UiEvent: UiEvent = new UiEvent();

    constructor(configService?: ConfigService, changeDetectorRef?: ChangeDetectorRef) {
        super(configService, changeDetectorRef);
        this.handleEvent();
    }

    onBaseDestroy() {
        super.onBaseDestroy();
        this.rxUtils.clear();
    }

    abstract transformEventToObservable(event: UiEvent): Observable<any>
    abstract handleEventResult(result: Result)
    abstract handleError(error: any)

    logName(): string {
        return '';
    }

    proceedEvent(key: any, payload: any = null) {
        let uiEvent: UiEvent = new UiEvent(key, payload);
        this.eventObservable.next(uiEvent);
    }

    toResult(key, payload: any = null) {
        return new Result(key, payload);
    }

    private handlerErrorCase(err: any) {
        this.handleError(err);
    }

    private handleEvent() {
        let ob = this.eventObservable
            .flatMap((event) => {
                return this.transformEventToObservable(event).map((result) => {
                    return new Result(event.event, result, event.payload);
                }).catch((err) => {
                    this.handlerErrorCase(err);
                    return Observable.empty<Result>();
                });
            })
            .subscribe((result) => {
                this.handleEventResult(result);
            }, (err) => {
                this.handlerErrorCase(err);
            }, () => {
            });

        this.rxUtils.addSubscription(ob);
    }
}