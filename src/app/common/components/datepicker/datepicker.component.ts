import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IMyOptions, IMyInputFieldChanged, IMyDate, MyDatePicker } from 'mydatepicker';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.css']
})
export class DatepickerComponent implements OnInit, OnChanges {
  @Input() inputDate: string;
  @Input() disableSinceToday: boolean = false;
  @Input() readOnly: boolean = false;
  private currentYear = new Date().getFullYear();
  private currentMonth = new Date().getMonth();
  private currentDate = new Date().getDate();


  private myDatePickerOptions: IMyOptions = {}

  private date: any = null;

  isValid: boolean;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.inputDate.currentValue)
      this.date = { jsdate: new Date(changes.inputDate.currentValue) };
    else {
      this.clearNgModelDate();
    }
    let optionObj = {
      dateFormat: 'dd/mm/yyyy',
      inline: false,
      showClearDateBtn: false,
      componentDisabled: this.readOnly,
      disableSince: this.disableSinceToday ? { year: this.currentYear, month: this.currentMonth + 1, day: this.currentDate + 1 } : { year: 0, month: 0, day: 0 },
    }
    this.myDatePickerOptions = { ...optionObj };
  }

  getSelectingDate(): string {
    if (this.date) {
      let d = this.date.jsdate.getDate();
      let m = this.date.jsdate.getMonth() + 1;
      let y = this.date.jsdate.getFullYear();
      return y + "-" + this._to2digit(m) + "-" + this._to2digit(d) + "T00:00:00";
    }
    else
      return undefined;
  }

  clearNgModelDate(): void {
    this.date = null;
  }

  onInputFieldChanged(event: IMyInputFieldChanged) {
    this.isValid = event.valid;
  }

  private _to2digit(n: number) {
    return ('00' + n).slice(-2);
  }

}
