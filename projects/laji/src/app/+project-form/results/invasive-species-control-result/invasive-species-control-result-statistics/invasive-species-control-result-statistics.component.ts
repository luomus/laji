import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WarehouseApi } from 'projects/laji/src/app/shared/api/WarehouseApi';
import { Area } from 'projects/laji/src/app/shared/model/Area';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

export interface InvasiveControlEffectivenessStatisticsQueryResult {
  results: {
    aggregateBy: {
    'gathering.conversions.year': string;
      'unit.interpretations.invasiveControlEffectiveness': 'FULL' | 'PARTIAL' | 'NO_EFFECT';
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

  rows$: Observable<Row[]>;
  loading$: Observable<boolean>;

  columns = [
    {name: 'year', label: 'invasiveSpeciesControl.stats.statistics.table.cols.year'},
    {name: 'visits', label: 'invasiveSpeciesControl.stats.statistics.table.cols.visits'},
    {name: 'full', label: 'invasiveSpeciesControl.stats.statistics.table.cols.full'},
    {name: 'partial', label: 'invasiveSpeciesControl.stats.statistics.table.cols.partial'},
    {name: 'noEffect', label: 'invasiveSpeciesControl.stats.statistics.table.cols.noEffect'}
  ];

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

  ngOnInit(): void {
    const query$ = combineLatest(this.municipality$, this.taxon$).pipe(switchMap(([municipality, taxon]) => this.warehouseApi.warehouseQueryAggregateGet(
      {finnishMunicipalityId: municipality, taxonId: taxon},
      ['unit.interpretations.invasiveControlEffectiveness','gathering.conversions.year'],
      undefined,
      10000
    )));
    this.rows$ = query$.pipe(map((response: InvasiveControlEffectivenessStatisticsQueryResult) => {
      const byYear = response.results.reduce((_byYear, item) => {
        const year = item.aggregateBy['gathering.conversions.year'];
        if (!_byYear[year]) {
          _byYear[year] = {year: +year, visits: 0, full: 0, partial: 0, noEffect: 0};
        }
        const entry = _byYear[year];
        switch (item.aggregateBy['unit.interpretations.invasiveControlEffectiveness']) {
        case 'FULL':
          entry.full++;
          break;
        case 'PARTIAL':
          entry.partial++;
          break;
        case 'PARTIAL':
          entry.noEffect++;
          break;
        }
        entry.visits += item.count;
        return _byYear;
      }, {});
      return Object.keys(byYear).reduce((rows, year) => {
        if (!year) { // There can be year "" for unknown reason. We agreed that it should be simply filtered out.
          return rows;
        }
        rows.push(byYear[year]);
        return rows;
      }, []);
    }));
    this.loading$ = this.rows$.pipe(map(() => false)).pipe(startWith(true));
  }

  onMunicipalityChange(municipality: string) {
    this.municipalityChange.emit(municipality);
  }

  onTaxonChange(taxon: string) {
    this.taxonChange.emit(taxon);
  }

}
