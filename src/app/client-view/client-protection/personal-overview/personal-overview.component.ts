import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { LoaderModule, LoaderService } from '../../../common/modules/loader';
import { ClientViewService } from '../../client-view.service';
import { PersonalProtectionService } from '../personal-protection.service';

import { BaseEventComponent } from '../../../common/components/base-component/base-event.component';

import { Observable } from 'rxjs/Observable';
import { ConfigService } from '../../../common/services/config-service';
// models
import { PersonalProtectionOutcomesModel, Result, UiEvent } from '../../models';
import { Contact, PersonalInsuranceSummary, TotalPersonalInsuranceSummary } from '../models';
import { PersonalOverviewState } from './personal-overview.state';

@Component({
  selector: 'app-personal-overview',
  templateUrl: './personal-overview.component.html',
  styleUrls: ['./personal-overview.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalOverviewComponent extends BaseEventComponent implements OnInit, OnDestroy {
  insuranceSummaryList: PersonalProtectionOutcomesModel[] = [];
  private state: PersonalOverviewState = new PersonalOverviewState();

  constructor(private clientViewService: ClientViewService,
    private personalService: PersonalProtectionService,
    private loaderService: LoaderService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    this.onBaseInit();
    this.clientViewService.houseHoldObservable.subscribe(res => {
      this.proceedEvent(PersonalOverviewEvent.LOAD_DATA, res);
    });
  }

  ngOnDestroy() {
    this.onBaseDestroy();
  }

  createId(row, column) {
    return row * this.state.COLUMN_NUM + column;
  }

  /* =====================================================================================================================
   *  VIEW ACTION
   * ===================================================================================================================== */

  /* =====================================================================================================================
  *  Event Handling
  * ===================================================================================================================== */
  transformEventToObservable(event: UiEvent): Observable<any> {
    if (!event) return Observable.empty();
    let payload = event.payload;

    this.clientViewService.showLoading();
    switch (event.event) {
      case PersonalOverviewEvent.LOAD_DATA:
        this.state.updateData(payload);
        return this.loadDataObservable();
      default:
        return Observable.empty();
    }
  }

  handleEventResult(result: Result) {
    if (!result) return Observable.empty();
    let payload = result.payload;
    this.clientViewService.hideLoading();
    switch (result.event) {
      case PersonalOverviewEvent.LOAD_DATA:
        this.state.updatePersonalSummary(payload);
        this.state.rows = this.calculateRow(this.state.personalInsurances, this.state.COLUMN_NUM);
        break;
      default:
        return;
    }

    this.detectChange();
  }

  handleError(error: any) {
    this.clientViewService.hideLoading();

  }

  /* =====================================================================================================================
   *  Private part
   * ===================================================================================================================== */
  private loadDataObservable() {

    return Observable.zip(
      this.personalService.getPersonalInsuranceSummariesFor(this.state.getIds()),
      this.clientViewService.clientInsuranceService.getPersonalInsuranceObjectiveFor(this.state.getIds()),
      this.clientViewService.clientInsuranceService.getPersonalInsuranceOutcomesFor(this.state.getIds()),
      this.clientViewService.getCurrentScenario(this.state.houseHoldId),
      (res, res1, res2, res3) => { // map response to object and return
        return { summaries: res, objectivies: res1, outcomes: res2, scenario: res3 };
      },
    );
  }

  private getInsuranceForRow(row: number): PersonalInsuranceSummary[] {
    return this.getForRow(row, this.state.personalInsurances, this.state.COLUMN_NUM);
  }
}

enum PersonalOverviewEvent {
  LOAD_DATA
}