import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from "@angular/core";

import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MatDatepickerInputEvent } from "@angular/material";
import { NgModel } from '../../../../../node_modules/@angular/forms';

export class AppDateAdapter extends NativeDateAdapter {
    parse(value: any): Date | null {
        if ((typeof value === 'string') && (value.indexOf('/') > -1)) {
            const str = value.split('/');
            const year = Number(str[2]);
            const month = Number(str[1]) - 1;
            const date = Number(str[0]);

            if (!this.validateDateInput(date, month + 1, year)) {
                return new Date(undefined, undefined, undefined);
            }
            return new Date(year, month, date);
        }
        const timestamp = typeof value === 'number' ? value : Date.parse(value);
        return isNaN(timestamp) ? null : new Date(timestamp);
    }

    validateDateInput(date: number, month: number, year: number): boolean {
        // month of year from 1-> 12
        if (month < 1 || month > 12)
            return false;
        // validate Feb: leap year and not
        if (this.isleapYear(year) && month == 2 && date > 29) {
            return false;
        } else if (!this.isleapYear(year) && month == 2 && date > 28)
            return false;
        // validate rest of months in year
        if ((month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10
            || month == 12) && date > 31)
            return false;
        else if ((month == 4 || month == 6 || month == 9 || month == 11) && date > 30)
            return false;
        return true;
    }

    isleapYear(year: number): boolean {
        return ((year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0));
    }

    format(date: Date, displayFormat: Object): string {
        if (displayFormat == "input") {
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            return this._to2digit(day) + '/' + this._to2digit(month) + '/' + year;
        } else {
            return date.toDateString();
        }
    }

    private _to2digit(n: number) {
        return ('00' + n).slice(-2);
    }
}

export const APP_DATE_FORMATS = {
    parse: {
        dateInput: { month: 'short', year: 'numeric', day: 'numeric' }
    },
    display: {
        dateInput: 'input',
        monthYearLabel: { month: 'short', year: 'numeric', day: 'numeric' },
        dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
        monthYearA11yLabel: { year: 'numeric', month: 'long' }
    }
};

@Component({
    selector: "app-date-picker",
    templateUrl: "./date-picker.component.html",
    styleUrls: ["./date-picker.component.css"],
    providers: [
        {
            provide: DateAdapter, useClass: AppDateAdapter
        },
        {
            provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
        }
    ]
})

export class DatePickerComponent implements OnInit, OnChanges {
    @ViewChild("date") dateField: NgModel;
    @Input() selectedDate: string;

    private currentDate: Date;
    public isValid: boolean;
    public isShowWarning: boolean;

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {

        // reset datefield when current value is empty
        if (!changes.selectedDate.currentValue) {
            this.dateField.reset();
        }
        if (changes.selectedDate.currentValue || changes.selectedDate.isFirstChange()) {
            this.isValid = true;
        } else {
            this.isValid = false;
        }
    }

    changeDate(updateDate: MatDatepickerInputEvent<Date>) {
        let d = updateDate.value;
        
        if (d) {
            d.setHours(0, -d.getTimezoneOffset(), 0, 0);
            this.selectedDate = d.toISOString();
            this.isValid = true;
        } else
            this.isValid = false;
    }

    resetDate() {

        this.dateField.reset();
        this.selectedDate = undefined;
        this.currentDate = undefined;
        this.isValid = true;
    }

    getSelectingDate(): string {
        return this.selectedDate;
    }
}