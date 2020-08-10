import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';
import { ConfigService } from '../../../common/services/config-service';
import { Contact } from '../../models';

const COLOURS = [
  "#009E49", "#F472D0", "#00B294", "#002050", "#009E49", "#FFB900", "#27ae60", "#002050", "#68217A", "#EC008C",
  "#00BCF2", "#FFB900", "#EC008C", "#DD5900", "#00BCF2", "#F472D0", "#68217A", "#DD5900", "#27ae60", "#00B294",
];

@Component({
  selector: 'personal-slide-item',
  templateUrl: './slide-item.component.html',
  styleUrls: ['./slide-item.component.css'],
})

export class SlideItemComponent extends BaseComponentComponent implements OnInit {
  @Input() client: Contact;
  @Input() id: string;
  @Output() itemClick: EventEmitter<any> = new EventEmitter();

  constructor(configService: ConfigService, changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    // this.client.firstName
  }

  itemStateChanged(event: any) {
    let isChecked = event.target.checked;
    this.itemClick.emit({ position: this.id, checked: isChecked, client: this.client });
  }


  memberImgUrl() {
    if (this.client && this.client.profileImageUrl) {
      return this.baseApiUrl + this.client.profileImageUrl;
    }
    return '../../../../assets/img/default-profile.png';
  }

  private getClientFullName(): string {
    return `${this.client.firstName} ${this.client.lastName}`;
  }

  private isHasAvatar(): boolean {
    return this.client.profileImageUrl ? true : false;
  }

  private getAvatarColor() {
    let len = COLOURS.length;
    // let randomNum = Math.floor(Math.random() * lenght);
    let randomNum = Math.floor(this.client.fullName.length % len);
    return COLOURS[randomNum];
  }
}
