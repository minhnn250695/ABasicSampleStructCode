// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

// @Injectable()
// export class LoadingSpinnerService {
//     showLoadingRequest: BehaviorSubject<boolean> = new BehaviorSubject(false);
//     closeImmediateRequest: BehaviorSubject<boolean> = new BehaviorSubject(false);
// }


import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class LoadingSpinnerService {
    // THE MAIN SERVICE we are focusing to develop for show loading
    loaderBehavior: BehaviorSubject<boolean> = new BehaviorSubject(false);

    private loaderReplay: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
    // tslint:disable-next-line:member-ordering
    readonly loaderEvent: Observable<boolean> = this.loaderReplay.asObservable();

    constructor() {
        this.hide();
    }

    hide() {
        if (this.loaderReplay) {
            this.loaderReplay.next(false);
        }
    }

    show() {
        if (this.loaderReplay) {
            this.loaderReplay.next(true);
        }
    }

}
