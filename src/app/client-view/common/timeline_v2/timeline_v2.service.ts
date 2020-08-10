import { Injectable} from '@angular/core';
import { BehaviorSubject, Observable, Subscription, Subject } from 'rxjs';
import { GoalModalObject } from '../../models';

@Injectable()
export class TimelineV2Service {
    private goalModalHandler$: Subject<GoalModalObject> = new Subject<GoalModalObject>();

    public showGoalModal = (object: GoalModalObject) => {
        return this.goalModalHandler$.next(object);
    }

    public goalModalObserver = (): Observable<GoalModalObject> => {
        return this.goalModalHandler$;
    }
}