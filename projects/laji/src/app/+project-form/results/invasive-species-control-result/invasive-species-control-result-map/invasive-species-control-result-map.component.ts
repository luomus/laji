import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { getPointIconAsCircle } from '@laji-map/laji-map.component';
import { LajiMapDataOptions } from '@laji-map/laji-map.interface';
import { TranslateService } from '@ngx-translate/core';
import { GetFeatureStyleOptions } from 'laji-map';
import { LajiMapVisualization } from 'projects/laji/src/app/shared-modules/legend/laji-map-visualization';
import { YearInfoItem } from 'projects/laji/src/app/shared-modules/year-slider/year-slider.component';
import { WarehouseApi } from 'projects/laji/src/app/shared/api/WarehouseApi';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { InvasiveControlEffectivenessStatisticsQueryResult } from '../invasive-species-control-result-statistics/invasive-species-control-result-statistics.component';

type InvasiveControlEffectiveness = 'FULL' | 'PARTIAL' | 'NO_EFFECT';

interface QueryResult {
  results: {
    aggregateBy: {
    'document.namedPlace.wgs84CenterPoint.lat': string;
    'document.namedPlace.wgs84CenterPoint.lon': string;
    'unit.interpretations.invasiveControlEffectiveness': InvasiveControlEffectiveness;
    };
    count: number;
  }[];
}


const effectivenessToVisCategory: Record<InvasiveControlEffectiveness, {color: string; label: string}> = {
  FULL: {
    color: '#00ff00',
    label: 'invasiveSpeciesControl.stats.map.legend.full'
  },
  PARTIAL: {
    color: '#ffff00',
    label: 'invasiveSpeciesControl.stats.map.legend.partial'
  },
  NO_EFFECT: {
    color: '#ffffff',
    label: 'invasiveSpeciesControl.stats.map.legend.noEffect'
  }
};

@Component({
  selector: 'laji-invasive-species-control-result-map',
  templateUrl: './invasive-species-control-result-map.component.html',
  styleUrls: ['./invasive-species-control-result-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvasiveSpeciesControlResultMapComponent implements OnInit {

  readonly year$ = new ReplaySubject<string>();
  readonly taxon$ = new ReplaySubject<string>();
  @Input() set year(v: string) { this.year$.next(v); };
  @Input() set taxon(v: string) { this.taxon$.next(v); };

  @Output() yearChange = new EventEmitter<string>();
  @Output() taxonChange = new EventEmitter<string>();

  mapData$: Observable<LajiMapDataOptions>;
  years$: Observable<YearInfoItem[]>;
  loading = true;

  visualization: LajiMapVisualization<'invasiveControlEffectiveness'> = {
    invasiveControlEffectiveness: {
      label: 'laji-map.legend.mode.obsCount',
      categories: Object.keys(effectivenessToVisCategory).reduce((_categories, effectiveness) => ([
        ..._categories,
        effectivenessToVisCategory[effectiveness]
      ]), [])
    }
  };

  constructor(
    private warehouseApi: WarehouseApi,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    const query$ = combineLatest([this.year$, this.taxon$]).pipe(switchMap(([year, taxon]) => this.warehouseApi.warehouseQueryAggregateGet(
      {time: year, taxonId: taxon, hasValue: 'unit.interpretations.invasiveControlEffectiveness'},
      [
        'document.namedPlace.wgs84CenterPoint.lat',
        'document.namedPlace.wgs84CenterPoint.lon',
        'unit.interpretations.invasiveControlEffectiveness'
      ]
    )));

    this.mapData$ = query$.pipe(
      tap(() => { this.loading = true; }),
      map((response: QueryResult) => ({
        ...this.getDataOptions(),
        featureCollection: {
          type: 'FeatureCollection' as const,
          features: response.results.reduce((_features, item) => {
            _features.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [
                  +item.aggregateBy['document.namedPlace.wgs84CenterPoint.lon'],
                  +item.aggregateBy['document.namedPlace.wgs84CenterPoint.lat']
                ],
              },
              properties: {
                count: item.count,
                effectiveness: item.aggregateBy['unit.interpretations.invasiveControlEffectiveness']
              }
            });
            return _features;
          }, [])
        }
      })),
      tap(() => { this.loading = false; })
    );

    this.years$ = this.taxon$.pipe(switchMap(taxon =>
      this.warehouseApi.warehouseQueryAggregateGet({taxonId: taxon},
        ['unit.interpretations.invasiveControlEffectiveness','gathering.conversions.year']
      ).pipe(map((response: InvasiveControlEffectivenessStatisticsQueryResult) => {
        const byYear = response.results.reduce((_byYear, item) => {
          const year = item.aggregateBy['gathering.conversions.year'];
          if (!_byYear[year]) {
            _byYear[year] = {year, count: 0};
          }
          _byYear[year].count += item.count;
          return _byYear;
        }, {} as Record<string, YearInfoItem>);
        return Object.keys(byYear).reduce((yearInfos, year) => {
          yearInfos.push(byYear[year]);
          return yearInfos;
        }, [] as YearInfoItem[]);
      }))
    ));
  }

  getDataOptions(): Omit<LajiMapDataOptions, 'featureCollection'> {
    return {
      label: this.translate.instant('invasiveSpeciesControl.stats.map.dataLayerLabel'),
      marker: {
        icon: getPointIconAsCircle
      },
      getFeatureStyle: this.getFeatureStyle
    };
  }

  getFeatureStyle({feature}: GetFeatureStyleOptions) {
    return {
      color: effectivenessToVisCategory[feature.properties.effectiveness].color
    };
  }

  onTaxonChange(taxon: string) {
    this.taxonChange.emit(taxon);
  }

  onYearChange(year: string) {
    this.yearChange.emit(year);
  }
}
