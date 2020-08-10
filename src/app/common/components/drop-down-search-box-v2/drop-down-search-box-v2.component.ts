import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Pair } from '../../models/pair.model';
import { Pairs } from '../../../revenue-import/models/pairs.model';

declare var $: any;

@Component({
  selector: 'drop-down-search-box-v2',
  templateUrl: './drop-down-search-box-v2.component.html',
  styleUrls: ['./drop-down-search-box-v2.component.css']
})
export class DropDownSearchBoxV2Component implements OnInit {
  @Input() placeHolder: string = "";
  @Input() source: Pair[] = [];
  @Output() onSelect: EventEmitter<Pair> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    if (this.source.length > 0)
      this.initAutoComplete(this.source);
  }

  private initAutoComplete(records) {
    if (records == undefined || records.length == 0) return;

    let self = this;
    $("#txtSearch").autocomplete({
      source: function (request, response) {
        var results = $.ui.autocomplete.filter(records, request.term);
        response(results.slice(0, 50));
      },
      select: function (e, ui) {
        self.onSelect.emit(ui.item);
      },
      open: function () {
        $(this).data("uiAutocomplete").menu.element.removeClass("ui-widget");
        $(this).data("uiAutocomplete").menu.element.addClass("searchRow");
      }
    });
    $("#txtSearch").autocomplete("option", "appendTo", ".input-group");
  }

}
