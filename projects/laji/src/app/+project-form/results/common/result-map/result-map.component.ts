import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataOptions, GetFeatureStyleOptions, Options } from '@luomus/laji-map';
import { TranslateService } from '@ngx-translate/core';
import { convertYkjToGeoJsonFeature } from 'projects/laji/src/app/root/coordinate-utils';
import { getPointIconAsCircle } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.component';
import { LajiMapVisualization } from 'projects/laji/src/app/shared-modules/legend/laji-map-visualization';
import { WarehouseApi } from 'projects/laji/src/app/shared/api/WarehouseApi';
import { WarehouseQueryInterface } from 'projects/laji/src/app/shared/model/WarehouseQueryInterface';
import { toHtmlSelectElement } from 'projects/laji/src/app/shared/service/html-element.service';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

type PrevalenceType = 'ONE' | 'FIVE' | 'TEN' | 'FIFTY' | 'HUNDRED' | 'FIVE_HUNDRED';

interface QueryResult {
  results: {
    aggregateBy: {
      'gathering.conversions.ykj10kmCenter.lat': string;
      'gathering.conversions.ykj10kmCenter.lon': string;
    };
    gatheringCount: number;
  }[];
}

const prevalenceToVisCategory: Record<PrevalenceType, { color: string; label: string }> = {
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
  @Input() mapQuery: WarehouseQueryInterface;

  @Output() taxonChange = new EventEmitter<string>();

  toHtmlSelectElement = toHtmlSelectElement;

  mapData$: Observable<DataOptions>;
  defaultTaxon: string;
  mapOptions: Options;
  loading = true;

  visualization: LajiMapVisualization<'completeListPrevalence'> = {
    completeListPrevalence: {
      label: 'biomon.stats.map.legend.title',
      categories: Object.keys(prevalenceToVisCategory).reduce((_categories, prevalence) => ([
        ..._categories,
        prevalenceToVisCategory[prevalence]
      ]), [])
    }
  };

  constructor(
    private warehouseApi: WarehouseApi,
    private translate: TranslateService
  ) {
    this.mapOptions = {
      clickBeforeZoomAndPan: true
    };
  }

  ngOnInit(): void {
    this.defaultTaxon = this.taxon$.getValue();

    const query$ = combineLatest([this.collections$, this.taxon$]).pipe(
      switchMap(([collections, taxon]) => this.warehouseApi.warehouseQueryAggregateGet(
        {
          collectionId: collections, taxonId: taxon, ...this.mapQuery
        },
        [
          'gathering.conversions.ykj10kmCenter.lat',
          'gathering.conversions.ykj10kmCenter.lon'
        ],
        undefined,
        10000
      ))
    );

    this.mapData$ = query$.pipe(
      tap(() => { this.loading = true; }),
      map((response: QueryResult) => ({
        ...this.getDataOptions(),
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

  private getDataOptions(): Omit<DataOptions, 'featureCollection'> {
    return {
      label: this.translate.instant('biomon.stats.map.dataLayerLabel'),
      marker: {
        icon: getPointIconAsCircle
      },
      getFeatureStyle: this.getFeatureStyle
    };
  }

  private getFeatureStyle({ feature }: GetFeatureStyleOptions) {
    const { gatheringCount } = feature.properties;

    let prevalence: PrevalenceType;

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
      color: prevalenceToVisCategory[prevalence].color
    };
  }

  onTaxonChange(taxon: string) {
    this.taxonChange.emit(taxon);
  }
}
