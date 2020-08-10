import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Pair } from '../../../common/models';
@Component({
  selector: 'auto-complete-input',
  templateUrl: './auto-complete-input.component.html',
  styleUrls: ['./auto-complete-input.component.css']
})
export class AutoCompleteInputComponent implements OnInit {
  @Input("placeHolder") placeHolder: string = "";
  @Input() source: Pair[] = [];
  @Input() selected: string;
  @Input() isValidValue: boolean = true;
  @Output() onSelect: EventEmitter<Pair> = new EventEmitter();
  @Output() onChange: EventEmitter<any> = new EventEmitter();

  private filteredData: Pair[] = [];
  private dataFormCtrl: FormControl;

  constructor() {
    this.dataFormCtrl = new FormControl();
  }

  ngOnInit() {
    this.dataFormCtrl.valueChanges
      .subscribe(value => {
        this.filteredData = this.filterPairData(this.source, value)
      });
  }

  onOptionClick(item) {
    this.onSelect.emit(item);
  }

  clear() {
    this.dataFormCtrl.setValue(null);
  }

  /**   
   * Make sure the drop box is showed at first time
   */
  private inputFocus() {
    this.dataFormCtrl.setValue(this.dataFormCtrl.value);
  }

  private filterPairData(data: Pair[], val: string): Pair[] {
    let res = val ?
      data && data.filter((s: Pair) => {
        if (s.value) return (s.value.toLowerCase().indexOf(val.toLowerCase()) !== -1);
        return false;
      }) : data;
    return res && res.slice(0, 20);
  }
}
