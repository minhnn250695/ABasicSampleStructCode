import { Component, Output, Input, EventEmitter } from '@angular/core'

declare var $: any;

@Component({
    selector: 'search-box',
    templateUrl: './search-box.component.html'
})

export class SearchBoxComponent {
    @Input() placeholder: string;
    @Output() searchClick = new EventEmitter();

    input: string;


    enterPressed(e) {
        if (e.which == 13) {
            e.preventDefault();
            this.searchClick.emit(this.input);
        }
    }

    search() {
        this.searchClick.emit(this.input);
    }
}