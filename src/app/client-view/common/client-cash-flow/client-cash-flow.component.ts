import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, SimpleChanges, SimpleChange } from '@angular/core';
// services
import { ConfigService } from '../../../common/services/config-service';
// models
import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';
import { CashFlowDetails } from '../../models/current-scenario/cash-flow-details.model';
import { AdviceBuilderService } from '../../advice-builder/advice-builder.service';

declare var $: any;

@Component({
  selector: 'common-client-cash-flow',
  templateUrl: './client-cash-flow.component.html',
  styleUrls: ['./client-cash-flow.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientCashFlowComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  //#region Properties
  @Input() cashFlow: ScenarioCashFlow = new ScenarioCashFlow();

  //#endregion

  //#region Constructors
  constructor(
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef,
    private adviceBuilderService: AdviceBuilderService) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    super.onBaseInit();
  }

  ngOnChanges(changes: SimpleChanges) {  
  }

  ngOnDestroy() {
    this.onBaseDestroy();
  }
  //#endregion
}

export class ScenarioCashFlow {
  netIncome: number;
  grossIncome: number;
  preTaxDeductions: number;
  taxPaid: number;
  totalExpenses: number;
  lifestyle: number;
  credit: number;
  investment: number;
  insurance: number;
  surplusIncome: number;
  details: CashFlowDetails[];
  onTrack: number;
}
