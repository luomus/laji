import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Observer } from 'rxjs/Observer';
import { PagedResult } from '../../../shared/model/PagedResult';
import { SourceService } from '../../../shared/service/source.service';
import { CollectionService } from '../../../shared/service/collection.service';
import { switchMap } from 'rxjs/operator/switchMap';
import { TranslateService } from '@ngx-translate/core';
import { IdService } from '../../../shared/service/id.service';

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
  private removeAggregateFields =  ['oldestRecord', 'newestRecord', 'count', 'individualCountMax', 'individualCountSum'];

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
    lang: string
  ): Observable<PagedResult<any>> {
    aggregateBy = aggregateBy.filter(val => this.removeAggregateFields.indexOf(val) === -1);
    const key = JSON.stringify(query) + [aggregateBy.join(','), orderBy.join(','), lang, page, pageSize].join(':');
    if (this.aggregateKey === key && this.aggregateData) {
      return Observable.of(this.aggregateData);
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
    this.aggregatePending = this.warehouseApi.warehouseQueryAggregateGet(
      query,
      [...aggregateBy],
      orderBy,
      pageSize,
      page,
      false,
      false
    )
      .retryWhen(errors => errors.delay(1000).take(3).concat(Observable.throw(errors)))
      .map(data => this.convertAggregateResult(data))
      .switchMap(data => this.openIds(data, aggregateBy, lang))
      .do(data => {
        this.aggregateData = data;
        this.aggregateKey = key;
      })
      .share();
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
    const key = JSON.stringify(query) + [selected.join(','), orderBy.join(','), lang, page, pageSize].join(':');
    if (this.key === key && this.data) {
      return Observable.of(this.data);
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
        query,
        [...selected, 'unit.unitId', 'document.documentId'],
        orderBy,
        pageSize,
        page
      )
      .retryWhen(errors => errors.delay(1000).take(3).concat(Observable.throw(errors)))
      .switchMap(data => this.openIds(data, selected, lang))
      .do(data => {
        this.data = data;
        this.key = key;
      })
      .share();
    return this.pending;
  }

  private convertAggregateResult(data) {
    data.results = data.results.map(result => {
      const aggregate = {
        count: result.count,
        individualCountSum: result.individualCountSum,
        individualCountMax: result.individualCountMax,
        oldestRecord: result.oldestRecord,
        newestRecord: result.newestRecord,
      };
      if (result.aggregateBy) {
        if (result.aggregateBy['unit.linkings.taxon.nameFinnish']) {
          result.aggregateBy['unit.linkings.taxon.vernacularName'] = {
            'fi': result.aggregateBy['unit.linkings.taxon.nameFinnish'],
            'en': result.aggregateBy['unit.linkings.taxon.nameEnglish'],
            'sv': result.aggregateBy['unit.linkings.taxon.nameSwedish']
          };
        }
      }
      Object.keys(result.aggregateBy).map(key => {
        this.stringToObj(key, result.aggregateBy[key], aggregate);
      });
      return aggregate;
    });
    return data;
  }

  private openIds(data, selected: string[], lang: string): Observable<any> {
    const allMappers = [];
    const uriCache = {};

    if (selected.indexOf('document.sourceId') > -1) {
      allMappers.push(this.sourceService.getAllAsLookUp(lang).map(sources => ({'document.sourceId': sources})));
    }
    if (selected.indexOf('document.collectionId') > -1) {
      allMappers.push(this.collectionService.getAllAsLookUp(lang)
        .map(collections => {
          const lookUp = {};
          collections.map(collection => lookUp[collection.id] = collection.value);
          return lookUp;
        })
        .map(collections => ({'document.collectionId': collections})));
    }

    const mappers$ = Observable.forkJoin(allMappers)
      .map(mappers => mappers.reduce((cumulative, current) => {
        return {...cumulative, ...current};
      }, {}));
    if (allMappers.length === 0) {
      return Observable.of(data);
    }
    return Observable.forkJoin(
      Observable.of(data),
      mappers$,
      (response, mappers) => {
        response.results = response.results.map(document => {
          if (document.document.sourceId && mappers['document.sourceId']) {
            if (!uriCache[document.document.sourceId]) {
              uriCache[document.document.sourceId] = IdService.getId(document.document.sourceId);
            }
            const qname = uriCache[document.document.sourceId];
            document.document.source = mappers['document.sourceId'][qname] ?
              mappers['document.sourceId'][qname] : document.document.sourceId;
          }
          if (document.document.collectionId && mappers['document.collectionId']) {
            if (!uriCache[document.document.collectionId]) {
              uriCache[document.document.collectionId] = IdService.getId(document.document.collectionId);
            }
            const qname = uriCache[document.document.collectionId];
            document.document.collection = mappers['document.collectionId'][qname] ?
              mappers['document.collectionId'][qname] : document.document.collectionId;
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
