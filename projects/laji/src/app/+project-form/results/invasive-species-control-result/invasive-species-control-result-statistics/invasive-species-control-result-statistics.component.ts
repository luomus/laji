import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WarehouseApi } from 'projects/laji/src/app/shared/api/WarehouseApi';
import { Area } from 'projects/laji/src/app/shared/model/Area';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map, switchMap, share, tap } from 'rxjs/operators';
import { InvasiveControlEffectiveness } from '../invasive-species-control-result.component';

export interface InvasiveControlEffectivenessStatisticsQueryResult {
  results: {
    aggregateBy: {
    'gathering.conversions.year': string;
      'unit.interpretations.invasiveControlEffectiveness': InvasiveControlEffectiveness;
    };
    count: number;
  }[];
}

interface Row {
  year: number;
  visits: number;
  full: number;
  partial: number;
  noEffect: number;
}

@Component({
  selector: 'laji-invasive-species-control-result-statistics',
  templateUrl: './invasive-species-control-result-statistics.component.html',
  styleUrls: ['./invasive-species-control-result-statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvasiveSpeciesControlResultStatisticsComponent implements OnInit {

  readonly municipality$ = new ReplaySubject<string>();
  readonly taxon$ = new ReplaySubject<string>();
  @Input() set municipality(v: string) { this.municipality$.next(v); };
  @Input() set taxon(v: string) { this.taxon$.next(v); };

  @Output() municipalityChange = new EventEmitter<string>();
  @Output() taxonChange = new EventEmitter<string>();

  areaTypes = Area.AreaType;

  rows$!: Observable<Row[]>;
  loading$ = new BehaviorSubject(true);

  columns = [
    {name: 'year', label: 'invasiveSpeciesControl.stats.statistics.table.cols.year'},
    {name: 'visits', label: 'invasiveSpeciesControl.stats.statistics.table.cols.visits'},
    {name: 'full', label: 'invasiveSpeciesControl.stats.statistics.table.cols.full'},
    {name: 'partial', label: 'invasiveSpeciesControl.stats.statistics.table.cols.partial'},
    {name: 'noEffect', label: 'invasiveSpeciesControl.stats.statistics.table.cols.noEffect'},
    {name: 'notFound', label: 'invasiveSpeciesControl.stats.statistics.table.cols.notFound'}
  ];

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

  ngOnInit(): void {
    const query$ = combineLatest(this.municipality$, this.taxon$).pipe(
      tap(() => {this.loading$.next(true);}),
      switchMap(([municipality, taxon]) => this.warehouseApi.warehouseQueryAggregateGet(
      {finnishMunicipalityId: municipality, taxonId: taxon},
      ['unit.interpretations.invasiveControlEffectiveness','gathering.conversions.year'],
      undefined,
      10000
    )));
    this.rows$ = query$.pipe(map((response: InvasiveControlEffectivenessStatisticsQueryResult) => {
      const byYear: any = response.results.reduce((_byYear: any, item) => {
        const year = item.aggregateBy['gathering.conversions.year'];
        if (!_byYear[year]) {
          _byYear[year] = {year: +year, visits: 0, full: 0, partial: 0, noEffect: 0, notFound: 0};
        }
        const entry = _byYear[year];
        switch (item.aggregateBy['unit.interpretations.invasiveControlEffectiveness']) {
        case 'FULL':
          entry.full += item.count;
          break;
        case 'PARTIAL':
          entry.partial += item.count;
          break;
        case 'NO_EFFECT':
          entry.noEffect += item.count;
          break;
        case 'NOT_FOUND':
          entry.notFound += item.count;
          break;
        }
        entry.visits += item.count;
        return _byYear;
      }, {});
      return Object.keys(byYear).reduce((rows: any[], year) => {
        if (!year) { // There can be year "" for unknown reason. We agreed that it should be simply filtered out.
          return rows;
        }
        rows.push(byYear[year]);
        return rows;
      }, []).sort((a: any, b: any) => b.year - a.year);
    }),
    tap(() => {this.loading$.next(false);}),
    share());
  }

  onMunicipalityChange(municipality: string) {
    this.municipalityChange.emit(municipality);
  }

  onTaxonChange(taxon: string) {
    this.taxonChange.emit(taxon);
  }

}
