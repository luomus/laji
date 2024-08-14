import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataOptions, GetFeatureStyleOptions, Options } from '@luomus/laji-map';
import { convertYkjToGeoJsonFeature } from 'projects/laji/src/app/root/coordinate-utils';
import { getPointIconAsCircle } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.component';
import { LajiMapVisualization } from 'projects/laji/src/app/shared-modules/legend/laji-map-visualization';
import { WarehouseApi } from 'projects/laji/src/app/shared/api/WarehouseApi';
import { WarehouseQueryInterface } from 'projects/laji/src/app/shared/model/WarehouseQueryInterface';
import { toHtmlSelectElement } from 'projects/laji/src/app/shared/service/html-element.service';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import G from 'geojson';
import { TranslateService } from '@ngx-translate/core';

type GatheringCountType = 'ZERO' | 'ONE' | 'FIVE' | 'TEN' | 'FIFTY' | 'HUNDRED' | 'FIVE_HUNDRED';
type ObservationProbabilityType = 'ZERO' | 'OVER_ZERO' | 'OVER_TWENTY' | 'OVER_FORTY' | 'OVER_SIXTY' | 'OVER_EIGHTY' | 'HUNDRED';

type ResultVisualizationMode = 'gatheringCount' | 'observationProbability';

type CountMap = Map<string, { lat: string; lon: string; count: number }>;
type CountArray = { lat: string; lon: string; count: number }[];
type RatioMap = Map<string, { lat: string; lon: string; ratio: number }>;
type RatioArray = { lat: string; lon: string; ratio: number }[];

interface QueryResult {
  results: {
    aggregateBy: {
      'gathering.conversions.ykj10kmCenter.lat': string;
      'gathering.conversions.ykj10kmCenter.lon': string;
    };
    gatheringCount: number;
  }[];
}

const gatheringCountToVisCategory: Record<GatheringCountType, { color: string; label: string }> = {
  ZERO: {
    color: '#A9A9A9',
    label: '0'
  },
  ONE: {
    color: '#EE82EE',
    label: '1-4'
  },
  FIVE: {
    color: '#1E90FF',
    label: '5-9'
  },
  TEN: {
    color: '#00FF00',
    label: '10-49'
  },
  FIFTY: {
    color: '#FFFF00',
    label: '50-99'
  },
  HUNDRED: {
    color: '#FFA500',
    label: '100-499'
  },
  FIVE_HUNDRED: {
    color: '#DC143C',
    label: '500'
  }
};

const observationProbabilityToVisCategory: Record<ObservationProbabilityType, { color: string; label: string }> = {
  ZERO: {
    color: '#A9A9A9',
    label: '0%'
  },
  OVER_ZERO: {
    color: '#EE82EE',
    label: '0-19%'
  },
  OVER_TWENTY: {
    color: '#1E90FF',
    label: '20-39%'
  },
  OVER_FORTY: {
    color: '#00FF00',
    label: '40-59%'
  },
  OVER_SIXTY: {
    color: '#FFFF00',
    label: '60-79%'
  },
  OVER_EIGHTY: {
    color: '#FFA500',
    label: '80-99%'
  },
  HUNDRED: {
    color: '#DC143C',
    label: '100%'
  }
};

