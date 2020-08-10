import {
  Component, Input, OnDestroy,
  OnInit, SimpleChanges,
} from '@angular/core';

declare var $: any;
@Component({
  selector: 'total-banner',
  templateUrl: './total-banner.component.html',
  styleUrls: ['./total-banner.component.css'],
})
export class TotalBannerComponent implements OnInit, OnDestroy {
  @Input() totalData: any = {};
  @Input() isMobile: boolean = false;

  private firstColNumber: number;
  private secondColNumber: number;
  private thirdColNumber: number;

  private firstColText: string;
  private secondColText: string;
  private thirdColText: string;

  private firstColIcon: string;
  private secondColIcon: string;
  private thirdColIcon: string;
  private debtProjection: any = undefined;
  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.totalData && changes.totalData.currentValue) {
      this.debtProjection = this.totalData.firstCol.debtProjection;

      this.firstColNumber = this.totalData.firstCol.value;
      this.firstColText = this.totalData.firstCol.text;
      this.firstColIcon = this.totalData.firstCol.icon;

      this.secondColNumber = this.totalData.secondCol.value;
      this.secondColText = this.totalData.secondCol.text;
      this.secondColIcon = this.totalData.secondCol.icon;

      this.thirdColNumber = this.totalData.thirdCol.value;
      this.thirdColText = this.totalData.thirdCol.text;
      this.thirdColIcon = this.totalData.thirdCol.icon;
    }
  }

  ngOnDestroy() {
  }
}
