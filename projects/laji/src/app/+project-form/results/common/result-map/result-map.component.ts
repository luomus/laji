import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataOptions, GetFeatureStyleOptions, Options } from '@luomus/laji-map';
import { convertYkjToGeoJsonFeature } from 'projects/laji/src/app/root/coordinate-utils';
import { getPointIconAsCircle } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.component';
import { LajiMapVisualization } from 'projects/laji/src/app/shared-modules/legend/laji-map-visualization';
import { WarehouseApi } from 'projects/laji/src/app/shared/api/WarehouseApi';
import { WarehouseQueryInterface } from 'projects/laji/src/app/shared/model/WarehouseQueryInterface';
import { toHtmlSelectElement } from 'projects/laji/src/app/shared/service/html-element.service';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

type GatheringCountType = 'ONE' | 'FIVE' | 'TEN' | 'FIFTY' | 'HUNDRED' | 'FIVE_HUNDRED';
type ObservationProbabilityType = 'ZERO' | 'OVER_ZERO' | 'OVER_TWENTY' | 'OVER_FORTY' | 'OVER_SIXTY' | 'OVER_EIGHTY' | 'HUNDRED';

type ResultVisualizationMode = 'gatheringCount' | 'observationProbability';

type CountMap = Map<string, {lat: string; lon: string; count: number}>;
type RatioMap = Map<string, {lat: string; lon: string; ratio: number}>;
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
  },
};

const observationProbabilityToVisCategory: Record<ObservationProbabilityType, { color: string; label: string }> = {
  ZERO: {
    color: '#E6E6E6',
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
  },
};

