import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BaseComponentComponent } from '../../../common/components/base-component';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';

declare var $: any;
@Component({
  selector: 'custom-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.css']
})

export class PopoverComponent extends BaseComponentComponent implements OnInit {
  @Input() placeHolder: string = "0";
  @Output() saveClick: EventEmitter<any> = new EventEmitter();

  constructor(
    private confirmationDialogService: ConfirmationDialogService
  ) { super(); }

  ngOnInit() {
    super.initPopover();

    $("#popover-save").click(() => {                          // when button save popover clicked
      let targetInput = $(".popover #target-input").val();

      if (this.validateInput(targetInput)) {
        let inputValue = parseFloat(targetInput);
        this.saveClick.emit(inputValue);
      } else {
        let iSub: ISubscription = this.confirmationDialogService.showModal({
          title: "Error format",
          message: "This entry can only contain decimal number.",
          btnOkText: "Ok"
        }).subscribe(() => { iSub.unsubscribe() })
      }
    });
  }

  private validateInput(valueInput) {
    let firstDotSignIndex = valueInput.indexOf(".")
    let lastDotSignIndex = valueInput.lastIndexOf(".");
    // have at least 2 dot sign in input string => wrong decimal input
    if ((firstDotSignIndex || firstDotSignIndex == 0) && (lastDotSignIndex || lastDotSignIndex == 0)
      && (firstDotSignIndex != lastDotSignIndex))
      return false;
    return true;
  }
}
