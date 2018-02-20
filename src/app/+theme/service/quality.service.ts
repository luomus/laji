import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

@Injectable()
export class QualityService {
  private state = {
    annotations: {
      key: '',
      data: [],
      pending: undefined,
      pendingKey: ''
    },
    users: {
      key: '',
      data: [],
      pending: undefined,
      pendingKey: ''
    }
  };

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

  getAnnotationList(page = 1, pageSize = 50, orderBy?, informalTaxonGroup?, timeStart?, timeEnd?): Observable<any> {
    const query: WarehouseQueryInterface = {cache: true};
    query.annotationType = ['TAXON_RELIABILITY', 'IDENTIFICATION', 'UNIDENTIFIABLE', 'COMMENT'];
    if (informalTaxonGroup) {
      query.informalTaxonGroupId = informalTaxonGroup;
    }
    if (timeStart) {
      query.annotatedLaterThan = timeStart;
    }
    if (timeEnd) {
      query.annotatedBefore = timeEnd;
    }

    const cacheKey = JSON.stringify({page, pageSize, orderBy, informalTaxonGroup, timeStart, timeEnd});

    return this._fetch('annotations', cacheKey,
      this.warehouseApi.warehouseQueryAnnotationListGet(
        query,
        ['annotation', 'unit.media', 'document.documentId', 'unit.unitId', 'gathering.team', 'unit.taxonVerbatim',
        'unit.linkings.originalTaxon', 'unit.reportedInformalTaxonGroup'],
        orderBy,
        pageSize,
        page
    ))
  }

  getMostActiveUsers(maxLength = 50, informalTaxonGroup?, lastDate?): Observable<any> {
    const query: WarehouseQueryInterface = {cache: true};
    query.annotationType = ['TAXON_RELIABILITY', 'IDENTIFICATION', 'UNIDENTIFIABLE'];
    if (informalTaxonGroup) {
      query.informalTaxonGroupId = informalTaxonGroup;
    }
    if (lastDate) {
      query.annotatedLaterThan = lastDate;
    }

    const cacheKey = JSON.stringify({maxLength, informalTaxonGroup, lastDate});

    return this._fetch('users', cacheKey,
      this.warehouseApi.warehouseQueryAggregateGet(
        query,
        ['unit.annotations.annotationByPerson', 'unit.annotations.annotationByPersonName'],
        undefined,
        maxLength,
        1,
        false,
        true
    ))
      .map(data => data.results)
      .map(data => {
        return data.map(row => {
          row.userId = row.aggregateBy['unit.annotations.annotationByPersonName'] || '';
          return row;
        });
      });
  }

  private _fetch(type: 'annotations'|'users', cacheKey: string, request): Observable<any> {
    if (this.state[type].key === cacheKey) {
      return Observable.of(this.state[type].data);
    } else if (this.state[type].pendingKey === cacheKey && this.state[type].pending) {
      return Observable.create((observer: Observer<any>) => {
        const onComplete = (res: any) => {
          observer.next(res);
          observer.complete();
        };
        this.state[type].pending.subscribe(
          (data) => { onComplete(data); }
        );
      });
    }
    this.state[type].pendingKey = cacheKey;
    this.state[type].pending    = request
      .do(data => {
        this.state[type].data = data;
        this.state[type].key  = cacheKey;
      });
    return this.state[type].pending ;
  }
}
