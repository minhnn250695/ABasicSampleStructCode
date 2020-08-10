
import { Period } from './period.model';
import { KeyPair } from './key-pair.model';
import { DatePipe } from '@angular/common';

export class SortedPeriod {
    private datePipe: DatePipe = new DatePipe('en-US');
    constructor() {

    }


    sortMonthly(periods: Period[]): Map<string, number> {
        if (!periods) { return new Map(); }
        let sortedList = this.sortedPeriodListAsTimeLine(periods);
        let results: Map<string, number> = new Map<string, number>();
        sortedList.forEach(period => {
            let key = this.getKey(period.date);
            let balance = results.get(key);
            balance = balance ? balance + period.balance : period.balance
            results.set(key, balance)
        });
        return results;
    }


    getData(periods: Period[], sortLength: number): KeyPair[] {
        if (!periods || !sortLength) {
            return [];
        }
        let list = this.flatenPeriodMonthly(periods);


        let timeLenght = sortLength ? sortLength : 1;
        let newList: KeyPair[] = [];

        let j = 0;
        //24 because maximum we able to sort asset by Bi-Annually (24 months)
        for (let i = 0; i < 24; i = i + 1) {
            newList.push(list[j])
            j = j + timeLenght;
        }
        return newList;
    }

    getPeriodByLength(periods: KeyPair[], sortLength: number): KeyPair[] {
        if (!periods || !sortLength) {
            return [];
        }
        let timeLenght = sortLength ? sortLength : 1;
        let newList: KeyPair[] = [];

        let j = 0;

        //24 because maximum we able to sort asset by Bi-Annually (24 months)
        for (let i = 0; i < 24; i = i + 1) {
            newList.push(periods[j])
            j = j + timeLenght;
        }
        return newList;
    }

    getPeriodKeysByLength(periodKeys: any, sortLength: number, callback: (allPeriodKeys: any) => void): string[] {
        if (!periodKeys || !sortLength) {
            return [];
        }
        let timeLenght = sortLength ? sortLength : 1;
        let newList: string[] = [];
        let map = new Map();
        let chooseIndex = 0;
        let index = 0;
        let currentKey = periodKeys.next();
        while (currentKey.value != undefined) {
            if (index == chooseIndex) {
                newList.push(currentKey.value);
                chooseIndex = chooseIndex + timeLenght;
            }
            map.set(currentKey.value, undefined);
            index++;
            currentKey = periodKeys.next();
        }
        callback(map.keys())
        return newList;
    }

    flatenPeriodMonthly(periods: Period[], beginDate: string = ""): KeyPair[] {
        if (!periods || periods.length == 0) { return []; }
        let sortedList = this.sortedPeriodListAsTimeLine(periods);
        let currentDate = new Date();
        // let startDate = new Date(sortedList[0].date);
        let startDateShowing = new Date(beginDate);// only show history from this time to the future
        let mapValue: Map<string, number> = this.convertToMap(sortedList);

        let results: KeyPair[] = [];
        let valuaOfPreviousMonth = 0;

        let isStop = false;
        do {
            let key = this.dateToKey(startDateShowing);
            let value = mapValue.get(key);
            value = (value || value == 0) ? value : valuaOfPreviousMonth;
            let data = new KeyPair(); //{key: key, value: value}
            data.key = key;
            data.value = value;
            valuaOfPreviousMonth = value;

            results.push(data);
            // inscrease time
            startDateShowing.setMonth(startDateShowing.getMonth() + 1);
            isStop = (startDateShowing.getFullYear() > currentDate.getFullYear()) ||
                (startDateShowing.getFullYear() == currentDate.getFullYear() && startDateShowing.getMonth() > currentDate.getMonth());
        } while (!isStop);

        return results.reverse();
    }

    private convertToMap(periods: Period[]): Map<string, number> {
        if (!periods) { return new Map(); }

        let results: Map<string, number> = new Map<string, number>();
        periods.forEach(period => {
            let key = this.getKey(period.date);
            // let balance = results.get(key);
            let balance = period.balance
            results.set(key, balance)
        });
        return results;
    }
    /**
     * sord date list as time line
     */
    private sortedPeriodListAsTimeLine(periods: Period[]): Period[] {
        if (!periods) { return []; }

        return periods.sort((a, b) => {
            return (new Date(a.date)).getTime() - (new Date(b.date)).getTime();
        });
    }

    private getKey(date: string) {
        let newDate = new Date(date);
        return this.datePipe.transform(newDate, "MMMM yyyy");
    }

    private dateToKey(date: Date) {
        return this.datePipe.transform(date, "MMMM yyyy");
    }
}