import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Client, Pair } from '../../../common/models';
import { ClientViewService } from '../../../client-view/client-view.service';
import { FpStorageService } from '../../../local-storage.service';
import { SecurityService } from '../../../security/security.service';

import { RxUtils } from '../../../common/utils/rx-utils';
import { HouseHoldResponse } from '../../../client-view/models';
import { LandingService } from '../../landing.service';
import { OnBoardingService } from '../../../on-boarding/on-boarding.service';
import { BaseComponentComponent } from '../../../common/components/base-component';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ISubscription } from 'rxjs/Subscription';

declare var $: any;
@Component({
  selector: 'card-find-client',
  templateUrl: './find-client.component.html',
  styleUrls: ['./find-client.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FindClientComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  private rxUtils: RxUtils = new RxUtils();
  private allClients: Client[];

  houseHold: HouseHoldResponse;
  recentClients: Pair[];
  clientPairs: Pair[] = [];

  @Output("isLoading") isLoading: EventEmitter<boolean> = new EventEmitter();
  constructor(private router: Router,
    private clientService: ClientViewService,
    private localStorage: FpStorageService,
    private securityService: SecurityService,
    private onboardingService: OnBoardingService,
    private confirmationDialogService: ConfirmationDialogService,
    changeDetectorRef: ChangeDetectorRef,
  ) {
    super(null, changeDetectorRef);
  }

  ngOnInit() {
    this.checkUsingMobile();

    this.allClients = this.clientService.crmClients;
    this.recentClients = this.clientService.recentClients;
    this.updateView();

    let sub = this.clientService.getCrmClients().subscribe((list: Client[]) => {
      this.allClients = list;
      this.updateView();
    });

    this.rxUtils.addSubscription(sub);

    this.loadRecentClients();
  }

  ngOnDestroy() {
    super.onBaseDestroy();
  }

  viewClientInfo(client) {
    this.localStorage.saveClientId(client.id);
    localStorage.setItem("clientName", client.value);
    this.updateRecentClients(client.id);
    // send isLoading to admin-view
    this.isLoading.emit(true);
    this.onboardingService.getHouseHold().subscribe(res => {
      this.isLoading.emit(false);
      if (res && res.id) {
        // check fact-find, if true, go to onboarding, else client-view
        localStorage.setItem("houseHoldID", res.id);
        if (res.factFind) {
          this.goToOnboarding();
        } else {
          this.gotoClientView();
        }
      } else if (!res.success) {
        let confirmationISub: ISubscription = this.confirmationDialogService.showModal({
          title: "Error" + res.error.errorCode,
          message: res.error.errorMessage,
          btnOkText: "Close"
        }).subscribe(() => { confirmationISub.unsubscribe() });
      }
    }, error => {
      this.isLoading.emit(false);
      let confirmationISub: ISubscription = this.confirmationDialogService.showModal({
        title: "Error" + error.error.errorCode,
        message: error.error.errorMessage,
        btnOkText: "Close"
      }).subscribe(() => { confirmationISub.unsubscribe() });
    });
    // update recent clients
  }

  onDropBoxItemClick(pair: Pair) {
    let client: Client = new Client(pair.id, pair.value);
    this.viewClientInfo(client);
  }

  private initAutoComplete(records: any[] = []) {
    $("#search-client").autocomplete({
      source: (request, response) => {
        var results = $.ui.autocomplete.filter(records, request.term);
        response(results.slice(0, 50));
      },
      select: (e, ui) => {
        this.onDropBoxItemClick(ui.item);
      }
    });

    $("#search-client").autocomplete("option", "appendTo", ".search-client-group");
  }

  private updateRecentClients(id: string) {
    let client = this.allClients && this.allClients.find(item => item.id == id);
    let pair = client && (new Pair(client.id, client.name));
    this.addToRecentClientList(pair);
  }

  private updateView() {
    this.clientPairs = this.allClients && this.allClients.map(item => {
      let pair = new Pair();
      pair.id = item.id;
      pair.value = item.name;
      return pair;
    }) || [];
    this.initAutoComplete(this.clientPairs);
    this.detectChange();
  }

  private gotoClientView() {
    this.router.navigate(["/client-view"]);
  }

  private goToOnboarding() {
    if (this.isMobile)
      this.router.navigate(["mobile-on-boarding/"]);
    else
      this.router.navigate(["on-boarding/"]);
  }

  /**
   * DATA
   */
  private loadRecentClients() {
    let userId = this.securityService.authenticatedUser().id;

    let sub = this.clientService.getRecentClients(userId).subscribe(res => {
      this.recentClients = res;

      this.detectChange();
    });

    this.rxUtils.addSubscription(sub);
  }

  private addToRecentClientList(client: Pair) {
    if (!client) return;

    let userId = this.securityService.authenticatedUser().id;
    this.clientService.addToRecentClients(userId, client).subscribe(res => {

    });
  }
}
