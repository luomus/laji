
import {share, tap, switchMap, concat, take, delay, retryWhen, map} from 'rxjs/operators';
import { forkJoin as ObservableForkJoin, Observable, Observer, of as ObservableOf, throwError as observableThrowError } from 'rxjs';
import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { PagedResult } from '../../../shared/model/PagedResult';
import { SourceService } from '../../../shared/service/source.service';
import { CollectionService } from '../../../shared/service/collection.service';
import { IdService } from '../../../shared/service/id.service';
import { Util } from '../../../shared/service/util.service';
import { CoordinatePipe } from '../../../shared/pipe/coordinate.pipe';



@Injectable()
export class ObservationListService {

  private key: string;
  private data: PagedResult<any>;
  private pending: Observable<any>;
  private pendingKey: string;

  private aggregateKey: string;
  private aggregateData: PagedResult<any>;
  private aggregatePending: Observable<any>;
  private aggregatePendingKey: string;
  private removeAggregateFields =  ['oldestRecord', 'newestRecord', 'count', 'individualCountMax', 'individualCountSum', 'pairCount'];
  private coordinatePipe = new CoordinatePipe();

  constructor(
    private warehouseApi: WarehouseApi,
    private sourceService: SourceService,
    private collectionService: CollectionService
  ) { }

  getAggregate(
    query: WarehouseQueryInterface,
    aggregateBy: string[],
    page: number,
    pageSize: number,
    orderBy: string[] = [],
    lang: string,
    useStatistics: boolean = false
  ): Observable<PagedResult<any>> {
    aggregateBy = this.prepareFields(aggregateBy).filter(val => this.removeAggregateFields.indexOf(val) === -1);
    const key = JSON.stringify(query) + [aggregateBy.join(','), orderBy.join(','), lang, page, pageSize].join(':');
    if (this.aggregateKey === key && this.aggregateData) {
      return ObservableOf(this.aggregateData);
    } else if (this.aggregatePendingKey === key && this.aggregatePending) {
      return Observable.create((observer: Observer<any>) => {
        const onComplete = (res: any) => {
          observer.next(res);
          observer.complete();
        };
        this.aggregatePending.subscribe(
          (data) => { onComplete(data); }
        );
      });
    }
    this.aggregatePendingKey = key;
    const method = useStatistics
      ? this.warehouseApi.warehouseQueryStatisticsGet
      : this.warehouseApi.warehouseQueryAggregateGet;

    this.aggregatePending = method(
      {...query, cache: (query.cache || WarehouseApi.isEmptyQuery(query))},
      [...aggregateBy],
      orderBy,
      pageSize,
      page,
      false,
      false
    ).pipe(
      retryWhen(errors => errors.pipe(delay(1000), take(3), concat(observableThrowError(errors)), ))).pipe(
      map(data => Util.clone(data)),
      map(data => this.convertAggregateResult(data))).pipe(
      switchMap(data => this.openValues(data, aggregateBy, lang)),
      tap(data => {
        this.aggregateData = data;
        this.aggregateKey = key;
      }),
      share(), );
    return this.aggregatePending;
  }

  getList(
    query: WarehouseQueryInterface,
    selected: string[],
    page: number,
    pageSize: number,
    orderBy: string[] = [],
    lang: string
  ): Observable<PagedResult<any>> {
    selected = this.prepareFields(selected);
    const key = JSON.stringify(query) + [selected.join(','), orderBy.join(','), lang, page, pageSize].join(':');
    if (this.key === key && this.data) {
      return ObservableOf(this.data);
    } else if (this.pendingKey === key && this.pending) {
      return Observable.create((observer: Observer<any>) => {
        const onComplete = (res: any) => {
          observer.next(res);
          observer.complete();
        };
        this.pending.subscribe(
          (data) => { onComplete(data); }
        );
      });
    }
    this.pendingKey = key;
    this.pending = this.warehouseApi.warehouseQueryListGet(
      {...query, cache: (query.cache || WarehouseApi.isEmptyQuery(query))},
      [...selected, 'unit.unitId', 'document.documentId'],
      orderBy,
      pageSize,
      page
    ).pipe(
      retryWhen(errors => errors.pipe(delay(1000), take(3), concat(observableThrowError(errors)), ))).pipe(
      map(data => Util.clone(data))).pipe(
      switchMap(data => this.openValues(data, selected, lang)),
      tap(data => {
        this.data = data;
        this.key = key;
      }),
      share(), );
    return this.pending;
  }

