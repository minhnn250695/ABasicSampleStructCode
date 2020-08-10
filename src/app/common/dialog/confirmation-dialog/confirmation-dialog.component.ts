import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ConfirmationDialogService } from './confirmation-dialog.service';
import { DialogModel } from './DialogModel';

declare var $: any;
@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent implements OnInit {

  private title: string;
  private message: string;
  private btnOkText: string;
  private btnCancelText: string;
  private result: Subject<any> = new Subject<any>();

  constructor(private dialogService: ConfirmationDialogService) {
    this.dialogService.modal$.subscribe((object?: DialogModel) => {
      if (object) { // show modal
        this.title = object.title;
        this.message = object.message;
        this.btnOkText = object.btnOkText;
        this.btnCancelText = object.btnCancelText ? object.btnCancelText : undefined;
        this.open();
      } else {
        this.close();
      }
    });
  }

  ngOnInit() { }

  /**
   * Open modal using `Jquery`
   */
  open() {
    // prevent modal closing from click outside.
    $("#edit-matched-record-warning").modal({
      backdrop: 'static'
    });
  }

  /**
   * Close modal using `Jquery`
   */
  close() {
    $("#edit-matched-record-warning").modal("close");
  }

  private decline() {
    this.dialogService.response.next(false);
  }

  private accept() {
    this.dialogService.response.next(true);
  }

  private dismiss() {
    this.dialogService.response.next(false);
  }
}
