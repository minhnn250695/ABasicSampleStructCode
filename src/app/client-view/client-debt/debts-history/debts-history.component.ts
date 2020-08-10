import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { RxUtils } from '../../../common/utils/rx-utils';
import { Chart } from 'chart.js';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

// service
import { ClientDebtService } from '../client-debt.service';
import { ConfigService } from '../../../common/services/config-service';
import { CashFlowService } from '../../cash-flow/cash-flow.service';
import { ClientViewService } from '../../client-view.service';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';

// Entity
import {
  BalanceHistory, ClientCalculation, ClientDebt, Contact,
  Period, SortedPeriod, TotalBalancetHistory, TotalClientDebts
} from '../models';

// Component
import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';
import { ISubscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-debts-history',
  templateUrl: './debts-history.component.html',
  styleUrls: ['./debts-history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtsHistoryComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  @ViewChild('lineChart') lineChart;
  @ViewChild('lineChartAxis') lineChartAxis;
  @ViewChild('chartAreaWrapper', { read: ElementRef }) public chartAreaWrapper;

  private rxUtils: RxUtils = new RxUtils();

  /**
   * periods
   */
  private totalDebtHistoryMap: Map<string, number>;
  private houseHolds: Contact[] = [];
  private keys: string[] = [];
  private totalBalancetHistory: TotalBalancetHistory;
  private previousLenght = 1;
  private clientCalculation: ClientCalculation;
  private houseHoldId: string;
  private totalDebts: TotalClientDebts;

  /**
   * chart
   */
  private canvas: any;
  private ctx: any;
  private targetCanvas: any;
  private targetCtx: any;
  private assetHistoryChart: any;

  /**
   * periods
   */
  private displayedHistories: BalanceHistory[];
  private displayedList: any;
  private sortedPeriod: SortedPeriod = new SortedPeriod();
  private periodKeyFilter: any;
  private periodKeyFilterValue: any;
  private totalAssetHistoryMap: Map<string, number>;
  private iSub: ISubscription;
  /**
   * Filter
   */
  private selectedPeriodFilter: number = 1;
  private selectedDebtFilter: number = 1000;

  constructor(private clientService: ClientViewService,
    private clientDebtService: ClientDebtService,
    private cashFlowService: CashFlowService,
    private location: Location,
    private confirmationDialogService: ConfirmationDialogService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }


  ngOnInit() {
    this.onBaseInit();
    this.loadData();
  }

  ngOnDestroy() {
    this.onBaseDestroy();
  }

  /**
   * DATA
   */
  private loadData() {
    this.clientService.showLoading();

    let list: Array<Observable<any>> = [];
    list.push(this.clientDebtService.houseHoldsEvent);
    list.push(this.clientService.clientCalculationEvent);
    this.iSub = Observable.zip.apply(null, list).subscribe((results: any[]) => {
      if (this.iSub) {
        this.iSub.unsubscribe();
      }
      this.clientCalculation = results && results[1];
      this.houseHoldId = this.clientCalculation && this.clientCalculation.getHouseHoldId();

      this.houseHolds = results && results[0];
      this.keys = this.houseHolds ? this.houseHolds.filter(item => item.isDisplayedInUi).map(item => item.id) : [];
      let observables: Array<Observable<any>> = [
        this.clientDebtService.getClientDebtsFor(this.keys),
        this.clientDebtService.getDebtHistoriesFor(this.keys),
        // this.cashFlowService.getCashFlows(this.keys)
      ];
      this.iSub = Observable.zip.apply(null, observables).subscribe(arResponses => {
        if (this.iSub) {
          this.iSub.unsubscribe();
        }
        this.clientService.hideLoading();
        if (arResponses[0]) {
          this.totalDebts = arResponses[0];
        }
        if (arResponses[1]) {
          this.totalBalancetHistory = arResponses[1];
          this.updateView();
        }
        if (arResponses[2]) {
          this.initTotalDebts();
        }
      });
    });
  }

  /**
   * VIEW LISTENER
   */

  private backToPreviousPage() {
    this.location.back();
  }

  private onChangePeriodFilter(event) {
    let value = event && event.target && event.target.value;
    this.previousLenght = parseInt(value);
    this.clientDebtService.sortLengthEvent.next(this.previousLenght);
    this.updateTotalDebts(this.previousLenght);
  }

  private onChangeDebtFilter() {
    if (this.selectedDebtFilter) {
      if (this.selectedDebtFilter == 1000)
        this.updateChart(this.periodKeyFilter, this.periodKeyFilterValue);
      else {
        let history = this.displayedList[this.selectedDebtFilter];
        this.updateChart(history.label, history.value);
      }
    }
  }


  private loadClientDebts(keys: string[]) {
    if (this.clientDebtService.isCachedDirty) {
      this.clientService.showLoading();
      let sub = this.clientDebtService.getClientDebtsFor(keys).subscribe(res => {
        this.totalDebts = res;
        this.detectChange();
      }, err => {
        this.clientService.hideLoading();
      });

      this.rxUtils.addSubscription(sub);
    }
    else {// if isCashDirty = false -- totalDebt was been get before.
      this.totalDebts = this.clientDebtService.getTotalDebts();
      this.detectChange();
    }
  }


  private updateView() {
    this.displayedHistories = this.totalBalancetHistory.getHistories(this.keys);
    this.updateTotalDebts(this.previousLenght);
    this.initTotalDebts()
    this.detectChange();
  }

  private getContact(id: string) {
    return this.houseHolds.find(item => item.id === id);
  }


  private updateTotalDebts(sortLenght: number) {
    if (!this.displayedHistories) {
      return;
    }
    // after sorted periodkey => return the original value into call back.
    //=> make sure we got the value for next sorting
    this.periodKeyFilter = this.sortedPeriod.getPeriodKeysByLength(this.clientDebtService.periodKeys, sortLenght, (allPeriodKeys) => {
      this.clientDebtService.periodKeys = allPeriodKeys;
    });

    this.periodKeyFilter = this.periodKeyFilter.reverse();
    this.periodKeyFilterValue = [];
    this.periodKeyFilter.forEach(item => {
      this.periodKeyFilterValue.push(this.getValue(item));
    });

    this.displayedList = this.getDisplayedHistoriesList(sortLenght);

    this.onChangeDebtFilter();
  }

  private getDisplayedHistoriesList(sortLength: number) {
    let histories = [];
    this.displayedHistories.forEach(history => {
      let _each = { label: [], value: [] }
      let item = this.sortedPeriod.getPeriodByLength(history.periodsAsTimeLine, sortLength).filter(data => data && data.key);
      item.reverse();
      item.forEach(period => {
        _each.label.push(period.key);
        _each.value.push(period.value);
      });
      histories.push(_each);
    })
    return histories;
  }

  private initTotalDebts() {
    if (!this.displayedHistories) {
      return;
    }

    let results: Map<string, number> = new Map();
    this.displayedHistories.forEach(item => {
      item.periodsAsTimeLine.forEach(period => {
        if (period && period.key) {
          let value = results.get(period.key);
          let subValue = period.value ? period.value : 0;
          value = value ? value + subValue : subValue;
          results.set(period.key, value);
        }
      });
    });

    this.totalDebtHistoryMap = results;
    this.clientDebtService.periodKeys = this.periodKeyFilter = results.keys();
    this.updateTotalDebts(parseInt(this.selectedPeriodFilter.toString()));
    // this.detectChange();
  }


  private getValue(key: string) {
    return this.totalDebtHistoryMap ? this.totalDebtHistoryMap.get(key) : 0;
  }

  /**
  * CHART
  */

  public scrollRight() {
    this.chartAreaWrapper.nativeElement.scrollLeft += 150;
  }

  public scrollLeft() {
    this.chartAreaWrapper.nativeElement.scrollLeft -= 150;
  }
  private updateChart(labels, datas) {
    const displayedLabels = JSON.parse(JSON.stringify(labels));
    const displayedDatas = JSON.parse(JSON.stringify(datas));

    // destroy chart before create a new chart
    if (this.assetHistoryChart) {
      this.assetHistoryChart.destroy();
    }

    let rectangleSet = false;
    this.canvas = document.getElementById('lineChart');
    if (this.canvas && this.canvas != null) {
      this.ctx = this.canvas.getContext('2d');
      this.ctx.canvas.height = 400;
      this.ctx.canvas.width = labels.length > 12 ? 120 * labels.length : window.innerWidth;
      let gradient = this.ctx.createLinearGradient(0, 0, 0, 450);
      gradient.addColorStop(0, 'rgba(0, 188, 242, 1)');
      gradient.addColorStop(0.5, 'rgba(0, 188, 242, 0.25)');
      gradient.addColorStop(1, 'rgba(0, 188, 242, 0)');
      this.ctx.fillStyle = gradient;
      let data = {
        labels: displayedLabels,
        datasets: [{
          type: 'line',
          label: 'Custom Label Name',
          backgroundColor: gradient,
          borderWidth: 2,
          borderColor: '#fff',
          pointBackgroundColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 4,
          data: displayedDatas
        }]
      };
      this.assetHistoryChart = new Chart(this.ctx, {
        type: 'bar',
        data: data,
        options: {
          responsive: false,
          maintainAspectRatio: false,
          scales: {
            xAxes: [{
              offset: true,
              gridLines: {
                color: 'rgba(56, 72, 120, 1)',
                lineWidth: 1,
                offsetGridLines: true,
              },
              ticks: {
                scaleFontSize: 14,
                fontColor: '#fff',
                autoSkip: false,
                beginAtZero: true,
              }
            }],
            yAxes: [{
              gridLines: {
                color: 'rgba(56, 72, 120, 1)',
                lineWidth: 1,
                offsetGridLines: true,
              },
              ticks: {
                beginAtZero: true,
                scaleFontSize: 14,
                fontColor: '#fff',
                callback: function (value, index, values) {
                  if (parseInt(value) >= 1000) {
                    return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                  } else {
                    return '$' + value;
                  }
                }
              },
            }]
          },
          elements: {
            line: {
              tension: 0
            }
          },
          legend: {
            display: false
          },
          point: {
            backgroundColor: 'white'
          },
          tooltips: {
            enabled: false
          },
          hover: {
            animationDuration: 0
          },
          animation: {
            duration: 1,
            onProcess: function () {
              if (rectangleSet === true) {
                var copyWidth = this.chart.scales['y-axis-0'].width;
                var copyHeight = this.chart.scales['y-axis-0'].height + this.chart.scales['y-axis-0'].top + 10;

                var sourceCtx = this.chart.canvas.getContext('2d');
                sourceCtx.clearRect(0, 0, copyWidth, copyHeight);
              }
            },
            onComplete: function (animation) {
              // Freeze Y Axis
              if (!rectangleSet) {
                let scale = window.devicePixelRatio;
                let sourceCanvas = this.chart.canvas;
                let copyWidth = this.chart.scales['y-axis-0'].width;
                let copyHeight = this.chart.scales['y-axis-0'].height + this.chart.scales['y-axis-0'].top + 10;
                this.targetCanvas = document.getElementById("lineChartAxis");
                if (this.targetCanvas && this.targetCanvas != null) {
                  this.targetCtx = this.targetCanvas.getContext("2d");
                  this.targetCtx.scale(scale, scale);
                  this.targetCtx.canvas.width = copyWidth * scale;
                  this.targetCtx.canvas.height = copyHeight * scale;
                  this.targetCtx.lineJoin = ``;
                  this.targetCtx.lineWidth = 0;

                  this.targetCtx.canvas.style.width = `${copyWidth}px`;
                  this.targetCtx.canvas.style.height = `${copyHeight}px`;
                  this.targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth * scale, copyHeight * scale, 0, 0, copyWidth * scale, copyHeight * scale);

                  let sourceCtx = sourceCanvas.getContext('2d');
                  // Normalize coordinate system to use css pixels.
                  sourceCtx.clearRect(0, 0, 0, 0);

                  rectangleSet = true;
                }
              }

              // Set position for value of point
              let chartInstance = this.chart,
                ctx = chartInstance.ctx;
              ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              let thirdPartOfYAxisValue = 0;

              this.data.datasets.forEach(function (dataset, i) {
                let meta = chartInstance.controller.getDatasetMeta(i);
                meta.data.forEach(function (bar, index) {
                  let value = Math.round(dataset.data[index]);
                  let data = value + '';
                  // convert number to currency format
                  if (parseInt(data) >= 1000) {
                    data = '$' + data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                  } else {
                    data = '$' + data;
                  }
                  // get third part of y axis value 
                  if (thirdPartOfYAxisValue == 0) {
                    let yScale = bar._yScale;
                    let ticksAsNumbers = yScale.ticksAsNumbers;
                    if (ticksAsNumbers.length > 0) {
                      thirdPartOfYAxisValue = ticksAsNumbers[0] / 3;
                    }
                  }
                  if (value > thirdPartOfYAxisValue)
                    ctx.fillText(data, bar._model.x, bar._model.y + 35); //above the point 
                  else
                    ctx.fillText(data, bar._model.x, bar._model.y - 35); //below the point
                });
              });
            },
          },
        }
      });
    }
  }
}
