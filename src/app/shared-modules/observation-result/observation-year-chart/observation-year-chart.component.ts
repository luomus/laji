import {Component, OnChanges, OnDestroy, Input, Output, ChangeDetectorRef, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ChartOptions, ChartType, ChartDataSets, Chart } from 'chart.js';
import { Label } from 'ng2-charts';
import { Color } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import {TranslateService} from '@ngx-translate/core';

Chart.Tooltip.positioners.cursor = function(chartElements, coordinates) {
  return coordinates;
};

@Component({
  selector: 'laji-observation-year-chart',
  templateUrl: './observation-year-chart.component.html',
  styleUrls: ['./observation-year-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class ObservationYearChartComponent implements OnChanges, OnDestroy {
  @Input() query: any;
  @Input() colors: string[] =
  ['#bd869e', '#50abcc', '#98DCF1', '#9FABCD', '#BA7A82', '#ADCDED', '#BBE9F7', '#B598B9', '#95B5EA', '#B9607D'];
  newData: ChartDataSets[] = [{data: [], backgroundColor: [],  label: this.translate.instant('all')}];
  splitIdx = 0;

  private allSubData: number[];
  private allSubBackground: string[];
  private getDataSub: Subscription;
  private allDataNew: any[];
  private barChartLabels: number[];
  private subBarChartLabels: number[];
  private allBarChartsLabel: number[];
  private barChartPlugins: any;
  private barChartOptionsYear: any;


  @Output() hasData = new EventEmitter<boolean>();

  constructor(
    private warehouseApi: WarehouseApi,
    private cd: ChangeDetectorRef,
    private translate: TranslateService,
  ) { }

  ngOnChanges() {
    this.updateData();
  }

  ngOnDestroy() {
    if (this.getDataSub) {
      this.getDataSub.unsubscribe();
    }
  }

  initializeGraph() {
      this.barChartPlugins = [pluginDataLabels];
      this.barChartOptionsYear = {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
      enabled: true,
      position: 'cursor'
      },
      scales: {
        xAxes: [{
          gridLines: {
            color: 'rgba(230,230,230,0.5)',
            lineWidth: 0.2
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true
          },
          gridLines: {
            color: 'rgba(171,171,171,0.5)',
            lineWidth: 0.5
          }
        }]
      },
      plugins: {
        datalabels: {
          display: false
        },
      }
    };
  }

  private updateData() {
    if (this.getDataSub) {
      this.getDataSub.unsubscribe();
    }

    this.getDataSub = this.warehouseApi.warehouseQueryAggregateGet(
      this.query,
      ['gathering.conversions.year'],
      ['gathering.conversions.year'],
      10000,
      1,
      undefined,
      true
    ).pipe(
      map(res => res.results)
    ).subscribe(res => {
      this.splitIdx = 0;

      this.allSubData = [];
      this.allSubBackground = [];
      this.barChartLabels = [];
      this.subBarChartLabels = [];
      this.allBarChartsLabel = [];

      this.allDataNew = [{data: [], backgroundColor: [], label: this.translate.instant('all') }];
      let prevYear: number;
      res.map(r => {
        const year = parseInt(r.aggregateBy['gathering.conversions.year'], 10);
        const count = r.count;

        if (prevYear) {
          for (let i = prevYear + 1; i < year; i++) {
            this.subBarChartLabels.push(i);
            this.allSubData.push(0);
            // this.allSubBackground.push(this.getRandomColor);
            if (i < 1970) {
              this.splitIdx++;
            }
          }
        }


        this.allSubData.push(count);
        // this.allSubBackground.push(this.getRandomColor());
        this.subBarChartLabels.push(year);
        if (year < 1970) {
          this.splitIdx++;
        }

        prevYear = year;
      });
      this.initializeGraph();
      this.allSubBackground = this.addColorsBackground(this.colors, this.allSubData.length);
      this.allDataNew[0].data = this.allSubData;
      this.allDataNew[0].backgroundColor = this.allSubBackground;

      this.allSubData = this.allSubData.slice(this.splitIdx, this.allSubData.length);
      this.allSubBackground = this.allSubBackground.slice(this.splitIdx, this.allSubBackground.length);
      this.newData[0].data = this.allSubData;
      this.newData[0].backgroundColor = this.allSubBackground;
      this.allBarChartsLabel = this.subBarChartLabels;
      this.subBarChartLabels = this.subBarChartLabels.slice(this.splitIdx, this.subBarChartLabels.length);
      this.barChartLabels = this.subBarChartLabels;

      // Calculate average value for easy click small values
      this.barChartOptionsYear.scales.yAxes[0].ticks.max = this.maxMinAvg(this.newData[0].data);

      this.hasData.emit(this.allSubData.length > 0);
      // check emit
      this.cd.markForCheck();
    });
  }

  xAxisTickFormatting(value: number) {
    return value + '';
  }

  yAxisTickFormatting(value: number) {
    return value.toLocaleString('fi');
  }

  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  addColorsBackground(arr, total) {
      let i = 0;
      const background = [];

      for (let j = 0 ; j < total; j++) {
        if (i >= arr.length) {
          i = 0;
          background.push(arr[i]);
          i++;
        } else {
          background.push(arr[i]);
          i++;
        }

      }

      return background;
  }

  maxMinAvg(arr) {
    const max = [];
    let sum = arr[0];
    for (let i = 1; i < arr.length; i++) {
        sum = sum + arr[i];
        max[i] = arr[i];
    }

    max.sort((a, b) => b - a);
    if (max[0] > (sum / 100) * 30) {
      return max[1] + 50;
    } else {
      return max[0];
    }

  }

  toggleShowAllData() {
    if (this.newData[0].data.length < this.allDataNew[0].data.length) {
      this.newData[0].data = this.allDataNew[0].data;
      this.newData[0].backgroundColor = this.allDataNew[0].backgroundColor;
      this.barChartLabels = this.allBarChartsLabel;
    } else {
      this.newData[0].data = this.allDataNew[0].data.slice(this.splitIdx, this.allDataNew[0].data.length);
      this.newData[0].backgroundColor = this.allDataNew[0].backgroundColor.slice(this.splitIdx, this.allDataNew[0].data.length);
      this.barChartLabels = this.allBarChartsLabel.slice(this.splitIdx, this.allBarChartsLabel.length);
    }
  }
}
