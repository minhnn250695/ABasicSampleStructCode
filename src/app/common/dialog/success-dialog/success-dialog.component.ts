import { Component } from '@angular/core';

declare var $: any;

@Component({
    selector: 'fp-success-dialog',
    templateUrl: './success-dialog.component.html',
    styleUrls: ['./success-dialog.component.css']
})

export class SuccessDialog {
    private message: string;
    private subMessage: string;

    showSuccessDialog(message: string, subMessage?: string) {

        if (message) this.message = message;

        if (subMessage) this.subMessage = subMessage;

        $('#successModal').modal({
            backdrop: 'static'
        });

        $('#successModal').modal("show");
    }

    closeSuccessDialog() {
        $('#successModal').modal("hide");
    }
}