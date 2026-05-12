import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { getPointIconAsCircle } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.component';
import type { DataOptions } from '@luomus/laji-map';
import { TranslateService } from '@ngx-translate/core';
import { GetFeatureStyleOptions } from '@luomus/laji-map';
import { LajiMapVisualization } from 'projects/laji/src/app/shared-modules/legend/laji-map-visualization';
import { YearInfoItem } from 'projects/laji/src/app/shared-modules/year-slider/year-slider.component';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map, tap, switchMap } from 'rxjs';
import { InvasiveControlEffectiveness } from '../invasive-species-control-result.component';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { paths } from 'projects/laji-api-client-b/generated/api';

type WarehouseAggregateQuery = paths['/warehouse/query/unit/aggregate']['get']['parameters']['query'];

const effectivenessToVisCategory: Record<Exclude<InvasiveControlEffectiveness, 'NOT_FOUND'>, {color: string; label: string}> = {
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class InvasiveSpeciesControlResultMapComponent implements OnInit {

  readonly year$ = new ReplaySubject<string>();
  readonly taxon$ = new ReplaySubject<string>();
  @Input() set year(v: string) { this.year$.next(v); };
  @Input() set taxon(v: string) { this.taxon$.next(v); };

  @Output() yearChange = new EventEmitter<string>();
  @Output() taxonChange = new EventEmitter<string>();

  mapData$!: Observable<DataOptions>;
  years$!: Observable<YearInfoItem[]>;
  loading = true;

  visualization: LajiMapVisualization<'invasiveControlEffectiveness'> = {
    invasiveControlEffectiveness: {
      label: 'invasiveSpeciesControl.stats.map.legend.title',
      categories: Object.keys(effectivenessToVisCategory).reduce((_categories, effectiveness) => ([
        ..._categories,
        (effectivenessToVisCategory as any)[effectiveness]
      ] as any), [])
    }
  };

  constructor(
    private api: LajiApiClientBService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    const query$ = combineLatest([this.year$, this.taxon$]).pipe(
      switchMap(([year, taxon]) => {
        const query: WarehouseAggregateQuery = {
          time: year,
          taxonId: taxon,
          hasValue: 'unit.interpretations.invasiveControlEffectiveness',
          aggregateBy: [
            'document.namedPlace.wgs84CenterPoint.lat',
            'document.namedPlace.wgs84CenterPoint.lon',
            'unit.interpretations.invasiveControlEffectiveness'
          ],
          pageSize: 10000
        };
        return this.api.get('/warehouse/query/unit/aggregate', { query });
      })
    );

    this.mapData$ = query$.pipe(
      tap(() => {
        this.loading = true;
      }),
      map(response => ({
        ...this.getDataOptions(),
        featureCollection: {
          type: 'FeatureCollection' as const,
          features: response.results.reduce((_features: any[], item) => {
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

    this.years$ = this.taxon$.pipe(
      switchMap(taxon => {
        const query: WarehouseAggregateQuery = {
          taxonId: taxon,
          hasValue: 'unit.interpretations.invasiveControlEffectiveness,document.namedPlace.wgs84CenterPoint.lat',
          aggregateBy: ['gathering.conversions.year'],
          orderBy: ['gathering.conversions.year'],
          pageSize: 10000
        };
        return this.api.get('/warehouse/query/unit/aggregate', { query }).pipe(
          map(response => {
            let total = 0;
            const years = response.results.map(item => {
              total += item.count;
              return { year: item.aggregateBy['gathering.conversions.year'], count: item.count };
            }).sort((a, b) => +b.year - +a.year);
            return [{ year: 'all', count: total }, ...years];
          })
        );
      })
    );
  }

  getDataOptions(): Omit<DataOptions, 'featureCollection'> {
    return {
      label: this.translate.instant('invasiveSpeciesControl.stats.map.dataLayerLabel'),
      marker: {
        icon: getPointIconAsCircle
      },
      getFeatureStyle: this.getFeatureStyle
    };
  }

  getFeatureStyle({feature}: GetFeatureStyleOptions) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let {effectiveness} = feature!.properties as any;
    if (effectiveness === 'NOT_FOUND') { // Same colour as full since it means that the species was not present = good thing.
      effectiveness = 'FULL';
    }

    return {
      color: (effectivenessToVisCategory as any)[effectiveness].color
    };
  }

  onTaxonChange(taxon: string) {
    this.taxonChange.emit(taxon);
  }

  onYearChange(year: string) {
    this.yearChange.emit(year === 'all' ? undefined : year);
  }
}
