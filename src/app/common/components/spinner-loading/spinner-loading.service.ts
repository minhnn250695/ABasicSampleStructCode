import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SpinnerLoadingService {
    showLoadingRequest: BehaviorSubject<boolean> = new BehaviorSubject(false);
    closeImmediateRequest: BehaviorSubject<boolean> = new BehaviorSubject(false);
}
