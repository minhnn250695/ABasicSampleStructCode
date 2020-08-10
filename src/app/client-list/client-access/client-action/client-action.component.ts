import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

// components
import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';

// models
import { ClientInfo } from '../../models';
import { Result } from './Result';

// utils
// import { ValidateUtils } from '../../../common/utils';

declare var $: any;

@Component({
  selector: 'client-action',
  templateUrl: './client-action.component.html',
  styleUrls: ['./client-action.component.css']
})
export class ClientActionComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  @Input() id: string;
  @Input() client: ClientInfo;
  @Output() action: EventEmitter<Result> = new EventEmitter();

  private result: Result;

  constructor() {
    super();
  }

  ngOnInit() {
    super.onBaseInit();
    this.init();
    this.result = new Result(this.client);
  }

  ngOnDestroy() {
    super.onBaseDestroy();
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }

  onBtnSendClick(text: any) {
    console.log(text);
  }
  /**
   * VIEW ACTION
   */
  private resetPassword(pass: string) {
    this.result.type = "reset";
    this.result.payload = pass;
    if (this.isPassValid(pass)) {
      this.action.emit(this.result);
    }
  }

  private sendInviteMsg(msg: string) {
    this.result.type = "msg";
    this.result.payload = msg;
    this.action.emit(this.result);
  }

  private removeClient() {
    this.result.type = "remove";
    this.result.payload = '';
    this.action.emit(this.result);
  }

  /**
   * PRIVATE PART
   */
  // private showPopover(e) {
  //   let popover = e + this.id;
  //   $(popover).popover('toggle');
  // }

  private isPassValid(pass: string): boolean {
    if (!pass) return false;
    let trimPass = pass.trim();
    if (trimPass.length < 6) return false;
    return true;
  }

  private init() {
    $('.close-popover').click(() => {
      this.closePopover();
    });

    $('.remove-popover').click((e) => {
      if (this.isMe(e)) {
        this.removeClient();
      }

      this.closePopover();
    });

    $('.reset-popover').click((e) => {
      if (this.isMe(e)) {
        let pass = $('.popover #txtPassword').val();
        this.resetPassword(pass);
      }

      this.closePopover();
    });

    $('.send-popover').click((e) => {
      if (this.isMe(e)) {
        let msg = $('.popover #txtMessage').val();
        this.sendInviteMsg(msg);
      }

      this.closePopover();
    });
  }

  private closePopover() {
    $('.popover').popover('hide');
  }

  private isMe(e) {
    return this.isMyPopover(e, this.id, "actionPopover");
  }
}

