import { Component, Input } from '@angular/core'

declare var $: any;

@Component({
    selector: 'fp-upload-completed-dialog',
    templateUrl: './upload-completed-dialog.component.html',
    styleUrls: ['./upload-completed-dialog.component.css']
})

export class UploadCompletedDialog {

    showUCDialog() {
        $('#upload-file').modal("show");
    }

    closeUCDialog() {
        $('#upload-file').modal("hide");
    }
}