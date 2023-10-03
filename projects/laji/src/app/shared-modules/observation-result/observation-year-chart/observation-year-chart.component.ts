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
import { ChartDataset, ChartOptions, Tooltip } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import {LocalStorageService, LocalStorage} from 'ngx-webstorage';

@Component({
  selector: 'laji-observation-year-chart',
  templateUrl: './observation-year-chart.component.html',
  styleUrls: ['./observation-year-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationYearChartComponent implements OnChanges, OnDestroy, OnInit {
  @Input() query: any;
  @Input() enableOnlyCount = true;
  newData: ChartDataset[] = [{data: [],  label: this.translate.instant('all')}];
  splitIdx = 0;

  allSubData: number[];
  allDataNew: any[];
  barChartLabels: string[];
  barChartOptionsYear: ChartOptions = {
    animation: {
      duration: 500
    }
  };


  private allSubBackground: string[];
  private getDataSub: Subscription;
  private subBarChartLabels: string[];
  private allBarChartsLabel: string[];
  resultList: any[] = [];
  @LocalStorage('onlycount') onlyCount;


  @Output() hasData = new EventEmitter<boolean>();

  constructor(
    private warehouseApi: WarehouseApi,
    private cd: ChangeDetectorRef,
    private translate: TranslateService,
    private localSt: LocalStorageService
  ) { }


  ngOnInit() {
      (Tooltip.positioners as any).cursor = function(chartElements, coordinates) {
        return coordinates;
      };
      this.localSt.observe('onlycount')
            .subscribe((value) => {
              this.onlyCount = value;
              this.onlyCount = this.onlyCount === null ? true : this.onlyCount;
              this.initializeArrays(this.resultList);
              this.cd.markForCheck();
            });
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
    const tooltipPosition = 'cursor' as any; // chart.js typings broken for custom tooltip position so we define it as 'any'.
    this.barChartOptionsYear = {
      backgroundColor:  '#bd869e',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: 'rgba(230,230,230,0.5)',
            lineWidth: 0.2
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback(value: any) { return value % 1 === 0 ? value : ''; }
          },
          grid: {
            color: 'rgba(171,171,171,0.5)',
            lineWidth: 0.5
          }
        }
      },
      plugins: {
        tooltip: {
          enabled: true,
          position: tooltipPosition
        }
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
      this.enableOnlyCount
    ).pipe(
      map(res => res.results)
    ).subscribe(res => {
      this.splitIdx = 0;

      this.allSubData = [];
      this.allSubBackground = [];
      this.barChartLabels = [];
      this.subBarChartLabels = [];
      this.allBarChartsLabel = [];
      this.resultList = [];

      this.allDataNew = [{data: [], label: this.translate.instant('all') }];
      let prevYear: number;

      res.map(r => {
        const year = parseInt(r.aggregateBy['gathering.conversions.year'], 10);
        const count = r.count;
        const individual = r.individualCountSum;

        let nextYear = prevYear ? prevYear + 1 : year;
        while (nextYear < year) {
          this.addYearToResults(nextYear, 0, 0);
          nextYear += 1;
        }
        this.addYearToResults(year, count, individual);

        prevYear = year;
      });

      this.createSubArrayChart();
      this.hasData.emit(this.allDataNew[0].data.length > 0);
      // check emit
      this.cd.markForCheck();
    });
    (this.barChartOptionsYear.animation as any).duration = 0;
  }

  private addYearToResults(year: number, count: number, individual: number) {
    this.allSubData.push(this.onlyCount === null ? count : this.onlyCount ? count : individual);
    this.subBarChartLabels.push('' + year);
    this.resultList.push({count, individualCountSum: individual, year});
    if (year < 1970) {
      this.splitIdx++;
    }
  }

  xAxisTickFormatting(value: number) {
    return value + '';
  }

  yAxisTickFormatting(value: number) {
    return value.toLocaleString('fi');
  }

  toggleShowAllData() {
    this.initializeGraph();
    (this.barChartOptionsYear.animation as any).duration = 0;
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

  initializeArrays(list) {
    this.allSubData = [];
    this.allSubBackground = [];
    this.barChartLabels = [];
    this.subBarChartLabels = [];
    this.allBarChartsLabel = [];
    this.allDataNew = [{data: [],
      // backgroundColor: [],
      label: this.translate.instant('all') }];
    this.fillDataGraph(list);
  }

  fillDataGraph(list) {
    this.splitIdx = 0;
    list.map(r =>  {
      this.allSubData.push(this.onlyCount === null ? r.count : this.onlyCount ? r.count : r.individualCountSum);
      this.subBarChartLabels.push('' + r.year);
      if (r.year < 1970) {
        this.splitIdx++;
      }
    });
    this.createSubArrayChart();
  }

  createSubArrayChart() {
    this.initializeGraph();
    this.allDataNew[0].data = this.allSubData;
    this.allBarChartsLabel = this.subBarChartLabels;

    this.allSubData = this.allSubData.slice(this.splitIdx, this.allSubData.length);
    this.allSubBackground = this.allSubBackground.slice(this.splitIdx, this.allSubBackground.length);
    this.newData[0].data = this.allSubData;
    this.subBarChartLabels = this.subBarChartLabels.slice(this.splitIdx, this.subBarChartLabels.length);
    this.barChartLabels = this.subBarChartLabels;

    if (this.splitIdx > 0 && this.allSubData.length === 0) {
      this.newData = this.allDataNew;
      this.barChartLabels = this.allBarChartsLabel;
    }
  }


  toggleOnlyCount() {
    this.onlyCount = !this.onlyCount;
    this.updateData();
  }
}
