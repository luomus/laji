import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { defaultIfEmpty, map, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseValueMappingService } from '../../../shared/service/warehouse-value-mapping.service';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';

interface ChartDataElement {label: string; data: number[]}

export interface ChartData {
  yearChartData: ChartDataElement[];
  monthChartDataArr: ChartDataElement[][];
}

export const getNbrOfDaysInMonth = (monthIdx: number): number => (
  new Date(2000, monthIdx + 1, 0).getDate()
);

@Injectable()
export class ObservationMonthDayChartFacade {
  chartData$ = new BehaviorSubject<ChartData>({yearChartData: [], monthChartDataArr: []});

  constructor(
    private warehouse: WarehouseApi,
    private valueMappingService: WarehouseValueMappingService,
    private triplestoreLabelService: TriplestoreLabelService,
    private translate: TranslateService
  ) {}

  loadChartData(query: WarehouseQueryInterface, useIndividualCount: boolean) {
    this.warehouse.warehouseQueryAggregateGet(
      query,
      ['gathering.conversions.month', 'gathering.conversions.day', 'unit.lifeStage'],
      ['unit.lifeStage'],
      10000,
      1,
      undefined,
      !useIndividualCount
    ).pipe(
      map(res => res.results),
      switchMap(res => this.parseChartData(res, useIndividualCount))
    ).subscribe(chartData => {
      this.chartData$.next(chartData);
    });
  }

  private parseChartData(results: any[], useIndividualCount: boolean): Observable<ChartData> {
    const yearChartData: ChartDataElement[] = [{label: this.translate.instant('all'), data: (new Array(12)).fill(0) }];
    const yearChartDataByLifeStage: {[label: string]: number[]} = {};

    const monthChartDataArr: ChartDataElement[][] = (new Array(12)).fill(undefined).map((_, monthIdx) => ([
      {label: this.translate.instant('all'), data: (new Array(getNbrOfDaysInMonth(monthIdx))).fill(0) }
    ]));
    const monthChartDataByLifeStage: {[label: string]: number[]}[] = (new Array(12)).fill(undefined).map(_ => ({}));

    for (const result of results) {
      const month = parseInt(result.aggregateBy['gathering.conversions.month'], 10);
      const day = parseInt(result.aggregateBy['gathering.conversions.day'], 10);
      const lifeStage = result.aggregateBy['unit.lifeStage'];
      const count = useIndividualCount ? result.individualCountSum : result.count;

      yearChartData[0].data[month - 1] += count;
      monthChartDataArr[month - 1][0].data[day - 1] += count;
      if (lifeStage) {
        if (!yearChartDataByLifeStage[lifeStage]) { yearChartDataByLifeStage[lifeStage] = (new Array(12)).fill(0); }
        yearChartDataByLifeStage[lifeStage][month - 1] += count;
        if (!monthChartDataByLifeStage[month - 1][lifeStage]) { monthChartDataByLifeStage[month - 1][lifeStage] = new Array(getNbrOfDaysInMonth(month - 1)).fill(0); }
        monthChartDataByLifeStage[month - 1][lifeStage][day - 1] += count;
      }
    }

    const labelObservables: Observable<string>[] = [];
    Object.entries(yearChartDataByLifeStage).forEach(([lifeStage, data]) => {
      labelObservables.push(this.getLifeStageLabel(lifeStage).pipe(tap(label => yearChartData.push({ label, data }))));
    });
    monthChartDataByLifeStage.forEach((d, monthIdx) => {
      Object.entries(d).forEach(([lifeStage, data]) => {
        labelObservables.push(this.getLifeStageLabel(lifeStage).pipe(tap(label => monthChartDataArr[monthIdx].push({ label, data }))));
      });
    });

    return forkJoin(labelObservables).pipe(defaultIfEmpty(null) as any, map(_ => ({yearChartData, monthChartDataArr})));
  }

  private getLifeStageLabel(lifeStage: string): Observable<string> {
    return this.valueMappingService.getSchemaKey(lifeStage).pipe(
      switchMap(key => this.triplestoreLabelService.get(key, this.translate.currentLang)),
      map(label => label ? label.charAt(0).toUpperCase() + label.slice(1) : '')
    );
  }
}