  private prepareFields(select: string[]): string[] {
    const exist = {};
    return select.join(',').split(',').filter((val) => {
      if (exist[val]) {
        return false;
      }
      exist[val] = true;
      return true;
    });
  }

  private convertAggregateResult(data) {
    data.results = data.results.map(result => {
      const aggregate = {
        count: result.count,
        individualCountSum: result.individualCountSum,
        individualCountMax: result.individualCountMax,
        oldestRecord: result.oldestRecord,
        newestRecord: result.newestRecord,
        pairCountSum: result.pairCountSum,
      };
      if (result.aggregateBy) {
        if (result.aggregateBy['unit.linkings.taxon.nameFinnish']) {
          result.aggregateBy['unit.linkings.taxon.vernacularName'] = {
            'fi': result.aggregateBy['unit.linkings.taxon.nameFinnish'],
            'en': result.aggregateBy['unit.linkings.taxon.nameEnglish'],
            'sv': result.aggregateBy['unit.linkings.taxon.nameSwedish']
          };
        }
        if (result.aggregateBy['unit.linkings.taxon.speciesNameFinnish']) {
          result.aggregateBy['unit.linkings.taxon.speciesVernacularName'] = {
            'fi': result.aggregateBy['unit.linkings.taxon.speciesNameFinnish'],
            'en': result.aggregateBy['unit.linkings.taxon.speciesNameEnglish'],
            'sv': result.aggregateBy['unit.linkings.taxon.speciesNameSwedish']
          };
        }
        Object.keys(result.aggregateBy).map(key => {
          this.stringToObj(key, result.aggregateBy[key], aggregate);
        });
      }
      return aggregate;
    });
    return data;
  }

  private openValues(data, selected: string[], lang: string): Observable<any> {
    const allMappers = [];
    const uriCache = {};

    if (selected.indexOf('document.sourceId') > -1) {
      allMappers.push(this.sourceService.getAllAsLookUp(lang).pipe(map(sources => ({'document.sourceId': sources}))));
    }
    if (selected.indexOf('document.collectionId') > -1) {
      allMappers.push(this.collectionService.getAllAsLookUp(lang).pipe(
        map(collections => {
          const lookUp = {};
          collections.map(collection => lookUp[collection.id] = collection.value);
          return lookUp;
        }),
        map(collections => ({'document.collectionId': collections})), ));
    }

    const mappers$ = allMappers.length === 0 ? ObservableOf({}) : ObservableForkJoin(allMappers).pipe(
      map(mappers => mappers.reduce((cumulative, current) => {
        return {...cumulative, ...current};
      }, {})));

    return ObservableForkJoin(
      ObservableOf(data),
      mappers$,
      (response, mappers) => {
        response.results = response.results.map(document => {
          if (document.document) {
            if (mappers['document.sourceId'] && document.document.sourceId) {
              if (!uriCache[document.document.sourceId]) {
                uriCache[document.document.sourceId] = IdService.getId(document.document.sourceId);
              }
              const qname = uriCache[document.document.sourceId];
              document.document.source = mappers['document.sourceId'][qname] ?
                mappers['document.sourceId'][qname] : document.document.sourceId;
            }
            if (mappers['document.collectionId'] && document.document.collectionId) {
              if (!uriCache[document.document.collectionId]) {
                uriCache[document.document.collectionId] = IdService.getId(document.document.collectionId);
              }
              const qname = uriCache[document.document.collectionId];
              document.document.collection = mappers['document.collectionId'][qname] ?
                mappers['document.collectionId'][qname] : document.document.collectionId;
            }
          }

          if (document.gathering && document.gathering.conversions) {
            ['ykj', 'euref', 'wgs84', 'ykj10km', 'ykj10kmCenter', 'ykj1km', 'ykj1kmCenter'].forEach(type => {
              if (selected.indexOf(`gathering.conversions.${type}`) && document.gathering.conversions[type]) {
                document.gathering.conversions[type].verbatim =
                  this.coordinatePipe.transform(document.gathering.conversions[type], type);
              }
            });
          }

          return document;
        });
        return data;
      }
    );
  }

  private stringToObj(path, value, obj) {
    const parts = path.split('.');
    let part;
    while (part = parts.shift()) {
      if (typeof obj[part] !== 'object') {
        obj[part] = {};
      }
      if (parts.length === 0) {
        obj[part] = value;
      }
      obj = obj[part];
    }
  }


}
