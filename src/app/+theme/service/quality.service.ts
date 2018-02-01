import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

@Injectable()
export class QualityService {
  private cache = {};
  private pending = {};

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

  getAnnotationList(page = 1, pageSize = 50, orderBy?, informalTaxonGroup?, timeStart?, timeEnd?): Observable<any> {
    const query: WarehouseQueryInterface = {};
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

    return this._fetch('annotationList,query=' + JSON.stringify(query),
      this.warehouseApi.warehouseQueryAnnotationListGet(
        query,
        ['annotation', 'unit.media', 'document.documentId', 'unit.unitId', 'gathering.team', 'unit.taxonVerbatim',
        'unit.linkings.originalTaxon', 'unit.reportedInformalTaxonGroup'],
        orderBy,
        pageSize,
        page
    ))
  }

  getMostActiveUsers(maxLength = 50, lastDate?): Observable<any> {
    const query: WarehouseQueryInterface = {};
    query.annotationType = ['TAXON_RELIABILITY', 'IDENTIFICATION', 'UNIDENTIFIABLE'];
    if (lastDate) {
      query.annotatedLaterThan = lastDate;
    }

    return this._fetch('activeUsers,query=' + JSON.stringify(query),
      this.warehouseApi.warehouseQueryAggregateGet(
        query,
        ['unit.annotations.annotationByPerson', 'unit.annotations.annotationByPersonName'],
        undefined,
        maxLength,
        1,
        false,
        false
    ))
      .map(data => data.results)
      .map(data => {
        return data.map(row => {
          row.userId = row.aggregateBy['unit.annotations.annotationByPersonName'] || '';
          return row;
        });
      });
  }

  private _fetch(cacheKey, request): Observable<any> {
    return request;
    /*if (this.cache[cacheKey]) {
      return Observable.of(this.cache[cacheKey]);
    } else if (this.pending[cacheKey]) {
      return Observable.create((observer: Observer<any>) => {
        const onComplete = (res: any) => {
          observer.next(res);
          observer.complete();
        };
        this.pending[cacheKey].subscribe(
          (data) => { onComplete(data); }
        );
      });
    }

    this.pending[cacheKey]    = request
      .do(data => {
        this.cache[cacheKey] = data;
      });
    return this.pending[cacheKey];*/
  }
}
