import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { map, switchMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseValueMappingService } from '../../../shared/service/warehouse-value-mapping.service';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Chart } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import {LocalStorageService, LocalStorage} from 'ngx-webstorage';


@Component({
  selector: 'laji-observation-month-day-chart',
  templateUrl: './observation-month-day-chart.component.html',
  styleUrls: ['./observation-month-day-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationMonthDayChartComponent implements OnChanges, OnDestroy, OnInit {
  @ViewChild('dayChartModal', { static: true }) public modal: ModalDirective;
  @Input() taxonId: string;
  @Input() query: any;
  monthChartData: any[];
  dayChartDataByMonth = {};

  dayChartModalVisible = false;
  activeMonth: number;

  public barChartLabels: string[];
  public barChartLabelsDay: string[];
  public barChartData: any[];
  public daybarChartData: any[][];
  public barChartOptions: any;
  private barChartPlugins: any;
  @LocalStorage('onlycount') onlyCount;


  monthFormatting: (number) => string = this.getMonthLabel.bind(this);

  private getDataSub: Subscription;


  @Output() hasData = new EventEmitter<boolean>();

  constructor(
    private warehouseApi: WarehouseApi,
    private warehouseService: WarehouseValueMappingService,
    private triplestoreLabelService: TriplestoreLabelService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private localSt: LocalStorageService
  ) { }

  ngOnInit() {
    Chart.Tooltip.positioners.cursor = function(chartElements, coordinates) {
      return coordinates;
    };
    this.localSt.observe('onlycount')
    .subscribe((value) => {
      this.onlyCount = value;
      this.onlyCount = this.onlyCount === null ? true : this.onlyCount;
      this.updateData();
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

  initializeGraph() {
    this.barChartPlugins = [pluginDataLabels];
    this.barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
    enabled: true,
    mode: 'index',
    position: 'cursor'
    },
    scales: {
      xAxes: [{
        gridLines: {
          color: 'rgba(230,230,230,0.5)',
          lineWidth: 0.2
        },
        ticks: {
          minRotation: 0,
          maxRotation: 300,
          autoSkip: false,
          fontColor: '#23527c'
        },
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
    this.barChartLabels = [];

    this.getDataSub = this.warehouseApi.warehouseQueryAggregateGet(
      this.query ? this.query : { taxonId: [this.taxonId], cache: true },
      ['gathering.conversions.month', 'gathering.conversions.day', 'unit.lifeStage'],
      ['unit.lifeStage'],
      10000,
      1,
      undefined,
      this.onlyCount === null ? true : this.onlyCount ? true : false
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

    this.daybarChartData = this.initDayChartDataDay();
    const labelObservables = [];

    result.forEach(r => {
      const month = parseInt(r.aggregateBy['gathering.conversions.month'], 10);
      const day = parseInt(r.aggregateBy['gathering.conversions.day'], 10);
      const lifeStage = r.aggregateBy['unit.lifeStage'];
      const count = this.onlyCount === null ? r.count : this.onlyCount ? r.count : r.individualCountSum;

      this.addDataToSeriesGiorgio(lifeStage, count, month, labelObservables);

      if (day) {
        this.addDataDayToSeries(lifeStage, count, month, day, labelObservables);
      }

      this.initializeGraph();
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

  private addDataDayToSeries(lifeStage: string, count: number, month: number, day: number, labelObservables: any[]) {
    if (this.daybarChartData[month - 1].length < 1) {
      const values = this.initDayBarChartData(month);
      this.daybarChartData[month - 1].push({
        label: this.translate.instant('all'),
        data: values
      });
    }
    this.daybarChartData[month - 1][0].data[day - 1] += count;

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

      this.daybarChartData[month - 1][index].data[day - 1] += count;
    }
  }

  private initDayChartDataDay(): any[] {
    const data = [];
    for (let i = 1; i < 13; i++) {
      data.push([]);
      this.barChartLabels.push(this.getMonthLabel(i));
    }
    return data;
  }

  private initDayBarChartData(month: number): any[] {
    const days = [];
    for (let i = 0; i < this.getNbrOfDaysInMonth(month); i++) {
      days[i] = 0;
    }
    return days;
  }

  private initLabelsDayChartData(month: number): any[] {
    for (let i = 1; i < this.getNbrOfDaysInMonth(month + 1) + 1; i++) {
      this.barChartLabelsDay.push('' + i);
    }
    return this.barChartLabelsDay;
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

  toggleOnlyCount() {
    this.onlyCount = !this.onlyCount;
    this.updateData();
  }

  barClicked({ index }) {
    this.barChartLabelsDay = [];
    this.activeMonth = index;
    this.initLabelsDayChartData(this.activeMonth);
    this.dayChartModalVisible = true;
    this.modal.show();
  }
}
