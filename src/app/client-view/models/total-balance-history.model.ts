

import { BalanceHistory } from './balance-history.model';
import { SortedPeriod } from './sorted-period.model';

export class TotalBalancetHistory {
    private assetHistoryMap: Map<string, BalanceHistory[]>;
    private sortedPeriod: SortedPeriod = new SortedPeriod();

    keys: string[] = [];

    constructor(ids: string[]) {
        this.keys = ids ? ids : [];
        this.assetHistoryMap = new Map();
    }


    getHistories(wantedIds?: string[]): BalanceHistory[] {
        let keys = wantedIds ? wantedIds : this.keys;

        if (!keys) {
            return [];
        }

        let results: BalanceHistory[] = [];
        keys.forEach(id => {
            let assetHistories = this.get(id);
            if (assetHistories) {
                results = results.concat(assetHistories)
            }
        });
        return results;
    }
    ///////////////////// SINGLE ID ///////////////////////////////////////////////
    addList(ids: string[], assetHistories: BalanceHistory[]) {
        if (!ids || ids && ids.length == 0) {
            return;
        }

        ids.forEach(id => {
            let list = assetHistories && assetHistories.filter(item => item.primaryClientId == id)
                .map(item => { item.primaryOwnerId = item.primaryClientId; return item; });
            list = list && list.map(item => {
                item.primaryOwnerId = id;
                let beginDate =  item.assetBeginDate ? item.assetBeginDate : item.debtBeginDate;
                item.periodsAsTimeLine = this.sortedPeriod.flatenPeriodMonthly(item.periods, beginDate);
                return item;
            });
            this.assetHistoryMap.set(id, list);
        });

    }
    add(id: string, assetHistories: BalanceHistory[]) {

        let newOne = assetHistories;
        if (newOne) {
            newOne = newOne.map(item => {
                item.primaryOwnerId = id;
                let beginDate =  item.assetBeginDate ? item.assetBeginDate : item.debtBeginDate;
                item.periodsAsTimeLine = this.sortedPeriod.flatenPeriodMonthly(item.periods, beginDate);
                return item;
            })
        }
        this.assetHistoryMap.set(id, newOne);
    }

    remove(id: string) {
        this.assetHistoryMap.delete(id);
    }

    get(id): BalanceHistory[] {
        return this.assetHistoryMap ? this.assetHistoryMap.get(id) : null;
    }

    clear() {
        this.assetHistoryMap.clear()
    }
}