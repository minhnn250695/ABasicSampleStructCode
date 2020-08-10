import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { OptionModel } from '../../../../../../on-boarding/models';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CancelInsurancePolicyActionModel } from '../../../../../models';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
import { ConfirmationDialogService } from '../../../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ISubscription } from 'rxjs/Subscription';
import { ClientViewService } from '../../../../../client-view.service';

declare var $: any;
@Component({
  selector: 'cancel-insurance-modal',
  templateUrl: './cancel-insurance.component.html',
  styleUrls: ['./cancel-insurance.component.css'],
})
export class CancelInsuranceModalComponent implements OnInit {

  @Input() updateCancelPolicy: CancelInsurancePolicyActionModel = new CancelInsurancePolicyActionModel();
  @Input() activeInsuranceNotClosedList: any[] = [];
  @Input() closedInsuranceList: any[] = [];

  private selectOnYearTyping = false;
  private typingYear: number;
  private cancelPolicy: CancelInsurancePolicyActionModel = new CancelInsurancePolicyActionModel();
  private insuranceListToUpdate: any[] = [];
  private insuranceListToClose: any[] = [];
  private iSub: ISubscription;

  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private confirmationDialogService: ConfirmationDialogService,
    private clientService: ClientViewService,
    private router: Router,
  ) { }


  ngOnInit() {
    $('#cancel-insurance').on('hidden.bs.modal', () => {
      this.resetInputValue();
      $('#cancel-insurance-details').click();
    });
    // if create new action we clear old input data
    $('#cancel-insurance').on('shown.bs.modal', () => {
      if (!this.adviceBuilderService.isUpdateAction) {
        this.cancelPolicy = new CancelInsurancePolicyActionModel();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.updateCancelPolicy && changes.updateCancelPolicy.currentValue) {
      this.cancelPolicy = JSON.parse(JSON.stringify(this.updateCancelPolicy));
      // check "year" close asset is current year check or input
      this.selectOnYearTyping = this.isSelectingOnYearTyping();
      if (this.selectOnYearTyping) { this.typingYear = this.updateCancelPolicy.year; }
    }
    if ((changes.activeInsuranceNotClosedList && changes.activeInsuranceNotClosedList.currentValue)
      || (changes.updateCancelPolicy && changes.updateCancelPolicy.currentValue)) {
      this.insuranceListToClose = this.activeInsuranceNotClosedList;
      this.insuranceListToUpdate = this.getInsurancesForUpdate();
    }
  }

  ngOnDestroy() {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");

    if (this.iSub) {
      this.iSub.unsubscribe();
    }
  }

  private onYearClick(type: number) {
    if (type == 1) { // select year currently
      this.selectOnYearTyping = false;
      // reset value of typing year on view
      this.typingYear = undefined;
    } else {
      this.selectOnYearTyping = true;
      this.typingYear = undefined;
    }
  }

  private saveChangesCancelExistingPolicy() {
    let houseHoldId = localStorage.getItem('houseHoldID');
    let selectedStrategyID = localStorage.getItem('selectedStrategyID');
    if (!houseHoldId || !selectedStrategyID) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      let minYear = new Date().getFullYear();
      let maxYear = this.clientService.currentScenario.retirementProjections.lifeExpectencyYear;
      if (this.updateCancelPolicy.year < minYear)
        minYear = this.updateCancelPolicy.year;
      if (this.adviceBuilderService.validateYearField(this.typingYear, minYear, maxYear)) {
        this.adviceBuilderService.showLoading()
        // update value of year if user choose typing for year
        if (this.selectOnYearTyping) { this.cancelPolicy.year = this.typingYear; }
        else { this.cancelPolicy.year = new Date().getFullYear(); }

        let policyNameList = this.defineInsuranceList().filter(insurance => insurance.id == this.cancelPolicy.personalInsuranceId);
        this.cancelPolicy.actionTitle = policyNameList[0] ? policyNameList[0].name : "N/A";
        let observable: Observable<any>[] = [];
        $('#cancel-insurance').modal('hide');

        if (!this.adviceBuilderService.isUpdateAction) {
          observable.push(this.adviceBuilderService.createCancelInsurancePolicy(houseHoldId, selectedStrategyID, this.cancelPolicy));
        } else {
          observable.push(this.adviceBuilderService.updateCancelInsurancePolicy(houseHoldId, selectedStrategyID, this.cancelPolicy));
        }
        this.iSub = Observable.zip.apply(null, observable).subscribe(res => {
          if (this.iSub) {
            this.iSub.unsubscribe();
          }
          this.adviceBuilderService.hideLoading();
          if (res[0].success) {
            //update current strategy actions
            this.adviceBuilderService.reloadAllData();
          } else {
            this.handleErrorMessageService.handleErrorResponse(res[0]);
          }
        })
      }
      else {
        this.adviceBuilderService.showInvalidEndYearMessage(minYear, maxYear);
      }
    }
  }

  private defineInsuranceList() {
    let cancelYear = 0;
    if (!this.adviceBuilderService.isUpdateAction) { // create action
      cancelYear = this.cancelPolicy.year
    } else { cancelYear = this.updateCancelPolicy.year }


    if (!this.adviceBuilderService.isUpdateAction) {
      return (this.activeInsuranceNotClosedList && this.activeInsuranceNotClosedList.length > 0) ? this.activeInsuranceNotClosedList : [];
    } else {
      // case 1 : it's a close insurance in current year or in the past
      if (cancelYear <= new Date().getFullYear()) {
        return (this.closedInsuranceList && this.closedInsuranceList.length > 0) ? this.closedInsuranceList : [];
      } // case 2: close insurance in the future
      else {
        return (this.activeInsuranceNotClosedList && this.activeInsuranceNotClosedList.length > 0) ? this.activeInsuranceNotClosedList : [];
      }
    }
  }

  private viewDetectChange() {
    let viewChange = false;
    if (this.adviceBuilderService.isUpdateAction) {
      if (this.selectOnYearTyping != this.isSelectingOnYearTyping() ||
        (this.selectOnYearTyping == true && this.typingYear != this.updateCancelPolicy.year) ||
        this.cancelPolicy.personalInsuranceId != this.updateCancelPolicy.personalInsuranceId ||
        this.checkUndefinedValue(this.cancelPolicy.details) != this.checkUndefinedValue(this.updateCancelPolicy.details) ||
        this.checkUndefinedValue(this.cancelPolicy.reason) != this.checkUndefinedValue(this.updateCancelPolicy.reason) ||
        this.checkUndefinedValue(this.cancelPolicy.result) != this.checkUndefinedValue(this.updateCancelPolicy.result)) {
        viewChange = true;
      }
    } else {// create a close insurance
      viewChange = true;
    }
    return viewChange;
  }

  private checkUndefinedValue(value) {
    return !value ? "" : value;
  }

  private isSelectingOnYearTyping() {
    if (this.cancelPolicy.year == new Date().getFullYear() && this.adviceBuilderService.isUpdateAction) {
      return false;
    } else if (this.cancelPolicy.year) {
      return true;
    }
    return false;
  }

  private getInsurancesForUpdate() {
    let insurances = [];
    if (this.updateCancelPolicy.personalInsuranceId) {
      let insuranceFound = this.insuranceListToClose.filter((insurance) => { return insurance.id === this.updateCancelPolicy.personalInsuranceId });
      if (insuranceFound && insuranceFound.length > 0) {
        insurances = JSON.parse(JSON.stringify(this.insuranceListToClose));
      }
      else {
        insurances = JSON.parse(JSON.stringify(this.insuranceListToClose));
        this.closedInsuranceList.forEach(item => {
          if (item.id === this.updateCancelPolicy.personalInsuranceId)
            insurances.push(item);
        });
      }
    }
    return insurances;
  }

  private resetInputValue() {
    this.cancelPolicy = new CancelInsurancePolicyActionModel();
    this.selectOnYearTyping = false;
    this.adviceBuilderService.isUpdateAction = false; // mean create new
    this.typingYear = undefined;
  }
}
