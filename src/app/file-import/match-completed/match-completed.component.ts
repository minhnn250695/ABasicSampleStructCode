import { BaseComponentComponent } from "../../common/components/base-component";
import { Component, OnInit, OnDestroy } from "@angular/core";

@Component({
    selector: "app-match-completed",
    templateUrl: "./match-completed.component.html",
    styleUrls: ["./match-completed.component.css"]
})
export class MatchCompletedComponent extends BaseComponentComponent implements OnInit, OnDestroy {
    constructor() {
        super();
    }

    ngOnInit() {
        
    }

    ngOnDestroy() {
        
    }

}