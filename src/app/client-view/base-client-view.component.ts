import { ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ConfigService } from '../common/services/config-service';
import { FpStorageService } from '../local-storage.service';
// services
import { ClientViewService } from './client-view.service';

// components
import { BaseEventComponent } from '../common/components/base-component/base-event.component';

// models
import { Result, UiEvent } from '../common/models';

export class BaseClientViewComponent extends BaseEventComponent {

    constructor(public clientService: ClientViewService,
                public fpStorageService: FpStorageService,
                        configService?: ConfigService, changeDetectorRef?: ChangeDetectorRef) {
        super(configService, changeDetectorRef);
    }

    onInit() {
        super.onBaseInit();
         // if client id is not valid
        let id = this.fpStorageService.getClientId();
        this.clientService.clientViewState.clientId = id;
    }

    onDestroy() {
        super.onBaseDestroy();
    }

    /* =====================================================================================================================
    * Event handling
    * ===================================================================================================================== */
    transformEventToObservable(event: UiEvent): Observable<any> {
        return Observable.empty();
    }

    handleEventResult(result: Result) {

    }

    handleError(error: any) {

    }

}