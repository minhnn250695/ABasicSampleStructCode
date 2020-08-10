import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BaseComponentComponent } from '../../../common/components/base-component/index';
import { ConfigService } from '../../../common/services/config-service';
import { RefreshService } from '../../../common/services/refresh.service';
import { Contact } from '../../models';

@Component({
  selector: 'personal-slide-item',
  templateUrl: './slide-item.component.html',
  styleUrls: ['./slide-item.component.css']
})
export class SlideItemComponent extends BaseComponentComponent implements OnInit {
  @Input() client: Contact;
  @Input() id: string;
  @Output() itemClick: EventEmitter<any> = new EventEmitter();
  imageUrl: string;
  isChangeRequired: boolean;

  constructor(configService: ConfigService, private refreshService: RefreshService, changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }


  ngOnInit() {
      this.imageUrl = this.memberImgUrl();

      this.refreshService.refresh.subscribe(res => {
        if (res){
            this.isChangeRequired = true;
        }
        if (this.isChangeRequired){
            // this.refreshService.setRefresh(false);
            if (this.refreshService.profileImgOld.toString().includes(this.imageUrl)){
                this.imageUrl = this.refreshService.profileImg;
            }

            this.isChangeRequired = false;
        }
    });
  }

  itemStateChanged(event: any) {
    let isChecked = event.target.checked;
    this.itemClick.emit({ position: this.id, checked: isChecked, client: this.client });
  }


  memberImgUrl() {
    return this.client && this.client.profileImageUrl;
  }

  private getClientFullName(): string {
    return this.client && `${this.client.firstName} ${this.client.lastName}`;
  }
}
