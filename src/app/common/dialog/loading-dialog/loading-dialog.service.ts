import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LoadingService {
    showLoadingRequest: BehaviorSubject<boolean> = new BehaviorSubject(false);
    closeImidiateRequest: BehaviorSubject<boolean> = new BehaviorSubject(false);
}
