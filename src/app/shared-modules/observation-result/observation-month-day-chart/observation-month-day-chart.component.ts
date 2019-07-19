import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild, OnInit
} from '@angular/core';
import {Subscription, of, Observable, forkJoin} from 'rxjs';
import {WarehouseApi} from '../../../shared/api/WarehouseApi';
import {map, switchMap, tap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {WarehouseValueMappingService} from '../../../shared/service/warehouse-value-mapping.service';
import {TriplestoreLabelService} from '../../../shared/service/triplestore-label.service';
import {ModalDirective} from 'ngx-bootstrap';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'laji-observation-month-day-chart',
  templateUrl: './observation-month-day-chart.component.html',
  styleUrls: ['./observation-month-day-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationMonthDayChartComponent implements OnChanges, OnDestroy {
  @ViewChild('dayChartModal', { static: true }) public modal: ModalDirective;
  @Input() taxonId: string;
  @Input() query: any;

  monthChartData: any[];
  dayChartDataByMonth = {};

  dayChartModalVisible = false;
  activeMonth: number;


  monthFormatting: (number) => string = this.getMonthLabel.bind(this);

  private getDataSub: Subscription;

  @Output() hasData = new EventEmitter<boolean>();

  public barChartOptions: any = {
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
        },
          ticks: {
              callback: this.getMonthLabel.bind(this)
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

  public barChartLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  public barChartType = 'bar';
  public barLegend = true;
  public barChartPlugins = [pluginDataLabels];

  public barChartData: any[];
  public daybarChartData: any[][];

  constructor(
    private warehouseApi: WarehouseApi,
    private warehouseService: WarehouseValueMappingService,
    private triplestoreLabelService: TriplestoreLabelService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges() {
    this.updateData();
  }

  ngOnDestroy() {
    if (this.getDataSub) {
      this.getDataSub.unsubscribe();
    }
  }

  onSelect(e) {
    if (e && e.series) {
      this.activeMonth = e.series;
      this.dayChartModalVisible = true;
      this.modal.show();
    }
  }

  graphClickEvent(event, array) {
    if (array.length > 0) {
      this.activeMonth = array[0]._index;
      this.dayChartModalVisible = true;
      this.modal.show();
    }
  }

  chartClicked(event) {
    console.log('ok');
  }

  onHideDayChart() {
    this.dayChartModalVisible = false;
  }

  private updateData() {
    if (this.getDataSub) {
      this.getDataSub.unsubscribe();
    }

    this.monthChartData = [];
    this.dayChartDataByMonth = {};
    this.barChartData = [];
    this.daybarChartData = [];

    this.getDataSub = this.warehouseApi.warehouseQueryAggregateGet(
      this.query ? this.query : { taxonId: [this.taxonId], cache: true },
      ['gathering.conversions.month', 'gathering.conversions.day', 'unit.lifeStage'],
      ['unit.lifeStage'],
      10000,
      1,
      undefined,
      true
    ).pipe(
      map(res => res.results),
      switchMap(res => this.setData(res))
    ).subscribe(() => {
      this.hasData.emit(this.barChartData.length > 0);
      this.cd.markForCheck();
    });
  }

  private setData(result: any[]): Observable<any[]> {
    if (result.length < 1) {
      return of([]);
    }

    // this.monthChartData = this.initMonthChartData();
    this.daybarChartData = this.initDayChartDataDay();
    const labelObservables = [];

    result.forEach(r => {
      const month = parseInt(r.aggregateBy['gathering.conversions.month'], 10);
      const day = parseInt(r.aggregateBy['gathering.conversions.day'], 10);
      const lifeStage = r.aggregateBy['unit.lifeStage'];
      const count = r.count;

      // this.addDataToSeries(lifeStage, count, this.monthChartData[month - 1].series, labelObservables);
      this.addDataToSeriesGiorgio(lifeStage, count, month, labelObservables);

      if (day) {
        /*if (!this.dayChartDataByMonth[month]) {
          this.dayChartDataByMonth[month] = this.initDayChartData(month);
        }*/
        // this.addDataToSeries(lifeStage, count, this.dayChartDataByMonth[month][day - 1].series, labelObservables);
        this.addDataDayToSeriesGiorgio (lifeStage, count, month, day, labelObservables);
      }
    });
    return labelObservables.length > 0 ? forkJoin(labelObservables) : of([]);
  }

  private addDataToSeriesGiorgio(lifeStage: string, count: number, month: number, labelObservables: any[]) {
    if (this.barChartData.length < 1) {
      this.barChartData.push({
        label: this.translate.instant('all'),
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      });
    }
    this.barChartData[0].data[month - 1] += count;
    if (lifeStage) {
      let index = this.barChartData.findIndex(s => s.label === lifeStage);
      if (index === -1) {
        index = this.barChartData.length;
        this.barChartData.push({label: lifeStage, data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]});
        labelObservables.push(
          this.getLabel(lifeStage).pipe(
            tap(label => {
              this.barChartData[index].label = label;
            })
          )
        );
      }

      this.barChartData[index].data[month - 1] += count;

    }
  }

  private addDataDayToSeriesGiorgio(lifeStage: string, count: number, month: number, day: number, labelObservables: any[]) {
    if (this.daybarChartData[month - 1].length < 1) {
      const values = this.initDayBarChartData(month);
      this.daybarChartData[month - 1].push({
        label: this.translate.instant('all'),
        data: values
      });
    }
    this.daybarChartData[month - 1][0].data[day] += count;

    if (lifeStage) {
      const values = this.initDayBarChartData(month);
      let index = this.daybarChartData[month - 1].findIndex(s => s.label === lifeStage);
      if (index === -1) {
        index = this.daybarChartData[month - 1].length;
        this.daybarChartData[month - 1].push({label: lifeStage, data: values});
        labelObservables.push(
          this.getLabel(lifeStage).pipe(
            tap(label => {
              this.daybarChartData[month - 1][index].label = label;
            })
          )
        );
      }

      this.daybarChartData[month - 1][index].data[day] += count;
    }
  }

  /*private addDataToSeries(lifeStage: string, count: number, series: any[], labelObservables: any[]) {
    if (series.length < 1) {
      series.push({
        name: this.translate.instant('all'),
        value: 0
      });
    }
    series[0].value += count;

    if (lifeStage) {
      let index = series.findIndex(s => s.name === lifeStage);
      if (index === -1) {
        index = series.length;
        series.push({name: lifeStage, value: 0});
        labelObservables.push(
          this.getLabel(lifeStage).pipe(
            tap(label => {
              series[index].name = label;
            })
          )
        );
      }
      series[index].value += count;
    }
  }*/

  /*private initMonthChartData(): any[] {
    const data = [];
    for (let i = 1; i < 13; i++) {
      data.push({
        name: i,
        series: []
      });
    }
    return data;
  }*/

  /*private initDayChartData(month: number): any[] {
    const data = [];
    for (let i = 1; i < this.getNbrOfDaysInMonth(month) + 1; i++) {
      data.push({
        name: i,
        series: []
      });
    }
    return data;
  }*/

  private initDayChartDataDay(): any[] {
    const data = [];
    for (let i = 1; i < 13; i++) {
      data.push([]);
    }
    return data;
  }

  private initDayBarChartData(month: number): any[] {
    const days = [];
    for (let i = 1; i < this.getNbrOfDaysInMonth(month) + 1; i++) {
      days[i] = 0;
    }
    return days;
  }

  private getLabel(warehouseKey: string): Observable<string> {
    return this.warehouseService.getOriginalKey(warehouseKey)
      .pipe(
        switchMap(key => this.triplestoreLabelService.get(key, this.translate.currentLang)),
        map(label => label ? label.charAt(0).toUpperCase() + label.slice(1) : '')
      );
  }

  yAxisTickFormatting(value: number): string {
    return value.toLocaleString('fi');
  }

  private getMonthLabel(month: number): string {
    return this.translate.instant('m-' + (month < 10 ? '0' : '') + month);
  }

  private getNbrOfDaysInMonth(month: number): number {
    return new Date(2000, month, 0).getDate();
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public arrayMax(arr) {
    return arr.reduce(function (p, v) {
      return ( p > v ? p : v );
    });
  }

}
