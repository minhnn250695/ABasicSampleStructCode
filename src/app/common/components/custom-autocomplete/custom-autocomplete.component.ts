import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: "custom-autocomplete",
    templateUrl: "./custom-autocomplete.component.html",
    styleUrls: ["./custom-autocomplete.component.css"]
})
export class CustomAutocomplete implements OnInit {
    @Input("source") source: any[] = [];
    autocomplete: any;
    key: string;

    ngOnInit() {
        this.autocomplete = document.getElementById("autocomplete");
    }

    //#region Autocomplete
    onShowAutoComplete() {
        this.autocomplete.style.visibility = "visible";
    }

    onFocusOut() {
        this.autocomplete.style.visibility = "hidden";
    }

    onAutocompleteSelect(item) {
        this.key = item;
        this.autocomplete.style.visibility = "hidden";
    }
    //endregion
}