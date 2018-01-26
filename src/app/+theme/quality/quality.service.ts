import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class QualityService {

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

  getAnnotationList(page = 1, pageSize = 50): Observable<any> {
    const query: WarehouseQueryInterface = {};
    query.annotationType = ['TAXON_RELIABILITY', 'IDENTIFICATION', 'UNIDENTIFIABLE', 'COMMENT'];

    return this._fetch(this.warehouseApi.warehouseQueryAnnotationListGet(
      query,
      ['annotation', 'unit.media', 'document.documentId', 'unit.unitId', 'gathering.team', 'unit.taxonVerbatim',
       'unit.linkings.taxon', 'unit.reportedInformalTaxonGroup'],
      undefined,
      pageSize,
      page
    ))
  }

  getMostActiveUsers(maxLength = 50, lastDate = undefined): Observable<any> {
    const query: WarehouseQueryInterface = {};
    query.annotationType = ['TAXON_RELIABILITY', 'IDENTIFICATION', 'UNIDENTIFIABLE'];
    if (lastDate) {
      query.annotatedLaterThan = lastDate;
    }

    return this._fetch(this.warehouseApi.warehouseQueryAggregateGet(
      query,
      ['unit.annotations.annotationByPerson'],
      undefined,
      maxLength,
      1,
      false,
      false
    ))
      .map(data => data.results)
      .map(data => {
        return data.map(row => {
          row.userId = row.aggregateBy['unit.annotations.annotationByPerson'] || '';
          return row;
        });
      });
  }

  private _fetch(request): Observable<any> {
    return request;
  }
}
