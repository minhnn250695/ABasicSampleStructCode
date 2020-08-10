import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
// services
import { FpStorageService } from '../local-storage.service';
import { ClientViewService } from './client-view.service';


import { LoaderService } from '../common/modules/loader';
import { RxUtils } from '../common/utils/rx-utils';
import { RoleAccess } from './models';
import { AdviceBuilderService } from './advice-builder/advice-builder.service';

declare var $: any;

@Component({
  selector: 'fp-client-view',
  templateUrl: './client-view.component.html',
  styleUrls: ['./client-view.component.css'],
  providers: [ClientViewService]
})
export class ClientViewComponent implements OnInit, OnDestroy {
  userRole: any;
  private rxUtils: RxUtils = new RxUtils();

  constructor(private router: Router,
    private clientViewService: ClientViewService,
    private fpStorageService: FpStorageService,
    private adviceBuilderService: AdviceBuilderService) {
    this.clientViewService.clearCache();
  }

  ngOnInit() {
    // if client id is not valid
    let id = this.fpStorageService.getClientId();
    this.userRole = JSON.parse(localStorage.getItem("authenticatedUser")).roleAccess[0].name;
    if (!id) {
      this.router.navigate(['/landing']);
      return;
    }

    this.clientViewService.clientViewState.clientId = id;

    let sub = this.clientViewService.getClientHouseHolds().subscribe(houseHold => {
      this.adviceBuilderService.houseHold = houseHold;
      localStorage.setItem('houseHoldId', houseHold.id);
      let user = JSON.parse(localStorage.getItem('authenticatedUser'));
      if (user.roleAccess[0].name === RoleAccess.PORTAL_BUSINESS_CLIENT) {
        let loginUser = houseHold.members.find(member => member.id === user.id);
        if (loginUser) {
          let imageUrl = loginUser.profileImageUrl;
          localStorage.setItem('profileImage', imageUrl);
        }
      }
    });

    this.rxUtils.addSubscription(sub);
  }

  ngOnDestroy() {
    if (this.rxUtils) {this.rxUtils.clear();}
    this.clientViewService.clearCache();
  }
}
