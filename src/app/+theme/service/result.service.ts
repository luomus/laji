import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';
import { CoordinateService } from '../../shared/service/coordinate.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';

@Injectable()
export class ResultService {

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
    },
    map: {
      key: undefined,
      data: [],
      pending: undefined,
      pendingKey: ''
    }
  };

  constructor(
    private warehouseApi: WarehouseApi,
    private taxonomyApi: TaxonomyApi,
    private coordinateService: CoordinateService
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
      ['3'],
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

  getList(query: WarehouseQueryInterface, page: number): Observable<any> {
    return this._fetch('list', JSON.stringify(query) + ':' + page, this.warehouseApi.warehouseQueryListGet(
      query,
      ['document.documentId,gathering.eventDate.begin,gathering.eventDate.end,gathering.municipality,gathering.province,' +
      'gathering.team,gathering.timeBegin,gathering.timeEnd,unit.unitId,unit.linkings.taxon.scientificName'],
      undefined,
      100,
      page
    ));
  }

  getGeoJson(query: WarehouseQueryInterface): Observable<any> {
    return this._fetch('map', JSON.stringify(query),
      this.warehouseApi
        .warehouseQueryAggregateGet(
          query,
          ['gathering.conversions.ykj3.lat,gathering.conversions.ykj3.lon'],
          ['1'],
          5000,
          1,
          false,
          false
        )
        .map(data => data.results)
        .map(data => this._resultToGeoJson(data))
    );
  }

  private _fetch(type: 'map'|'list'|'result'|'taxon', cacheKey: string, request): Observable<any> {
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

  private _resultToGeoJson(data) {
    const features = [];
    data.map(result => {
      features.push(this.coordinateService.convertYkjToGeoJsonFeature(
        result.aggregateBy['gathering.conversions.ykj3.lat'],
        result.aggregateBy['gathering.conversions.ykj3.lon'],
        {
          count: result.count || 0,
          individualCountSum: result.individualCountSum || 0,
          newestRecord: result.newestRecord || '',
          oldestRecord: result.oldestRecord || '',
          grid: parseInt(result.aggregateBy['gathering.conversions.ykj3.lat'], 10) + ':'
          + parseInt(result.aggregateBy['gathering.conversions.ykj3.lon'], 10)
        }
      ));
    });
    return features;
  }

}
