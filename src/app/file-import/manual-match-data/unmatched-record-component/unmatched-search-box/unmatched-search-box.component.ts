import { Component, OnInit, OnDestroy, Input, Output, SimpleChanges, OnChanges, EventEmitter } from "@angular/core";
import { Pairs } from '../../../../revenue-import/models';

declare var $: any;
@Component({
    selector: "unmatched-search-box",
    templateUrl: "./unmatched-search-box.component.html"
})


export class UnmatchedSearchBoxComponent implements OnInit, OnDestroy, OnChanges {
    @Input("id") id: string;
    @Input("customCss") customCss: string;
    @Input("placeholder") placeholder: string;
    @Input("dataSource") dataSource: Pairs[] = [];
    @Output("selectedItem") selectedItem: EventEmitter<any> = new EventEmitter();

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.dataSource.currentValue) {            
            if (this.dataSource.length > 0) {
                let newId = "ac" + this.id;
                $('#ac').attr('id', newId);
                this.initAutoComplete(newId, this.dataSource);
            }
        }
    }

    private initAutoComplete(id: string, records: Pairs[]) {
        if (records == undefined || records.length == 0) return;
        let item = $("#" + id);
        item.autocomplete({
            source: (request, response) => {
                var results = $.ui.autocomplete.filter(records, request.term);
                response(results.slice(0, 50));
            },
            select: (e, ui) => {
                this.selectedItem.emit({
                    row: this.id,
                    id: ui.item.id,
                    value: ui.item.label
                });
            }
        });

        item.autocomplete("option", "appendTo", ".input-groups");
    }

}
