import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, EventEmitter, 
Output, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';

// services
import { ClientListService } from '../client-list.service'

// models
import { Client, Pair, UiEvent, Result } from '../../common/models';
import { ClientFilter } from '../models';

// components
import { BaseEventComponent } from '../../common/components/base-component/base-event.component'

@Component({
  selector: 'client-filter',
  templateUrl: './client-filter.component.html',
  styleUrls: ['./client-filter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientFilterComponent extends BaseEventComponent implements OnInit, OnDestroy {
  @Output('filter') filterEvent: EventEmitter<ClientFilter> = new EventEmitter();
  @ViewChild('categoryAuto') categoryAuto: any
  // state
  private viewState: ClientFilterState = new ClientFilterState();

  private filter: ClientFilter = new ClientFilter();
  private keyword: string;
  private state: string;
  private ageRange: string ;

  constructor(private clientListService: ClientListService, changeDetectorRef: ChangeDetectorRef) {
    super(null, changeDetectorRef);
   }

   ngOnInit() {
    super.onBaseInit()
    this.proceedEvent(ClientFilterEvent.GET_DATA);
  }

  ngOnDestroy() {
    super.onBaseDestroy()
  }

  /* =====================================================================================================================
   *  VIEW ACTION
   * ===================================================================================================================== */
  private search() {
    this.filter.keyword = this.keyword;
    this.emitChange();
  }

  private applyAdvanceFilter() {
    this.filter.state = this.state;
    this.filter.ageRange = this.getAgeRange();
    this.emitChange();
  }

  private resetAdvanceFilter() {
    this.filter.state = null;
    this.filter.serviceCategory = null
    this.filter.ageRange = null;
    this.state = null;
    this.ageRange = null;
    // clear views
    this.categoryAuto.clear()

    this.emitChange();
  }

  private onCategorySelect(event) {
    this.filter.serviceCategory = event && event.id;
  }

  /* =====================================================================================================================
   * handle event
   * ===================================================================================================================== */
  logName(): string {
    return "clientFilter";
  }
  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();
    let payload = event.payload;

    switch (event.event) {
      case ClientFilterEvent.GET_DATA: return this.getDataObservable();
      default:
        return Observable.empty()
    }
  }

  handleEventResult(result: Result) {
    if (!result) return;
    let event = result.event
    let data = result.payload;
    
    switch (result.event) {
      case ClientFilterEvent.GET_DATA:
        this.viewState.categories = data && data.categories;
      break;
      default:
        break;
    }

    this.detectChange();
  }

  handleError(result: any) {

  }  

  /* =====================================================================================================================
   * Private Part
   * ===================================================================================================================== */
  private emitChange() {
    this.filterEvent.emit(this.filter);
  }

  private getDataObservable(): Observable<any> {
    return Observable.zip(this.clientListService.getServiceCategory(), (res1) => {
      return {
        categories: res1
      }
    })
  }

  private getAgeRange() {
    if (!this.ageRange) return null;
    if (this.ageRange == "81+") return [81, 200];
    return this.ageRange.split('/');
  }
}

enum ClientFilterEvent {
  GET_DATA
}

class ClientFilterState {
  categories: Pair[];

  getCategories() {
    return this.categories || [];
  }
}