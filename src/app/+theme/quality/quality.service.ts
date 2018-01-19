import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class QualityService {

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

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
          const user = row.aggregateBy['unit.annotations.annotationByPerson'] || '';
          row.userId = user.substring(user.lastIndexOf('/') + 1);
          return row;
        });
      });
  }

  private _fetch(request): Observable<any> {
    return request;
  }
}
