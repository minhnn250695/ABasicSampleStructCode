import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';

declare var $: any;

@Component({
    selector: 'fp-error-dialog',
    templateUrl: './error-dialog.component.html',
    styleUrls: ['./error-dialog.component.css']
})

export class ErrorDialog {
    // @Input("isSmallModal") isSmallModal: boolean = false;
    // @Output("isBtnConfirmClick") isBtnConfirmClick: EventEmitter<boolean> = new EventEmitter();

    private title: string;
    private message: string;
    private subMessage: string;
    private isShowBtn: boolean = false;
    private page: string;

    constructor(private router: Router) { }

    showErrorDialog(title: string, message: string, subMessage?: string, showBtn: boolean = false, goToPage?: string) {
        if (!title && !message) return;

        if (title) this.title = title;

        if (message) this.message = message;

        if (subMessage) this.subMessage = subMessage;

        this.isShowBtn = showBtn;

        if (goToPage) this.page = goToPage;

        $('#error-dialog').modal({
            backdrop: 'static'
        });

        $('#error-dialog').modal("show");
    }

    closeErrorDialog() {
        $('#error-dialog').modal("hide");
    }

    btnConfirmClick() {
        if (this.page) {
            this.closeErrorDialog();
            this.goTo(this.page);
        }
        else {
            // this.isBtnConfirmClick.emit(true);
            this.closeErrorDialog();
        }
    }

    btnCloseClick() {

        this.closeErrorDialog();
        // this.isBtnConfirmClick.emit(false);

        if (this.page) {
            this.goTo(this.page);
        }
    }

    private goTo(page) {
        this.router.navigate([page]);
    }
}