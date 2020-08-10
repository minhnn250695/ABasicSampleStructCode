import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoaderService } from './loader.service';
@Component({
  selector: 'fp-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
})
export class LoaderComponent implements OnInit, OnDestroy {
  private isShow: boolean = false;
  constructor(
    private loaderService: LoaderService) {
    this.loaderService.loaderBehavior.debounceTime(500).subscribe((response: boolean) => {
        this.isShow = response;
    });
  }

  ngOnInit() {
    this.loaderService.loaderEvent.subscribe(isShow => {
      this.isShow = isShow;
    });
  }

  ngOnDestroy() { }
}
