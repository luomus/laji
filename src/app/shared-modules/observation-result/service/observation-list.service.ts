import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Observer } from 'rxjs/Observer';
import { PagedResult } from '../../../shared/model/PagedResult';
import { SourceService } from '../../../shared/service/source.service';
import { CollectionService } from '../../../shared/service/collection.service';
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
  private locationCache: any;

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
    aggregateBy = this.prepareFields(aggregateBy).filter(val => this.removeAggregateFields.indexOf(val) === -1);
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
      .switchMap(data => this.openValues(data, aggregateBy, lang))
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
    selected = this.prepareFields(selected);
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
      .switchMap(data => this.openValues(data, selected, lang))
      .do(data => {
        this.data = data;
        this.key = key;
      })
      .share();
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
    this.locationCache = {};
    const openYkj = selected.indexOf('gathering.conversions.ykj') > -1;
    const openEuref = selected.indexOf('gathering.conversions.euref') > -1;
    const openWgs84 = selected.indexOf('gathering.conversions.wgs84') > -1;

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

    const mappers$ = allMappers.length === 0 ? Observable.of({}) : Observable.forkJoin(allMappers)
      .map(mappers => mappers.reduce((cumulative, current) => {
        return {...cumulative, ...current};
      }, {}));

    return Observable.forkJoin(
      Observable.of(data),
      mappers$,
      (response, mappers) => {
        response.results = response.results.map(document => {
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

          if (openYkj && document.gathering.conversions && document.gathering.conversions.ykj) {
            document.gathering.conversions.ykj.verbatim = this.makeMinMaxYkj(document.gathering.conversions.ykj);
          }
          if (openEuref && document.gathering.conversions && document.gathering.conversions.euref) {
            document.gathering.conversions.euref.verbatim = this.makeMinMaxCoordinate(document.gathering.conversions.euref);
          }
          if (openWgs84 && document.gathering.conversions && document.gathering.conversions.wgs84) {
            document.gathering.conversions.wgs84.verbatim = this.makeMinMaxCoordinate(document.gathering.conversions.wgs84);
          }

          return document;
        });
        return data;
      }
    );
  }

  private makeMinMaxCoordinate(value) {
    if (value.latMax && value.latMin && value.lonMax && value.lonMin) {
      const lat = value.latMax === value.latMin ? value.latMax : value.latMin + '-' + value.latMax;
      const lon = value.lonMax === value.lonMin ? value.lonMax : value.lonMin + '-' + value.lonMax;
      return `${lat} ${lon}`;
    }
    return '';
  }

  private makeMinMaxYkj(value) {
    if (value.latMin) {
      const lat = this.getYkjCoord(value.latMin, value.latMax);
      return lat + ':' + this.getYkjCoord(value.lonMin, value.lonMax, lat.split('-')[0].length);
    }
    return '';
  }

  private getYkjCoord(min, max, minLen = 3) {
    const key = min + ':' + max;
    if (!this.locationCache[key]) {
      let tmpMin = ('' + min).replace(/[0]*$/, '');
      let tmpMax = ('' + max).replace(/[0]*$/, '');
      const targetLen = Math.max(tmpMin.length, tmpMax.length, minLen);
      tmpMin = tmpMin + '0000000'.substr(tmpMin.length, (targetLen - tmpMin.length));
      tmpMax = '' + (+(tmpMax + '0000000'.substr(tmpMax.length, (targetLen - tmpMax.length))) - 1);
      this.locationCache[key] = tmpMin === tmpMax ? tmpMin : tmpMin + '-' + tmpMax;
    }
    return this.locationCache[key];
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
