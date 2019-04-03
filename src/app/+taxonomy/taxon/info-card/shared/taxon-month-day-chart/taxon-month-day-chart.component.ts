import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, OnChanges, OnDestroy, Output
} from '@angular/core';
import {Subscription, of, Observable, forkJoin} from 'rxjs';
import {WarehouseApi} from '../../../../../shared/api/WarehouseApi';
import {map, switchMap, tap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {WarehouseValueMappingService} from '../../../../../shared/service/warehouse-value-mapping.service';
import {TriplestoreLabelService} from '../../../../../shared/service/triplestore-label.service';

@Component({
  selector: 'laji-taxon-month-day-chart',
  templateUrl: './taxon-month-day-chart.component.html',
  styleUrls: ['./taxon-month-day-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonMonthDayChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() taxonId: string;
  data: any[];

  private getDataSub: Subscription;

  @Output() hasData = new EventEmitter<boolean>();

  constructor(
    private warehouseApi: WarehouseApi,
    private warehouseService: WarehouseValueMappingService,
    private triplestoreLabelService: TriplestoreLabelService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {

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
    console.log(e);
  }

  private updateData() {
    if (this.getDataSub) {
      this.getDataSub.unsubscribe();
    }

    this.data = undefined;
    this.getDataSub = this.warehouseApi.warehouseQueryAggregateGet(
      { taxonId: [this.taxonId], cache: true },
      ['gathering.conversions.month', 'unit.lifeStage'],
      ['gathering.conversions.month', 'unit.lifeStage'],
      10000,
      1,
      undefined,
      true
    ).pipe(
      map(res => res.results),
      switchMap(res => this.getData(res))
    ).subscribe(data => {
      this.data = data;
      this.hasData.emit(this.data.length > 0);
      this.cd.markForCheck();
    });
  }

  yAxisTickFormatting(value: number) {
    return value.toLocaleString('fi');
  }

  private getData(result: any[]): Observable<any[]> {
    if (result.length < 1) {
      return of([]);
    }

    const data = this.getInitData();
    const labelObservables = [];

    result.forEach(r => {
      const month = parseInt(r.aggregateBy['gathering.conversions.month'], 10);
      const lifeStage = r.aggregateBy['unit.lifeStage'];
      const count = r.count;
      const series = data[month - 1].series;

      if (series.length < 1) {
        series.push({
          name: this.translate.instant('all'),
          value: 0
        });
      }
      series[0].value += count;

      if (lifeStage) {
        const dataItem = {
          name: lifeStage,
          value: count
        };
        series.push(dataItem);
        labelObservables.push(
          this.getLabel(lifeStage).pipe(
            tap(label => {
              dataItem.name = label;
            })
          )
        );
      }
    });

    return (labelObservables.length > 0 ? forkJoin(labelObservables) : of([]))
      .pipe(map(() => data));
  }

  private getInitData() {
    const data = [];
    for (let i = 1; i < 13; i++) {
      const name = this.translate.instant('m-' + (i < 10 ? '0' : '') + i);
      data.push({
        name: name,
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
}
