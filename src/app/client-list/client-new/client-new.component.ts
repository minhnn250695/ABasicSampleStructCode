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
import { LoaderService } from '../../common/modules/loader/index';
import { Router } from '@angular/router';
import { PagingComponent } from '../../common/components/paging/paging.component';
declare var $: any;

@Component({
  selector: 'app-client-new',
  templateUrl: './client-new.component.html',
  styleUrls: ['./client-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ClientNewComponent extends BaseEventComponent implements OnInit, OnDestroy {
  @ViewChild("paging") paging: PagingComponent;

  private state: ClientNewState = new ClientNewState();

  constructor(private loaderService: LoaderService,
    private clientListService: ClientListService,
    private router: Router,
    changeDetectorRef: ChangeDetectorRef) {
    super(null, changeDetectorRef);
  }

  ngOnInit() {
    super.onBaseInit()
    this.clientListService.hideLoading();
    // this.getClients(1, this.state.searchName, this.state.getOrderBy());
    this.getClientList(1);
  }

  ngOnDestroy() {
    super.onBaseDestroy()
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }

  searchBy(value: string) {
    this.state.toggleOrderBy();
    this.state.searchName = value;
    this.getClientList(1);
  }

  getClientsForPage(page: number) {
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
  btnAddClick() {
    let addForm = new AddNewClientsForm();
    addForm.UserIDs = this.getAllSelected().map(client => client.id);
    addForm.Index = this.state.currentPage - 1;
    if (addForm.UserIDs.length > 0)
      this.proceedEvent(ClientNewEvent.ADD_NEW_CLIENTS, addForm);
  }

  private filterChange(filter: ClientFilter) {
    this.state.filter = filter;
    this.getClientList(1);
  }

  /* =====================================================================================================================
  * handle event
  * ===================================================================================================================== */
  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();
    let payload = event.payload;

    this.loaderService.show();
    switch (event.event) {
      case ClientNewEvent.GET_NEW_CLIENTS:
        this.state.currentPage = payload;
        let request = this.state.getClientRequest();
        return this.clientListService.getNewClients(request);
      case ClientNewEvent.ADD_NEW_CLIENTS: return this.clientListService.addNewClients(payload);
      default:
        return Observable.empty()
    }
  }

  handleEventResult(result: Result) {
    if (!result) return;
    let event = result.event;
    let data = result.payload;

    this.loaderService.hide();
    switch (result.event) {
      case ClientNewEvent.GET_NEW_CLIENTS:
        this.state.clients = data && data.clients;
        this.state.currentPage = (data && data.index || 0) + 1;
        this.state.maxPages = data && data.pages || 0;
        this.state.size = 5;
        this.paging.initPages(this.state.maxPages);
        break;
      case ClientNewEvent.ADD_NEW_CLIENTS:
        this.showSuccessDialog("Success!", "New client was successfully added.");
        this.getClientsForPage(this.state.currentPage);
    }

    this.detectChange();
  }

  handleError(result: any) { }

  /* =====================================================================================================================
  * Private Part
  * ===================================================================================================================== */

  private getAllSelected(): ClientInfo[] {
    return this.state.clients.filter(client => client.isSelected == true);
  }

  private getClientList(page: number) {
    this.proceedEvent(ClientNewEvent.GET_NEW_CLIENTS, page)
  }
}

enum ClientNewEvent {
  GET_NEW_CLIENTS,
  ADD_NEW_CLIENTS
}

class ClientNewState {
  clients: ClientInfo[];
  currentPage: number = 1;
  maxPages: number;
  size: number;
  isAsc: boolean = true;
  searchName: string = "Name";
  filter: ClientFilter
  private request: GetClientRequest = new GetClientRequest();

  getOrderBy(): string {
    return this.isAsc ? "ASC" : "DESC";
  }

  toggleOrderBy() {
    this.isAsc = !this.isAsc;
  }

  getClientRequest(): GetClientRequest {
    this.request.index = this.getCurrentPageIndex();
    this.request.limit = 10;
    this.request.sortby = this.searchName;
    this.request.orderby = this.getOrderBy();
    this.applyFilterToRequest()
    return this.request;
  }

  applyFilterToRequest() {
    this.request.state = this.filter && this.filter.state;
    this.request.serviceCategory = this.filter && this.filter.serviceCategory;
    this.request.keyWord = this.filter && this.filter.keyword
    this.request.ageRange = this.filter && this.filter.ageRange;
  }

  clearFilter() {
    this.filter = null;
    this.applyFilterToRequest()
  }

  getCurrentPageIndex() {
    let index = this.currentPage - 1;
    return index < 0 ? 0 : index;
  }

  updateCurrentPage(page: number) {
    this.currentPage = page <= 0 ? 1 : page;
  }
}

class AddNewClientsForm {
  constructor() {
    this.Limit = 10;
    this.Orderby = "ASC",
      this.Sortby = "Name"
  }

  readonly Limit: number;
  readonly Sortby: string;
  readonly Orderby: string;
  Index: number;
  UserIDs: string[]
}