@Component({
  selector: 'laji-result-map',
  templateUrl: './result-map.component.html',
  styleUrls: ['./result-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultMapComponent implements OnInit {
  readonly collections$ = new BehaviorSubject<string[]>([]);
  readonly taxon$ = new BehaviorSubject<string | undefined>(undefined);
  readonly year$ = new BehaviorSubject<string | undefined>(undefined);
  @Input() set collections(v: string[]) { this.collections$.next(v); };
  @Input() set taxon(v: string | undefined) { this.taxon$.next(v); };
  @Input() set year(v: string | undefined) { this.year$.next(v); };
  @Input() taxonOptions: { label: string; value: string }[];
  @Input() visualizationOptions: ResultVisualizationMode[];
  @Input() mapQuery: WarehouseQueryInterface;
  @Input() gatheringCountLabel: string;

  @Output() taxonChange = new EventEmitter<string>();
  @Output() yearChange = new EventEmitter<string>();

  toHtmlSelectElement = toHtmlSelectElement;

  private gatheringCountMapData$: Observable<DataOptions>;
  private observationProbabilityMapData$: Observable<DataOptions>;

  mapData$: Observable<DataOptions>;
  mapOptions: Options;
  visualization: LajiMapVisualization<ResultVisualizationMode>;
  visualizationMode: ResultVisualizationMode = 'gatheringCount';
  defaultTaxon: string;
  defaultYear: string;
  yearOptions: { label: string; value: string }[];
  loading = true;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    private warehouseApi: WarehouseApi
  ) {
    this.mapOptions = {
      clickBeforeZoomAndPan: true
    };

    const currentYear = new Date().getFullYear();
    const yearsFrom2019 = [''].concat(Array.from({ length: currentYear - 2019 + 1 }, (_, i) => (2019 + i).toString()));
    this.yearOptions = yearsFrom2019.map(v => {
      if (v === '') {
        return { label: this.translate.instant('result.map.taxon.empty.label'), value: '' };
      } else {
        return { label: v, value: v };
      }
    });

    this.gatheringCountMapData$ = of([]).pipe(
      tap(() => {
        this.loading = true;
        this.changeDetectorRef.markForCheck();
      }),
      switchMap(_ => combineLatest([this.getGatheringCounts$(), this.getGatheringCounts$(true)])),
      map(([selectedTaxonGatheringCounts, allGatheringCounts]) => ({
        marker: {
          icon: getPointIconAsCircle
        },
        getFeatureStyle: this.gatheringCountFeatureStyle,
        featureCollection: {
          type: 'FeatureCollection' as const,
          features: this.gatheringCountsFromAllLocations(selectedTaxonGatheringCounts, allGatheringCounts).reduce((_features: G.Feature<G.Polygon>[], item) => {
            _features.push(
              convertYkjToGeoJsonFeature(
                +item.lat,
                +item.lon,
                { count: item.count }
              )
            );
            return _features;
          }, []).sort((a, b) => a.properties.count - b.properties.count)
        }
      })),
      tap(() => { this.loading = false; })
    );

    this.observationProbabilityMapData$ = of([]).pipe(
      tap(() => {
        this.loading = true;
        this.changeDetectorRef.markForCheck();
      }),
      switchMap(_ => combineLatest([this.getGatheringCounts$(), this.getGatheringCounts$(true)])),
      map(([selectedTaxonGatheringCounts, allGatheringCounts]) => ({
        marker: {
          icon: getPointIconAsCircle
        },
        getFeatureStyle: this.observationProbabilityFeatureStyle,
        featureCollection: {
          type: 'FeatureCollection' as const,
          features: this.gatheringCountRatios(selectedTaxonGatheringCounts, allGatheringCounts).reduce((_features, item) => {
            _features.push(
              convertYkjToGeoJsonFeature(
                +item.lat,
                +item.lon,
                { ratio: item.ratio }
              )
            );
            return _features;
          }, []).sort((a, b) => a.properties.ratio - b.properties.ratio)
        }
      })),
      tap(() => { this.loading = false; })
    );
  }

  ngOnInit(): void {
    this.defaultTaxon = this.taxon$.getValue() !== undefined ? this.taxon$.getValue() : '';
    this.defaultYear = this.year$.getValue() !== undefined ? this.year$.getValue() : '';
    this.mapData$ = this.gatheringCountMapData$;

    this.visualization = {
      gatheringCount: {
        label: this.gatheringCountLabel,
        categories: Object.keys(gatheringCountToVisCategory).reduce((_categories, prevalence) => ([
          ..._categories,
          gatheringCountToVisCategory[prevalence]
        ]), [])
      },
      observationProbability: {
        label: 'laji-map.legend.mode.observationProbability',
        categories: Object.keys(observationProbabilityToVisCategory).reduce((_categories, percentage) => ([
          ..._categories,
          observationProbabilityToVisCategory[percentage]
        ]), [])
      }
    };
  }

  private getGatheringCounts$(allTaxa = false): Observable<QueryResult> {
    return combineLatest([this.collections$, this.taxon$, this.year$]).pipe(
      tap(() => { this.loading = true; }),
      switchMap(([collections, taxon, year]) => this.warehouseApi.warehouseQueryAggregateGet(
        {
          collectionId: collections,
          taxonId: allTaxa ? undefined : taxon, ...this.mapQuery,
          yearMonth: (year === undefined || year === '') ? undefined : [year]
        },
        [
          'gathering.conversions.ykj10kmCenter.lat',
          'gathering.conversions.ykj10kmCenter.lon'
        ],
        undefined,
        10000
      )),
      tap(() => { this.loading = false; }),
    );
  }

  private gatheringCountFeatureStyle({ feature }: GetFeatureStyleOptions) {
    const { count } = feature.properties;

    let prevalence: GatheringCountType;

    if (count === 0) {
      prevalence = 'ZERO';
    } else if (count < 5) {
      prevalence = 'ONE';
    } else if (count < 10) {
      prevalence = 'FIVE';
    } else if (count < 50) {
      prevalence = 'TEN';
    } else if (count < 100) {
      prevalence = 'FIFTY';
    } else if (count < 500) {
      prevalence = 'HUNDRED';
    } else if (count >= 500) {
      prevalence = 'FIVE_HUNDRED';
    }

    return {
      color: gatheringCountToVisCategory[prevalence].color,
      weight: 1
    };
  }

  private gatheringCountsFromAllLocations(selectedTaxonGatheringCounts: QueryResult, allGatheringCounts: QueryResult): CountArray {
    const allLocations: CountMap = new Map();
    allGatheringCounts.results.forEach(result => {
      const { aggregateBy } = result;
      const { 'gathering.conversions.ykj10kmCenter.lat': lat, 'gathering.conversions.ykj10kmCenter.lon': lon } = aggregateBy;
      const key = `${lat},${lon}`;
      allLocations.set(key, { lat, lon, count: 0 });
    });

    const gatheringCounts: CountMap = new Map();
    selectedTaxonGatheringCounts.results.forEach(result => {
      const { aggregateBy, gatheringCount } = result;
      const { 'gathering.conversions.ykj10kmCenter.lat': lat, 'gathering.conversions.ykj10kmCenter.lon': lon } = aggregateBy;
      const key = `${lat},${lon}`;
      gatheringCounts.set(key, { lat, lon, count: gatheringCount });
    });

    const populatedMap: CountMap = new Map([...allLocations, ...gatheringCounts]);
    const counts: CountArray = Array.from(populatedMap.values());
    return counts;
  }

  private observationProbabilityFeatureStyle({ feature }: GetFeatureStyleOptions) {
    const { ratio } = feature.properties;

    let percentage: ObservationProbabilityType;

    if (ratio === 0) {
      percentage = 'ZERO';
    } else if (ratio < 0.2) {
      percentage = 'OVER_ZERO';
    } else if (ratio < 0.4) {
      percentage = 'OVER_TWENTY';
    } else if (ratio < 0.6) {
      percentage = 'OVER_FORTY';
    } else if (ratio < 0.8) {
      percentage = 'OVER_SIXTY';
    } else if (ratio < 1) {
      percentage = 'OVER_EIGHTY';
    } else if (ratio >= 1) {
      percentage = 'HUNDRED';
    }

    return {
      color: observationProbabilityToVisCategory[percentage].color,
      weight: 1
    };
  }

  private gatheringCountRatios(selectedTaxonGatheringCounts: QueryResult, allGatheringCounts: QueryResult): RatioArray {
    const countMap: CountMap = new Map();
    selectedTaxonGatheringCounts.results.forEach(result => {
      const { aggregateBy, gatheringCount } = result;
      const { 'gathering.conversions.ykj10kmCenter.lat': lat, 'gathering.conversions.ykj10kmCenter.lon': lon } = aggregateBy;
      const key = `${lat},${lon}`;
      countMap.set(key, { lat, lon, count: gatheringCount });
    });

    const ratioMap: RatioMap = new Map();
    allGatheringCounts.results.forEach(result => {
      const { aggregateBy, gatheringCount } = result;
      const { 'gathering.conversions.ykj10kmCenter.lat': lat, 'gathering.conversions.ykj10kmCenter.lon': lon } = aggregateBy;
      const key = `${lat},${lon}`;
      if (countMap.has(key)) {
        const { count } = countMap.get(key);
        const ratio = count / gatheringCount;
        ratioMap.set(key, { lat, lon, ratio });
      } else {
        ratioMap.set(key, { lat, lon, ratio: 0 });
      }
    });

    const ratios: RatioArray = Array.from(ratioMap.values());
    return ratios;
  }

  onVisualizationModeChange(mode: string) {
    this.visualizationMode = <ResultVisualizationMode>mode;
    if (this.visualizationMode === 'gatheringCount') {
      this.mapData$ = this.gatheringCountMapData$;
    } else if (this.visualizationMode === 'observationProbability') {
      this.mapData$ = this.observationProbabilityMapData$;
    }
  }

  onTaxonChange(taxon: string) {
    this.taxonChange.emit(taxon);
  }

  onYearChange(year: string) {
    this.yearChange.emit(year);
  }
}
