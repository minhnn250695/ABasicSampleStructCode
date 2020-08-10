import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ElementRef
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Chart } from 'chart.js';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

// service
import { ConfigService } from '../../../common/services/config-service';
import { LoaderService } from '../../../common/modules/loader';
import { CashFlowService } from '../../cash-flow/cash-flow.service';
import { ClientViewService } from '../../client-view.service';
import { ClientAssetService } from '../client-asset.service';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';

// Entity
import {
    BalanceHistory, Contact, Period,
    SortedPeriod, TotalBalancetHistory, TotalClientAssets
} from '../models';

// Component
import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';
import { copy } from '@uirouter/angular';
import { ISubscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-asset-history',
    templateUrl: './asset-history.component.html',
    styleUrls: ['./asset-history.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetHistoryComponent extends BaseComponentComponent implements OnInit, OnDestroy {
    @ViewChild('lineChart') lineChart;
    @ViewChild('lineChartAxis') lineChartAxis;
    @ViewChild('chartAreaWrapper', { read: ElementRef }) public chartAreaWrapper;

    private houseHolds: Contact[] = [];
    private keys: string[] = [];
    private totalBalancetHistory: TotalBalancetHistory;
    private previousLenght = 1;
    private totalAssets: TotalClientAssets;

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
    private selectedAssetsFilter: number = 1000;

    constructor(
        changeDetectorRef: ChangeDetectorRef,
        configService: ConfigService,
        private clientService: ClientViewService,
        private clientAssetService: ClientAssetService,
        private cashFlowService: CashFlowService,
        private location: Location,
        private confirmationDialogService: ConfirmationDialogService
    ) {
        super(configService, changeDetectorRef);
    }

    ngOnInit() {

        this.onBaseInit();

        let list: Array<Observable<any>> = [];
        list.push(this.clientAssetService.houseHoldEvent);
        list.push(this.clientService.clientCalculationEvent);

        this.clientService.showLoading();

        this.iSub = Observable.zip.apply(null, list).subscribe((results: any[]) => {
            if (this.iSub) {
                this.iSub.unsubscribe();
            }
            this.houseHolds = results && results[0];
            this.clientAssetService.houseHolds = results && results[0];
            this.clientAssetService.clientCalculation = results && results[1];
            this.getInitialData();
        });
        this.detectChange();
    }

    ngOnDestroy() {
        this.onBaseDestroy();
        if (this.assetHistoryChart)
            this.assetHistoryChart.destroy();
    }

    private getInitialData() {
        this.keys = this.houseHolds ? this.houseHolds.filter(item => item.isDisplayedInUi).map(item => item.id) : [];
        let observables: Array<Observable<any>> = [
            this.clientAssetService.getClientAssetsFor(this.keys),
            this.clientAssetService.getAssetHistoriesFor(this.keys),
        ];
        this.iSub = Observable.zip.apply(null, observables).subscribe((arResponses: any) => {
            if (this.iSub) {
                this.iSub.unsubscribe();
            }
            if (arResponses[0]) {
                this.totalAssets = arResponses[0];
            }
            if (arResponses[1]) {
                this.totalBalancetHistory = arResponses[1];
                this.updateView();
            }
            if (arResponses[2]) {
                this.initTotalAssets();
            }

            this.clientService.hideLoading();

        }, error => {
            this.clientService.hideLoading();
            this.confirmationDialogService.showModal({
                title: "Error",
                message: error.message,
                btnOkText: "OK"
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
        this.clientAssetService.sortTypeEvent.next(this.previousLenght);
        this.updateTotalAssets(this.previousLenght);
    }

    private onChangeAssetFilter() {
        if (this.selectedAssetsFilter) {
            if (this.selectedAssetsFilter == 1000)
                this.updateChart(this.periodKeyFilter, this.periodKeyFilterValue);
            else {
                let history = this.displayedList[this.selectedAssetsFilter];
                this.updateChart(history.label, history.value);
            }
        }
    }

    private updateView() {
        this.displayedHistories = this.totalBalancetHistory.getHistories(this.keys);
        this.initTotalAssets()
        this.detectChange();
    }

    private getValue(key: string) {
        return this.totalAssetHistoryMap ? this.totalAssetHistoryMap.get(key) : 0;
    }

    private updateTotalAssets(sortLenght: number) {
        if (!this.displayedHistories) {
            return;
        }
        // after sorted periodkey => return the original value into call back.
        //=> make sure we got the value for next sorting
        this.periodKeyFilter = this.sortedPeriod.getPeriodKeysByLength(this.clientAssetService.periodKeys, sortLenght, (allPeriodKeys) => {
            this.clientAssetService.periodKeys = allPeriodKeys;
        });

        this.periodKeyFilter = this.periodKeyFilter.reverse();
        this.periodKeyFilterValue = [];
        this.periodKeyFilter.forEach(item => {
            this.periodKeyFilterValue.push(this.getValue(item));
        });

        this.displayedList = this.getDisplayedHistoriesList(sortLenght);

        this.onChangeAssetFilter();
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

    private initTotalAssets() {
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

        this.totalAssetHistoryMap = results;
        this.clientAssetService.periodKeys = this.periodKeyFilter = results.keys();
        this.updateTotalAssets(parseInt(this.selectedPeriodFilter.toString()));
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
