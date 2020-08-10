
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LoadingService } from './loading-dialog.service';

declare var $: any;

@Component({
    selector: 'fp-spinner-loading',
    templateUrl: './loading-dialog.component.html',
    styleUrls: ['./loading-dialog.component.css']
})
export class LoadingDialog implements OnInit, OnChanges {

    @Input("runOnLoad") runOnLoad: boolean = true;

    constructor(private loadingService: LoadingService) { }

    ngOnInit() {
        this.loadingService.showLoadingRequest.debounceTime(500).subscribe(response => {
            if (response)
                this.openSpinner();
            else
                this.closeSpinner();
        });

        this.loadingService.closeImidiateRequest.debounceTime(500).subscribe(response => {
            if (response)
                this.closeImmediate();
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!changes.runOnLoad.currentValue)
            this.closeImmediate();
    }

    openSpinner() {
        $("#my-loading-spinner").fadeIn(300);
    }

    // manualOpen(name: string) {
    //     $("#my-loading-spinner").appendTo("#" + name);
    //     $("#my-loading-spinner").show();
    // }

    closeSpinner() {
        $("#my-loading-spinner").fadeOut(500, () => {
            $("#my-loading-spinner").hide();
        });
    }

    closeImmediate() {
        $("#my-loading-spinner").hide();
    }
}
