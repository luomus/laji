import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Chart, ChartDataSets } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'laji-observation-year-chart',
  templateUrl: './observation-year-chart.component.html',
  styleUrls: ['./observation-year-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class ObservationYearChartComponent implements OnChanges, OnDestroy, OnInit {
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
  private barChartOptionsYear: any = {
      animation: {
        duration: 500
      }
  };


  @Output() hasData = new EventEmitter<boolean>();

  constructor(
    private warehouseApi: WarehouseApi,
    private cd: ChangeDetectorRef,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
      Chart.Tooltip.positioners.cursor = function(chartElements, coordinates) {
        return coordinates;
      };
  }

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
      },
      animation: {
        duration: 700
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
            if (i < 1970) {
              this.splitIdx++;
            }
          }
        }


        this.allSubData.push(count);
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
      this.allBarChartsLabel = this.subBarChartLabels;

      this.allSubData = this.allSubData.slice(this.splitIdx, this.allSubData.length);
      this.allSubBackground = this.allSubBackground.slice(this.splitIdx, this.allSubBackground.length);
      this.newData[0].data = this.allSubData;
      this.newData[0].backgroundColor = this.allSubBackground;
      this.subBarChartLabels = this.subBarChartLabels.slice(this.splitIdx, this.subBarChartLabels.length);
      this.barChartLabels = this.subBarChartLabels;

      if (this.splitIdx > 0 && this.allSubData.length === 0) {
        this.newData = this.allDataNew;
        this.barChartLabels = this.allBarChartsLabel;
      }

      this.hasData.emit(this.allDataNew[0].data.length > 0);
      // check emit
      this.cd.markForCheck();
    });
    this.barChartOptionsYear.animation.duration = 0;
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

  toggleShowAllData() {
    this.initializeGraph();
    this.barChartOptionsYear.animation.duration = 0;
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