@Component({
  selector: 'laji-result-map',
  templateUrl: './result-map.component.html',
  styleUrls: ['./result-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultMapComponent implements OnInit {
  readonly collections$ = new BehaviorSubject<string[]>([]);
  readonly taxon$ = new BehaviorSubject<string>('');
  @Input() set collections(v: string[]) { this.collections$.next(v); };
  @Input() set taxon(v: string) { this.taxon$.next(v); };
  @Input() taxonOptions$: Observable<{ label: string; value: string }[]>;
  @Input() visualizationOptions: ResultVisualizationMode[];
  @Input() mapQuery: WarehouseQueryInterface;
  @Input() gatheringCountLabel: string;

  @Output() taxonChange = new EventEmitter<string>();

  toHtmlSelectElement = toHtmlSelectElement;

  mapData$: Observable<DataOptions>;
  mapOptions: Options;
  visualization: LajiMapVisualization<ResultVisualizationMode>;
  visualizationMode: ResultVisualizationMode = 'gatheringCount';
  defaultTaxon: string;
  loading = true;

  constructor(
    private warehouseApi: WarehouseApi
  ) {
    this.mapOptions = {
      clickBeforeZoomAndPan: true
    };
  }

  ngOnInit(): void {
    this.defaultTaxon = this.taxon$.getValue();
    this.mapData$ = this.gatheringCountMapData$();

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
    return combineLatest([this.collections$, this.taxon$]).pipe(
      switchMap(([collections, taxon]) => this.warehouseApi.warehouseQueryAggregateGet(
        {
          collectionId: collections, taxonId: allTaxa ? '' : taxon, ...this.mapQuery
        },
        [
          'gathering.conversions.ykj10kmCenter.lat',
          'gathering.conversions.ykj10kmCenter.lon'
        ],
        undefined,
        10000
      ))
    );
  }

  private gatheringCountMapData$(): Observable<DataOptions> {
    return this.getGatheringCounts$().pipe(
      tap(() => { this.loading = true; }),
      map((response: QueryResult) => ({
        marker: {
          icon: getPointIconAsCircle
        },
        getFeatureStyle: this.gatheringCountFeatureStyle,
        featureCollection: {
          type: 'FeatureCollection' as const,
          features: response.results.reduce((_features, item) => {
            _features.push(
              convertYkjToGeoJsonFeature(
                +item.aggregateBy['gathering.conversions.ykj10kmCenter.lat'],
                +item.aggregateBy['gathering.conversions.ykj10kmCenter.lon'],
                { gatheringCount: item.gatheringCount }
              )
            );
            return _features;
          }, [])
        }
      })),
      tap(() => { this.loading = false; })
    );
  }

  private gatheringCountFeatureStyle({ feature }: GetFeatureStyleOptions) {
    const { gatheringCount } = feature.properties;

    let prevalence: GatheringCountType;

    if (gatheringCount >= 1 && gatheringCount < 5) {
      prevalence = 'ONE';
    } else if (gatheringCount >= 5 && gatheringCount < 10) {
      prevalence = 'FIVE';
    } else if (gatheringCount >= 10 && gatheringCount < 50) {
      prevalence = 'TEN';
    } else if (gatheringCount >= 50 && gatheringCount < 100) {
      prevalence = 'FIFTY';
    } else if (gatheringCount >= 100 && gatheringCount < 500) {
      prevalence = 'HUNDRED';
    } else if (gatheringCount >= 500) {
      prevalence = 'FIVE_HUNDRED';
    }

    return {
      color: gatheringCountToVisCategory[prevalence].color
    };
  }

  private observationProbabilityMapData(): Observable<DataOptions> {
    return combineLatest([this.getGatheringCounts$(), this.getGatheringCounts$(true)]).pipe(
      tap(() => { this.loading = true; }),
      map(([query1, query2]) => ({
        marker: {
          icon: getPointIconAsCircle
        },
        getFeatureStyle: this.observationProbabilityFeatureStyle,
        featureCollection: {
          type: 'FeatureCollection' as const,
          features: this.gatheringCountRatios(query1, query2).reduce((_features, item) => {
            _features.push(
              convertYkjToGeoJsonFeature(
                +item.lat,
                +item.lon,
                { ratio: item.ratio }
              )
            );
            return _features;
          }, [])
        }
      })),
      tap(() => { this.loading = false; })
    );
  }

  private observationProbabilityFeatureStyle({ feature }: GetFeatureStyleOptions) {
    const { ratio } = feature.properties;

    let percentage: ObservationProbabilityType;

    if (ratio === 0) {
      percentage = 'ZERO';
    } else if (ratio > 0 && ratio < 0.2) {
      percentage = 'OVER_ZERO';
    } else if (ratio >= 0.2 && ratio < 0.4) {
      percentage = 'OVER_TWENTY';
    } else if (ratio >= 0.4 && ratio < 0.6) {
      percentage = 'OVER_FORTY';
    } else if (ratio >= 0.6 && ratio < 0.8) {
      percentage = 'OVER_SIXTY';
    } else if (ratio >= 0.8 && ratio < 1) {
      percentage = 'OVER_EIGHTY';
    } else if (ratio >= 1) {
      percentage = 'HUNDRED';
    }

    return {
      color: observationProbabilityToVisCategory[percentage].color
    };
  }

  private gatheringCountRatios(query1: QueryResult, query2: QueryResult): RatioArray {
    const countMap: CountMap = new Map();
    const ratioMap: RatioMap = new Map();

    // Populate countMap with query1 locations and counts
    query1.results.forEach(result => {
      const { aggregateBy, gatheringCount } = result;
      const { 'gathering.conversions.ykj10kmCenter.lat': lat, 'gathering.conversions.ykj10kmCenter.lon': lon } = aggregateBy;
      const key = `${lat},${lon}`;
      countMap.set(key, { lat, lon, count: gatheringCount });
    });

    // Populate ratioMap with query2 locations and calculate query1/query2 gatheringCount ratio
    query2.results.forEach(result => {
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
      this.mapData$ = this.gatheringCountMapData$();
    } else if (this.visualizationMode === 'observationProbability') {
      this.mapData$ = this.observationProbabilityMapData();
    }
  }

  onTaxonChange(taxon: string) {
    this.taxonChange.emit(taxon);
  }
}