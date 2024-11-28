import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Observable, Observer, of as ObservableOf } from 'rxjs';

interface SubState {
  key: string;
  data: any[];
  pending: Observable<any> | undefined;
  pendingKey: string;
}

interface State {
  annotations: SubState;
  users: SubState;
}

@Injectable()
export class QualityService {
  private state: State = {
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

  getAnnotationList(page = 1, pageSize = 50, orderBy?: string[], informalTaxonGroup?: string, timeStart?: string, timeEnd?: string): Observable<any> {
    const query: WarehouseQueryInterface = {cache: true};
    query.annotationType = ['USER_EFFECTIVE', 'COMMENT'];
    if (informalTaxonGroup) {
      query.informalTaxonGroupId = <string[]><unknown>informalTaxonGroup;
    }
    if (timeStart) {
      query.annotatedSameOrAfter = timeStart;
    }
    if (timeEnd) {
      query.annotatedSameOrBefore = timeEnd;
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
    ));
  }

  getMostActiveUsers(maxLength = 50, informalTaxonGroup?: string[], lastDate?: string): Observable<any> {
    const query: WarehouseQueryInterface = {cache: true};
    query.annotationType = ['USER_EFFECTIVE'];
    if (informalTaxonGroup) {
      query.informalTaxonGroupId = informalTaxonGroup;
    }
    if (lastDate) {
      query.annotatedSameOrAfter = lastDate;
    }

    const cacheKey = JSON.stringify({maxLength, informalTaxonGroup, lastDate});

    return this._fetch('users', cacheKey,
      this.warehouseApi.warehouseQueryAnnotationAggregateGet(
        query,
        ['unit.annotations.annotationByPerson', 'unit.annotations.annotationByPersonName'],
        undefined,
        maxLength,
        1,
        false,
        true
    )).pipe(
      map(data => data.results),
      map(data => data.map((row: any) => {
          row.userId = row.aggregateBy['unit.annotations.annotationByPersonName'] || '';
          return row;
        })), );
  }

  private _fetch(type: 'annotations'|'users', cacheKey: string, request: Observable<any>): Observable<any> {
    if (this.state[type].key === cacheKey) {
      return ObservableOf(this.state[type].data);
    } else if (this.state[type].pendingKey === cacheKey && this.state[type].pending) {
      return Observable.create((observer: Observer<any>) => {
        const onComplete = (res: any) => {
          observer.next(res);
          observer.complete();
        };
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.state[type].pending!.subscribe(
          (data) => { onComplete(data); }
        );
      });
    }
    this.state[type].pendingKey = cacheKey;
    this.state[type].pending    = request.pipe(
      tap(data => {
        this.state[type].data = data;
        this.state[type].key  = cacheKey;
      })
    );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.state[type].pending!;
  }
}
