import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

declare var $:any;

@Component({
  selector: 'fp-basic-modal',
  templateUrl: './basic-modal.component.html',
  styleUrls: ['./basic-modal.component.css']
})
export class BasicModalComponent implements OnInit {

  @Input("title") title: string; 
  @Input("body") body: string; 
  @Input("actionString") actionString: string;
  @Input("buttonStyle") buttonStyle: string = "btn-danger";
  @Output("action") actionEvent: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  show() {
    $('#modalId').modal('show');
  }

  private actionClick() {
    $('#modalId').modal('hide');
    this.actionEvent.emit(null);
  }


 }
