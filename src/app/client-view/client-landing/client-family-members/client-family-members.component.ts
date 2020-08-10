import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ClientViewService } from '../../client-view.service';
import { Contact, HouseHoldResponse } from '../../models';

// bases
import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';
import { ConfigService } from '../../../common/services/config-service';

declare var $: any;

@Component({
  selector: 'fp-client-family-members',
  templateUrl: './client-family-members.component.html',
  styleUrls: ['./client-family-members.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientFamilyMembersComponent extends BaseComponentComponent implements OnInit, OnDestroy {

  @Input("houseHolds") houseHoldSubject: BehaviorSubject<HouseHoldResponse>;
  private houseHoldMembers: Contact[];

  constructor(private clientService: ClientViewService, configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef, private router: Router) {
    super(configService, changeDetectorRef);
  }
  ngOnInit() {
    super.onBaseInit();

    $('#myCarousel').carousel({ interval: 5000 });

    if (this.houseHoldSubject)
      this.houseHoldSubject.subscribe(res => {
        this.houseHoldMembers = res && res.members;
        this.detectChange();
      });
  }

  ngOnDestroy() {
    this.onBaseDestroy();
  }

  thumpsupClick() {
    this.router.navigate(['/client-view/protection/outcome']);
  }
}
