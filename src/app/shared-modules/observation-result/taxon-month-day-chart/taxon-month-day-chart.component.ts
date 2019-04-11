import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild
} from '@angular/core';
import {Subscription, of, Observable, forkJoin} from 'rxjs';
import {WarehouseApi} from '../../../shared/api/WarehouseApi';
import {map, switchMap, tap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {WarehouseValueMappingService} from '../../../shared/service/warehouse-value-mapping.service';
import {TriplestoreLabelService} from '../../../shared/service/triplestore-label.service';
import {ModalDirective} from 'ngx-bootstrap';

@Component({
  selector: 'laji-taxon-month-day-chart',
  templateUrl: './taxon-month-day-chart.component.html',
  styleUrls: ['./taxon-month-day-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonMonthDayChartComponent implements OnChanges, OnDestroy {
  @ViewChild('dayChartModal') public modal: ModalDirective;
  @Input() taxonId: string;
  @Input() query: any;

  monthChartData: any[];
  dayChartDataByMonth = {};

  dayChartModalVisible = false;
  activeMonth: number;

  monthFormatting: (number) => string = this.getMonthLabel.bind(this);

  private getDataSub: Subscription;

  @Output() hasData = new EventEmitter<boolean>();

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

  onHideDayChart() {
    this.dayChartModalVisible = false;
  }

  private updateData() {
    if (this.getDataSub) {
      this.getDataSub.unsubscribe();
    }

    this.monthChartData = [];
    this.dayChartDataByMonth = {};

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
      this.hasData.emit(this.monthChartData.length > 0);
      this.cd.markForCheck();
    });
  }

  private setData(result: any[]): Observable<any[]> {
    if (result.length < 1) {
      return of([]);
    }

    this.monthChartData = this.initMonthChartData();
    const labelObservables = [];

    result.forEach(r => {
      const month = parseInt(r.aggregateBy['gathering.conversions.month'], 10);
      const day = parseInt(r.aggregateBy['gathering.conversions.day'], 10);
      const lifeStage = r.aggregateBy['unit.lifeStage'];
      const count = r.count;

      this.addDataToSeries(lifeStage, count, this.monthChartData[month - 1].series, labelObservables);

      if (day) {
        if (!this.dayChartDataByMonth[month]) {
          this.dayChartDataByMonth[month] = this.initDayChartData(month);
        }
        this.addDataToSeries(lifeStage, count, this.dayChartDataByMonth[month][day - 1].series, labelObservables);
      }
    });

    return labelObservables.length > 0 ? forkJoin(labelObservables) : of([]);
  }

  private addDataToSeries(lifeStage: string, count: number, series: any[], labelObservables: any[]) {
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
  }

  private initMonthChartData(): any[] {
    const data = [];
    for (let i = 1; i < 13; i++) {
      data.push({
        name: i,
        series: []
      });
    }
    return data;
  }

  private initDayChartData(month: number): any[] {
    const data = [];
    for (let i = 1; i < this.getNbrOfDaysInMonth(month) + 1; i++) {
      data.push({
        name: i,
        series: []
      });
    }
    return data;
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
}
