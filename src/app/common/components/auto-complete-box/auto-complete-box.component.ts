import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Pair } from '../../../common/models';
@Component({
  selector: 'auto-complete-box',
  templateUrl: './auto-complete-box.component.html',
  styleUrls: ['./auto-complete-box.component.css']
})
export class AutoCompleteBoxComponent implements OnInit {
  @Input("placeHolder") placeHolder: string = "";
  @Input() source: Pair[] = [];
  @Output() onSelect: EventEmitter<Pair> = new EventEmitter();
  @Output() onChange: EventEmitter<any> = new EventEmitter();

  private dataFormCtrl: FormControl;

  constructor() {
    this.dataFormCtrl = new FormControl();
  }

  ngOnInit() {
      this.dataFormCtrl.valueChanges
        .subscribe(value => {
          this.onChange.emit(value);
        });
  }

  onOptionClick(item) {
    this.onSelect.emit(item);
    this.dataFormCtrl.setValue(null);
  }

  private getSource(): Pair[] {
    return this.source || [];
  }
  private inputFocus() {
    // to make sure the drop box is showed at first time
    this.dataFormCtrl.setValue(this.dataFormCtrl.value);
  }
}
