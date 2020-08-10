import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoadingSpinnerService } from './loading-spinner.service';

declare var $: any;

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent implements OnInit, OnDestroy {
  private isShow: boolean = false;
  constructor(
    private loadingService: LoadingSpinnerService) {
    this.loadingService.loaderBehavior.debounceTime(500).subscribe((response: boolean) => {
      if (response)
        this.openSpinner();
      else
        this.closeSpinner();
    });
  }

  ngOnInit() {
    this.loadingService.loaderEvent.subscribe(isShow => {
      if (isShow)
        this.openSpinner();
      else
        this.closeSpinner();
    });
  }

  ngOnDestroy() { }

  openSpinner() {
    $("#loading-spinner").fadeIn(300);
  }

  closeSpinner() {
    $("#loading-spinner").fadeOut(300, () => {
      $("#loading-spinner").hide();
    });
  }

  closeImmediate() {
    $("#loading-spinner").hide();
  }
}


// import { Component, OnInit } from '@angular/core';
// import { LoadingSpinnerService } from './loading-spinner.service';

// declare var $: any;
// @Component({
//   selector: 'app-loading-spinner',
//   templateUrl: './loading-spinner.component.html',
//   styleUrls: ['./loading-spinner.component.css']
// })
// export class LoadingSpinnerComponent implements OnInit {

//   constructor(private loadingService: LoadingSpinnerService) { }

//   ngOnInit() {
//     this.loadingService.showLoadingRequest.subscribe(response => {
//       if (response)
//         this.openSpinner();
//       else
//         this.closeSpinner();
//     });

//     this.loadingService.closeImmediateRequest.subscribe(response => {
//       if (response)
//         this.closeImmediate();
//     });
//   }

//   openSpinner() {
//     $("#my-loading-spinner").fadeIn(300);
//   }

//   closeSpinner() {
//     $("#my-loading-spinner").fadeOut(300, () => {
//       $("#my-loading-spinner").hide();
//     });
//   }

//   closeImmediate() {
//     $("#my-loading-spinner").hide();
//   }
// }
