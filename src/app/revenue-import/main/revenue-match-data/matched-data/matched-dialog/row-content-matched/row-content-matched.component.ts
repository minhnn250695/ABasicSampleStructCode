import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Pairs } from '../../../../../models/index';
import { RevenueImportService } from '../../../../../revenue-import.service';

declare var $: any;

@Component({
  selector: 'row-content-matched',
  templateUrl: './row-content-matched.component.html',
  styleUrls: ['./row-content-matched.component.css']
})

export class RowContentMatchedComponent implements OnInit, OnChanges {
  @Input() id: string;
  @Input() holder: string;
  @Input() dataSource: Pairs[];
  @Input() advancedSearch: boolean = false;
  @Output() getResourceByKeyWordEvent: EventEmitter<any> = new EventEmitter();
  @Output("returnEvent") returnEvent: EventEmitter<any> = new EventEmitter();

  notFound: boolean = false;
  key: string;

  constructor(private crmHanlder: RevenueImportService) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    let newId = "ac";
    if (changes.id && changes.id.currentValue) {
      newId = newId.concat(changes.id.currentValue);
      $('#ac').attr('id', newId);
    }
    if (changes.dataSource && changes.dataSource.currentValue) {
      this.initAutoComplete(newId, this.dataSource);
    }
  }

  private initAutoComplete(id: string, records: Pairs[]) {
    if (records === undefined || records.length === 0) return;

    let self = this;
    let item = $("#" + id);
    item.autocomplete({
      source: (request, response) => {
        this.key = request.term;
        let results = $.ui.autocomplete.filter(this.dataSource, this.key);
        if (results && results.length === 0 && this.key !== "") {
          this.notFound = true;
        } else
          this.notFound = false;
        response(results.slice(0, 50));
      },
      select: (e, ui) => {
        let data = {
          type: self.id,
          id: ui.item.id,
          value: ui.item.label
        };

        self.returnEvent.emit(data);
      }
    });

    item.autocomplete("option", "appendTo", ".input-groups");
  }

}
