import { Subscription } from 'rxjs'


export class RxUtils {
    private subscriptions: Subscription[]
    constructor() {
        this.subscriptions = [];
    }


    addSubscription(sub :Subscription) {
        this.subscriptions.push(sub);
    }

    clear() {
        if (this.subscriptions) {
            this.subscriptions.forEach(item => {
                item && item.unsubscribe();
            })
        }

        this.subscriptions = [];
    }

}