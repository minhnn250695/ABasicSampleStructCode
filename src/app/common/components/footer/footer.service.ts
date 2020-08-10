import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs'

@Injectable()
export class FooterService {
    private needHelpSectionReplay: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
    readonly needHelpSectionEvent: Observable<boolean> = this.needHelpSectionReplay.asObservable();

    constructor() {
        this.showNeedHelpSection();
    }


    hideNeedHelpSection() {
        this.needHelpSectionReplay.next(false);
    }

    showNeedHelpSection() {
        this.needHelpSectionReplay.next(true);
    }
}
