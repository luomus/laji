import {Component, OnChanges, OnDestroy, Input, Output, ChangeDetectorRef, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'laji-observation-year-chart',
  templateUrl: './observation-year-chart.component.html',
  styleUrls: ['./observation-year-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationYearChartComponent implements OnChanges, OnDestroy {
  @Input() query: any;
  @Input() barChartPlugins = [pluginDataLabels];
  @Input() barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
     enabled: true,
     mode: 'index',
     axis: 'x',
     position: 'nearest'
   },
    scales: {
      xAxes: [{
        gridLines: {
          color: 'rgba(171,171,171,1)',
          lineWidth: 1
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true
        },
        gridLines: {
          color: 'rgba(171,171,171,1)',
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

  newData: any[] = [{data: [], label: this.translate.instant('all')}];
  splitIdx = 0;

  private allSubData: any[];
  private getDataSub: Subscription;
  private allDataNew: any[];
  private barChartLabels: any[];
  private subBarChartLabels: any[];
  private allBarChartsLabel: any[];


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

  private updateData() {
    console.log('hola');
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
      this.barChartLabels = [];
      this.subBarChartLabels = [];
      this.allBarChartsLabel = [];

      this.allDataNew = [{data: [], label: this.translate.instant('all') }];
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
      this.allDataNew[0].data = this.allSubData;

      this.allSubData = this.allSubData.slice(this.splitIdx, this.allSubData.length);
      this.newData[0].data = this.allSubData;
      this.allBarChartsLabel = this.subBarChartLabels;
      this.subBarChartLabels = this.subBarChartLabels.slice(this.splitIdx, this.subBarChartLabels.length);
      this.barChartLabels = this.subBarChartLabels;

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

  toggleShowAllData() {
    if (this.newData[0].data.length < this.allDataNew[0].data.length) {
      this.newData[0].data = this.allDataNew[0].data;
      this.barChartLabels = this.allBarChartsLabel;
    } else {
      this.newData[0].data = this.allDataNew[0].data.slice(this.splitIdx, this.allDataNew[0].data.length);
      this.barChartLabels = this.allBarChartsLabel.slice(this.splitIdx, this.allBarChartsLabel.length);
    }
  }
}
