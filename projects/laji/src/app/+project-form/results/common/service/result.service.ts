import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, Observer, of as ObservableOf } from 'rxjs';
import { WarehouseApi } from '../../../../shared/api/WarehouseApi';
import { convertYkjToGeoJsonFeature } from '../../../../root/coordinate-utils';
import { WarehouseQueryInterface } from '../../../../shared/model/WarehouseQueryInterface';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { TranslateService } from '@ngx-translate/core';

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
    private api: LajiApiClientBService,
    private translate: TranslateService
  ) { }

  getTaxon(taxonId: string) {
    return this.api.get('/taxa/{id}', {
      path: { id: taxonId },
      query: { selectedFields: 'scientificName,vernacularName,cursiveName', lang: this.translate.currentLang as any }
    });
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
    )).pipe(
      map(data => data.results),
      map(data => data.map((row: any) => {
          row.aggregateBy['vernacularName'] =
            row.aggregateBy['unit.linkings.taxon.nameFinnish'] ||
            row.aggregateBy['unit.linkings.taxon.nameEnglish'] ||
            row.aggregateBy['unit.linkings.taxon.nameSwedish'];
          return row;
        })), );
  }

  getList(query: WarehouseQueryInterface, page: number): Observable<any> {
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
      100,
      page
    ));
  }

  getGeoJson(query: WarehouseQueryInterface): Observable<any> {
    return this._fetch('map', JSON.stringify(query),
      this.warehouseApi
        .warehouseQueryAggregateGet(
          query,
          ['gathering.conversions.ykj10kmCenter.lat,gathering.conversions.ykj10kmCenter.lon'],
          undefined,
          5000,
          1,
          false,
          false
        ).pipe(
        map(data => data.results),
        map(data => this._resultToGeoJson(data)), )
    );
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
        (this.state[type]!.pending! as any).subscribe(
          (data: any) => { onComplete(data); }
        );
      });
    }
    this.state[type].pendingKey = cacheKey;
    (this.state[type].pending as any) = request
      .pipe(tap(data => {
        this.state[type].data = data;
        this.state[type].key  = cacheKey;
      }));
    return this.state[type].pending as any;
  }

  private _resultToGeoJson(data: any) {
    const features: any[] = [];
    data.map((result: any) => {
      features.push(convertYkjToGeoJsonFeature(
        result.aggregateBy['gathering.conversions.ykj10kmCenter.lat'],
        result.aggregateBy['gathering.conversions.ykj10kmCenter.lon'],
        {
          count: result.count || 0,
          individualCountSum: result.individualCountSum || 0,
          newestRecord: result.newestRecord || '',
          oldestRecord: result.oldestRecord || '',
          grid: parseInt(result.aggregateBy['gathering.conversions.ykj10kmCenter.lat'], 10) + ':'
          + parseInt(result.aggregateBy['gathering.conversions.ykj10kmCenter.lon'], 10)
        }
      ));
    });
    return features;
  }

}
