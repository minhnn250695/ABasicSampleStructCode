import { Component, OnInit } from '@angular/core';
import { SpinnerLoadingService } from './spinner-loading.service';

declare var $: any;
@Component({
  selector: 'app-spinner-loading',
  templateUrl: './spinner-loading.component.html',
  styleUrls: ['./spinner-loading.component.css']
})
export class SpinnerLoadingComponent implements OnInit {

  constructor(private loadingService: SpinnerLoadingService) { }

  ngOnInit() {
    this.loadingService.showLoadingRequest.subscribe(response => {
      if (response)
        this.openSpinner();
      else
        this.closeSpinner();
    });

    this.loadingService.closeImmediateRequest.subscribe(response => {
      if (response)
        this.closeImmediate();
    });
  }

  openSpinner() {
    $("#my-loading-spinner").fadeIn(300);
  }

  closeSpinner() {
    $("#my-loading-spinner").fadeOut(300, () => {
      $("#my-loading-spinner").hide();
    });
  }

  closeImmediate() {
    $("#my-loading-spinner").hide();
  }
}
