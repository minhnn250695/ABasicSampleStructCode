import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';

import { BaseComponentComponent } from '../../../common/components/base-component/index';
import { ConfigService } from '../../../common/services/config-service';

const COLOURS = [
  "#009E49", "#F472D0", "#00B294", "#002050", "#009E49", "#FFB900", "#27ae60", "#002050", "#68217A", "#EC008C",
  "#00BCF2", "#FFB900", "#EC008C", "#DD5900", "#00BCF2", "#F472D0", "#68217A", "#DD5900", "#27ae60", "#00B294"
];

@Component({
  selector: 'fp-cirle-img',
  templateUrl: './fp-cirle-img.component.html',
  styleUrls: ['./fp-cirle-img.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FpCirleImgComponent extends BaseComponentComponent implements OnInit, OnDestroy, OnChanges {
  @Input('name') name: string;
  @Input('img') url: string;
  @Input('imgHeight') imgHeight: number = 54;
  @Input('imgWidth') imgWidth: number = 54;
  @Input('border') hasBorder: boolean = false;
  private forceShowAvatar: boolean = true;
  private avatarHeight: string = this.imgHeight + 'px';
  private avatarWidth: string = this.imgWidth + 'px';

  constructor(configService: ConfigService, changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    // super.onBaseInit();
  }

  ngOnDestroy() {
    super.onBaseDestroy();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.change();
  }

  change() {
    this.forceShowAvatar = false;
    this.detectChange();
    setTimeout(() => {
      this.forceShowAvatar = true;
      this.detectChange();
    }, 50);
  }

  private getName() {
    return this.name || '~';
  }

  private imgUrl() {
    return this.getImgUrl(this.url);
  }

  private isShowImg() {
    let trimName = this.name && this.name.trim();
    return (!trimName || trimName.length === 0) || this.isUrlValid();
  }

  private isShowAvatar() {
    return !this.isShowImg() && this.forceShowAvatar;
  }


  private isUrlValid() {
    let newUrl = this.url && this.url.trim();
    return newUrl && newUrl.length > 0;
  }

  private getAvatarColor() {
    let len = COLOURS.length;
    let randomNum = Math.floor(this.userLength() % len);
    return COLOURS[randomNum];
  }

  private userLength() {
    if (!this.name) return 0;
    let length = this.name.length;
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum = sum + this.name.charCodeAt(i);
    }

    return Math.floor(sum * length);
  }

}
