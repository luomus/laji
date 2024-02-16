import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataOptions, GetFeatureStyleOptions } from '@luomus/laji-map';
import { TranslateService } from '@ngx-translate/core';
import { getPointIconAsCircle } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.component';
import { WarehouseApi } from 'projects/laji/src/app/shared/api/WarehouseApi';
import { convertYkjToGeoJsonFeature } from 'projects/laji/src/app/root/coordinate-utils';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { LajiMapVisualization } from 'projects/laji/src/app/shared-modules/legend/laji-map-visualization';
import { TaxonomyApi } from 'projects/laji/src/app/shared/api/TaxonomyApi';
import { CollectionApi } from 'projects/laji/src/app/shared/api/CollectionApi';
import { FormService } from 'projects/laji/src/app/shared/service/form.service';
import { CompleteListPrevalence } from '../complete-lists-result.component';

interface QueryResult {
  results: {
    aggregateBy: {
      'gathering.conversions.ykj10kmCenter.lat': string;
      'gathering.conversions.ykj10kmCenter.lon': string;
    };
    gatheringCount: number;
  }[];
}

const prevalenceToVisCategory: Record<CompleteListPrevalence, { color: string; label: string }> = {
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
  selector: 'laji-complete-lists-result-map',
  templateUrl: './complete-lists-result-map.component.html',
  styleUrls: ['./complete-lists-result-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompleteListsResultMapComponent implements OnInit {

  readonly collection$ = new BehaviorSubject<string>('');
  readonly taxon$ = new BehaviorSubject<string>('');
  @Input() set collection(v: string) { this.collection$.next(v); };
  @Input() set taxon(v: string) { this.taxon$.next(v); };

  @Output() collectionChange = new EventEmitter<string>();
  @Output() taxonChange = new EventEmitter<string>();

  mapData$: Observable<DataOptions>;
  collectionOptions$: Observable<Array<any>>;
  taxonOptions$: Observable<Array<any>>;
  defaultCollection: string;
  taxonSetLookup: Array<{ collectionID: string; taxonSet: Array<string> }>;
  parentCollectionID = 'HR.5615';
  loading = true;
  taxonLoading = true;

  visualization: LajiMapVisualization<'completeListPrevalence'> = {
    completeListPrevalence: {
      label: 'completeLists.stats.map.legend.title',
      categories: Object.keys(prevalenceToVisCategory).reduce((_categories, prevalence) => ([
        ..._categories,
        prevalenceToVisCategory[prevalence]
      ]), [])
    }
  };

  constructor(
    private warehouseApi: WarehouseApi,
    private collectionApi: CollectionApi,
    private formApi: FormService,
    private taxonApi: TaxonomyApi,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.defaultCollection = this.collection$.getValue();

    const query$ = combineLatest([this.collection$, this.taxon$]).pipe(switchMap(([collection, taxon]) => this.warehouseApi.warehouseQueryAggregateGet(
      {
        collectionId: [collection], taxonId: taxon, completeListType: ['MY.completeListTypeCompleteWithBreedingStatus,MY.completeListTypeComplete'],
        gatheringCounts: true, cache: true, countryId: ['ML.206']
      },
      [
        'gathering.conversions.ykj10kmCenter.lat',
        'gathering.conversions.ykj10kmCenter.lon'
      ],
      undefined,
      10000
    )));

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

    this.collectionOptions$ = this.collectionApi.findChildren(
        this.parentCollectionID,
        this.translate.currentLang,
        undefined,
        '10000'
      ).pipe(
      map(res => res.results),
      map(collections => collections.map(c => ({ label: c.collectionName, value: c.id })))
    );

    this.taxonOptions$ = this.formApi.getAllForms(
      this.translate.currentLang
    ).pipe(
      map(forms =>
        forms
          .filter(f => (f.collectionID !== undefined && f.options.prepopulateWithTaxonSets !== undefined))
          .map(f => ({ collectionID: f.collectionID, taxonSet: f.options.prepopulateWithTaxonSets }))
      ),
      switchMap(pairs => {
        this.taxonSetLookup = pairs;
        const taxonSet = pairs.find(p => p.collectionID === this.collection$.getValue()).taxonSet;
        return this.getTaxaObservable$(taxonSet);
      })
    );
  }

  getDataOptions(): Omit<DataOptions, 'featureCollection'> {
    return {
      label: this.translate.instant('completeLists.stats.map.dataLayerLabel'),
      marker: {
        icon: getPointIconAsCircle
      },
      getFeatureStyle: this.getFeatureStyle
    };
  }

  getFeatureStyle({ feature }: GetFeatureStyleOptions) {
    const { gatheringCount } = feature.properties;

    let prevalence: CompleteListPrevalence;

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

  getTaxaObservable$(taxonSet: string[]): Observable<any> {
    this.taxonLoading = true;
    return this.taxonApi.taxonomyList(
      this.translate.currentLang,
      {
        selectedFields: 'id,vernacularName,scientificName',
        taxonSets: taxonSet
      }
    ).pipe(
      map(res => res.results),
      map(taxa => taxa.map(t => ({
        label: (t.vernacularName ? t.vernacularName + ' - ' : '') + (t.scientificName ? t.scientificName : ''),
        value: t.id
      }))),
      map(pairs => [{ label: '', value: '' }].concat(pairs)),
      finalize(() => { this.taxonLoading = false; })
    );
  }

  onCollectionChange(collection: string) {
    this.collectionChange.emit(collection);
    this.collection$.next(collection);
    const taxonSet = this.taxonSetLookup.find(pair => pair.collectionID === this.collection$.getValue()).taxonSet;
    this.taxonOptions$ = this.getTaxaObservable$(taxonSet);
  }

  onTaxonChange(taxon: string) {
    this.taxonChange.emit(taxon);
  }
}
