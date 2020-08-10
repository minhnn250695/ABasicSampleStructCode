import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Pair } from '../../../common/models';

@Component({
  selector: 'drop-down-search-box',
  templateUrl: './drop-down-search-box.component.html',
  styleUrls: ['./drop-down-search-box.component.css']
})
export class DropDownSearchBoxComponent implements OnInit {
  @Input() placeHolder: string = "";
  @Input() source: Pair[] = [];
  @Input() iconSize: string = "fa-sm";
  @Input() iconColor: string = "gray999-color";
  @Output() onSelect: EventEmitter<Pair> = new EventEmitter();


  dataFormCtrl: FormControl;
  filteredData: any;
  private iconClass: string = "";
  constructor() {
    this.dataFormCtrl = new FormControl();
  }

  ngOnInit() {
    this.iconClass = this.iconSize + ' ' + this.iconColor;
    // if (this.source) {
    this.filteredData = this.dataFormCtrl.valueChanges
      .startWith(null)
      .map(name => {
        return this.filterPairData(this.source, name)
      });
    // }
  }

  onOptionClick(item) {
    this.onSelect.emit(item);
    this.dataFormCtrl.setValue(null);
  }

  private inputFocus() {
    // to make sure the drop box is showed at first time
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
