import { Injectable } from '@angular/core';
import { Observable, Observer, of as ObservableOf } from 'rxjs';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { PagedResult } from '../../shared/model/PagedResult';

@Injectable()
export class MainResultService {

  private state = {
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
    private warehouseApi: WarehouseApi,
    private taxonomyApi: TaxonomyApi
  ) { }

  getTaxon(taxonId: string) {
    return this._fetch('taxon', taxonId, this.taxonomyApi.taxonomyFindBySubject(
      taxonId,
      'multi',
      {
        'selectedFields': 'scientificName,vernacularName,cursiveName'
      }
    ));
  }

  getResults(query: WarehouseQueryInterface, lang: string): Observable<any> {
    let vernacular = 'unit.linkings.taxon.nameFinnish';
    switch (lang) {
      case 'en':
        vernacular = 'unit.linkings.taxon.nameEnglish';
        break;
      case 'sv':
        vernacular = 'unit.linkings.taxon.nameSwedish';
    }
    return this._fetch('result', JSON.stringify(query) + ':' + lang, this.warehouseApi.warehouseQueryAggregateGet(
      query,
      ['unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.taxonomicOrder', vernacular],
      ['unit.linkings.taxon.taxonomicOrder'],
      1000,
      1,
      false,
      false
    ))
      .map(data => data.results)
      .map(data => {
        return data.map(row => {
          row.aggregateBy['vernacularName'] =
            row.aggregateBy['unit.linkings.taxon.nameFinnish'] ||
            row.aggregateBy['unit.linkings.taxon.nameEnglish'] ||
            row.aggregateBy['unit.linkings.taxon.nameSwedish'];
          return row;
        });
      });
  }

  getList(query: WarehouseQueryInterface, page: number, pageSize: number): Observable<PagedResult<any>> {
    return this._fetch('list', JSON.stringify(query) + ':' + page, this.warehouseApi.warehouseQueryListGet(
      query,
      [
        'document.documentId,' +
        'gathering.eventDate.begin,' +
        'gathering.eventDate.end,' +
        'gathering.municipality,' +
        'gathering.biogeographicalProvince,' +
        'gathering.team,' +
        'gathering.province,' +
        'unit.unitId,' +
        'unit.linkings.taxon.scientificName'
      ],
      undefined,
      pageSize,
      page
    ));
  }

  private _fetch(type: 'map'|'list'|'result'|'taxon', cacheKey: string, request): Observable<any> {
    if (this.state[type].key === cacheKey) {
      return ObservableOf(this.state[type].data);
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
