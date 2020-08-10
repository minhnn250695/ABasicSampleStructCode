import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Observable } from 'rxjs/Observable';

// services
import { ClientListService } from '../client-list.service'

// components
import { BaseEventComponent } from '../../common/components/base-component/base-event.component'

// models
import { Client, Pair, UiEvent, Result } from '../../common/models';
import { ClientFilter, ClientInfo, GetClientRequest } from '../models';
import { Router } from '@angular/router';
import { LoaderService } from '../../common/modules/loader/index';
import { ClientPaging } from '../models/client-paging.model';
import { PagingComponent } from '../../common/components/paging/paging.component';

@Component({
  selector: 'app-client-list-landing',
  templateUrl: './client-access.component.html',
  styleUrls: ['./client-access.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientAccessComponent extends BaseEventComponent implements OnInit {

  @ViewChild("paging") paging: PagingComponent;

  private state: ClientAccessState = new ClientAccessState();

  constructor(private loaderService: LoaderService,
    private clientListService: ClientListService,
    private router: Router,
    changeDetectorRef: ChangeDetectorRef) {
    super(null, changeDetectorRef);
  }

  ngOnInit() {
    super.onBaseInit();
    this.clientListService.hideLoading();
    this.getClientList(1);
  }

  ngOnDestroy() {
    super.onBaseDestroy();
  }

  searchBy(value: string) {
    this.state.toggleOrderBy();
    this.state.searchName = value;
    this.getClientList(1);
  }

  // searchBy(value: string) {
  //   this.state.isAsc = !this.state.isAsc;
  //   this.state.searchName = value;
  //   this.getClients(1, this.state.searchName, this.state.getOrderBy());
  // }

  getClientsForPage(page: number) {
    // this.getClients(page, this.state.searchName, this.state.getOrderBy());
    this.getClientList(page);
  }

  onRecordSelect(client: ClientInfo) {
    client.isSelected = !client.isSelected;
  }

  btnSelectALL() {
    this.state.clients.forEach(client => client.isSelected = !client.isSelected);
  }

  /* =====================================================================================================================
 *  VIEW ACTION
 * ===================================================================================================================== */
  btnRemoveClick() {
    this.proceedEvent(ClientAccessEvent.REMOVE_CLIENTS, this.state.getRemoveFormForSelectedItem());
  }

  actionSelected(result) {
    let type = result && result.type;
    if (!type) return;
    let client: ClientInfo = result && result.client;
    let payload = result && result.payload;
    switch (type) {
      case 'remove': this.proceedEvent(ClientAccessEvent.REMOVE_CLIENTS, this.state.getActionsForm(client)); break;
      case 'reset': this.proceedEvent(ClientAccessEvent.FORCE_CHANGE_PASS, { client, pass: payload }); break;
      case 'msg': this.proceedEvent(ClientAccessEvent.SEND_INVITATION, this.state.getActionsForm(client, payload));
    }
  }

  filterChange(filter: ClientFilter) {
    this.state.filter = filter;
    this.getClientList(0);
  }

  newClient() {
    this.router.navigate(['/client-list/new']);
  }

  /* =====================================================================================================================
  * handle event
  * ===================================================================================================================== */
  logName(): string {
    return "ClientAccessComponent";
  }

  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();
    let payload = event.payload;

    this.loaderService.show();
    switch (event.event) {
      case ClientAccessEvent.GET_CLIENTS:
        this.state.currentPage = payload;
        let request = this.state.getClientRequest();
        return this.clientListService.getClients(request);
      case ClientAccessEvent.REMOVE_CLIENTS: return this.clientListService.deleteClients(payload);
      case ClientAccessEvent.FORCE_CHANGE_PASS:
        let client: ClientInfo = payload && payload.client;
        return this.clientListService.forceChangePassword(client && client.email, payload && payload.pass);
      case ClientAccessEvent.SEND_INVITATION:
        return this.clientListService.sendInvitationEmail(payload);
      default:
        return Observable.empty();
    }
  }

  handleEventResult(result: Result) {
    if (!result) return;
    let event = result.event;
    let data = result.payload;

    this.loaderService.hide();
    switch (event) {
      case ClientAccessEvent.GET_CLIENTS:
        this.state.clients = data && data.clients;
        this.state.currentPage = (data && data.index || 0) + 1;
        this.state.maxPages = data && data.pages || 0;
        this.state.size = 5;
        this.paging.initPages(this.state.maxPages);
        break;
      case ClientAccessEvent.REMOVE_CLIENTS:
        this.getClientList(this.state.currentPage);
        break;
      case ClientAccessEvent.FORCE_CHANGE_PASS:
        break;
      case ClientAccessEvent.SEND_INVITATION:
        this.showSuccessDialog("Success!", "Invitation email was successfully sent.");
        break;
      default:
        break;
    }

    this.detectChange();
  }

  handleError(result: any) {
    this.clientListService.hideLoading();
  }

  /* =====================================================================================================================
  * Private Part
  * ===================================================================================================================== */
  getClients(page: number, name: string, orderBy: string) {
    let form = new ClientList();
    form.index = page - 1;
    form.sortby = name;
    form.orderby = orderBy;

    this.proceedEvent(ClientAccessEvent.GET_CLIENTS, form);
  }

  private getClientList(page: number) {
    this.proceedEvent(ClientAccessEvent.GET_CLIENTS, page);
  }
}

enum ClientAccessEvent {
  GET_CLIENTS,
  REMOVE_CLIENTS,
  FORCE_CHANGE_PASS,
  SEND_INVITATION
}

/** state */
class ClientAccessState {
  clients: ClientInfo[];
  currentPage: number = 1;
  maxPages: number;
  size: number;
  isAsc: boolean = true;
  searchName: string = "Name";
  filter: ClientFilter;
  private request: GetClientRequest = new GetClientRequest();

  getOrderBy(): string {
    return this.isAsc ? "ASC" : "DESC";
  }

  getRemoveFormForSelectedItem() {
    let removeForm = new ClientsForm();
    let clients = this.getAllSelected();
    removeForm.UserIDs = clients && clients.map(client => client.id);
    removeForm.Index = this.getCurrentPageIndex();
    return removeForm;
  }

  getActionsForm(client: ClientInfo, message?: string) {
    if (!client) return null;

    let form = new ClientsForm();
    form.UserIDs = [client.id];
    form.Index = this.currentPage - 1;
    form.MessageContent = message ? message : undefined;
    return form;
  }

  getAllSelected(): ClientInfo[] {
    return this.clients && this.clients.filter(client => client.isSelected == true);
  }

  toggleOrderBy() {
    this.isAsc = !this.isAsc;
  }

  getClientRequest(): GetClientRequest {
    this.request.index = this.getCurrentPageIndex();
    this.request.limit = 10;
    this.request.sortby = this.searchName;
    this.request.orderby = this.getOrderBy();
    this.applyFilterToRequest();
    return this.request;
  }

  applyFilterToRequest() {
    this.request.state = this.filter && this.filter.state;
    this.request.serviceCategory = this.filter && this.filter.serviceCategory;
    this.request.keyWord = this.filter && this.filter.keyword;
    this.request.ageRange = this.filter && this.filter.ageRange;
  }

  clearFilter() {
    this.filter = null;
    this.applyFilterToRequest();
  }

  getCurrentPageIndex() {
    let index = (this.currentPage || 0) - 1;
    return index < 0 ? 0 : index;
  }

  updateCurrentPage(page: number) {
    this.currentPage = page <= 0 ? 1 : page;
  }

}

/** */
class ClientsForm {
  constructor() {
    this.Limit = 10;
    this.Orderby = "ASC";
    this.Sortby = "Name";
  }

  readonly Limit: number;
  readonly Sortby: string;
  readonly Orderby: string;
  Index: number;
  UserIDs: string[];
  MessageContent: string;
}


class ClientList {
  constructor() {
    this.limit = 10;
    this.index = 0;
    this.sortby = "Name";
    this.orderby = "ASC";
  }

  limit: number;
  index: number;
  sortby: string;
  orderby: string;
}