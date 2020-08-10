import { Component, OnInit, ViewChild, EventEmitter, Output, OnDestroy } from '@angular/core';
import { HandleFinancialSituationService } from '../../../on-boarding/financial-situation/handle-financial-situation.service';
import { FamilyCashFlowComponent } from '../../../on-boarding/financial-situation/family-cashflow/family-cashflow.component';

@Component({
  selector: 'app-mobile-family-cashflow',
  templateUrl: './mobile-family-cashflow.component.html',
  styleUrls: ['./mobile-family-cashflow.component.css']
})
export class MobileFamilyCashFlowComponent extends FamilyCashFlowComponent implements OnInit, OnDestroy {

  constructor(_financialService: HandleFinancialSituationService) {
    super(_financialService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
