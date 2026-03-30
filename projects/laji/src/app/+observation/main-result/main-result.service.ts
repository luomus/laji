import { map, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { Observable, Observer, of as ObservableOf } from 'rxjs';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { PagedResult } from '../../shared/model/PagedResult';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { paths } from 'projects/laji-api-client-b/generated/api';

type WarehouseUnitAggregateQueryParams = NonNullable<paths['/warehouse/query/unit/aggregate']['get']['parameters']['query']>;
type WarehouseUnitListQueryParams = NonNullable<paths['/warehouse/query/unit/list']['get']['parameters']['query']>;
type WarehouseUnitAggregateBy = NonNullable<WarehouseUnitAggregateQueryParams['aggregateBy']>[number];

interface ResultState {
  key: string;
  data: any;
  pending?: Observable<any>;
  pendingKey: string;
}

@Injectable()
export class MainResultService {

  private state: Record<string, ResultState> = {
    taxon: {
      key: '',
      data: {},
      pending: undefined,
      pendingKey: ''
    },
    result: {
      key: '',
      data: [],
      pending: undefined,
      pendingKey: ''
    },
    list: {
      key: '',
      data: [],
      pending: undefined,
      pendingKey: ''
    }
  };

  constructor(
    private api: LajiApiClientBService
  ) { }

  getResults(query: WarehouseQueryInterface, lang: string): Observable<any> {
    let vernacular = 'unit.linkings.taxon.nameFinnish';
    switch (lang) {
      case 'en':
        vernacular = 'unit.linkings.taxon.nameEnglish';
        break;
      case 'sv':
        vernacular = 'unit.linkings.taxon.nameSwedish';
    }
    return this._fetch('result', JSON.stringify(query) + ':' + lang, this.api.get('/warehouse/query/unit/aggregate', {
      query: {
        ...query,
        aggregateBy: [
          'unit.linkings.taxon.speciesId',
          'unit.linkings.taxon.speciesScientificName',
          'unit.linkings.taxon.taxonomicOrder',
          vernacular as WarehouseUnitAggregateBy
        ],
        orderBy: ['unit.linkings.taxon.taxonomicOrder'],
        pageSize: 1000,
        page: 1,
        onlyCount: false
      }
    } as { query: WarehouseUnitAggregateQueryParams })).pipe(
      map(data => data.results),
      map(data => data.map((row: any) => {
          row.aggregateBy['vernacularName'] =
            row.aggregateBy['unit.linkings.taxon.nameFinnish'] ||
            row.aggregateBy['unit.linkings.taxon.nameEnglish'] ||
            row.aggregateBy['unit.linkings.taxon.nameSwedish'];
          return row;
        })), );
  }

  getList(query: WarehouseQueryInterface, page: number, pageSize: number): Observable<PagedResult<any>> {
    return this._fetch('list', JSON.stringify(query) + ':' + page, this.api.get('/warehouse/query/unit/list', {
      query: {
        ...query,
        selected: [
          'document.documentId',
          'gathering.eventDate.begin',
          'gathering.eventDate.end',
          'gathering.municipality',
          'gathering.biogeographicalProvince',
          'gathering.team',
          'gathering.province',
          'unit.unitId',
          'unit.linkings.taxon.scientificName'
        ],
        pageSize,
        page
      }
    } as { query: WarehouseUnitListQueryParams })) as Observable<PagedResult<any>>;
  }

  private _fetch(type: 'map'|'list'|'result'|'taxon', cacheKey: string, request: Observable<any>): Observable<any> {
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
    this.state[type].pending    = request
      .pipe(tap(data => {
        this.state[type].data = data;
        this.state[type].key  = cacheKey;
      }));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.state[type].pending!;
  }

}
