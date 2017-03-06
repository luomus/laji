import { Injectable } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import * as MapUtil from 'laji-map/lib/utils';

@Injectable()
export class ResultService {

  private state = {
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
    private warehouseApi: WarehouseApi
  ) { }

  getResults(collectionId: string, informalGroup: string, time: string): Observable<any> {
    const cacheKey = collectionId + ':' + informalGroup + ':' + time;
    return this._fetch('list', cacheKey, this.warehouseApi.warehouseQueryAggregateGet(
      {
        collectionId: [collectionId],
        informalTaxonGroupId: [informalGroup],
        time: [time]
      },
      ['unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName'],
      ['2'],
      1000,
      1,
      false,
      false
    ));
  }

  getList(grid: string, collectionId: string, taxonId: string, time: string, page: number): Observable<any> {
    const cacheKey = grid + ':' + collectionId + ':' + taxonId + ':' + time + ':' + page;
    return this._fetch('list', cacheKey, this.warehouseApi.warehouseQueryListGet(
      {
        collectionId: [collectionId],
        taxonId: [taxonId],
        time: [time],
        ykj3: grid
      },
      ['document.documentId,gathering.eventDate.begin,gathering.eventDate.end,gathering.municipality,gathering.province,' +
      'gathering.team,gathering.timeBegin,gathering.timeEnd,unit.unitId,unit.linkings.taxon.scientificName'],
      undefined,
      100,
      page
    ));
  }

  getGeoJson(taxonId: string, time: string, collectionId: string): Observable<any> {
    return this._fetch('map', taxonId + time,
      this.warehouseApi
        .warehouseQueryAggregateGet(
          {
            collectionId: [collectionId],
            countryId: ['ML.206'],
            taxonId: [taxonId],
            time: [time]
          },
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

  private _fetch(type: 'map'|'list', cacheKey: string, request): Observable<any> {
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
    const pad = function(value) {
      value = '' + value;
      return value + '0000000'.slice(value.length);
    };
    const convert = function(latLng) {
      return MapUtil.convertLatLng(latLng, 'EPSG:2393', 'WGS84');
    };
    const features = [];
    data.map(result => {
      const lat = parseInt(result.aggregateBy['gathering.conversions.ykj3.lat'], 10);
      const lng = parseInt(result.aggregateBy['gathering.conversions.ykj3.lon'], 10);
      const latStart = pad(lat);
      const latEnd = pad(lat + 1);
      const lonStart = pad(lng);
      const lonEnd = pad(lng + 1);
      features.push({
        type: 'Feature',
        properties: {
          count: result.count || 0,
          individualCountMax: result.individualCountMax || 0,
          individualCountMin: result.individualCountMin || 0,
          newestRecord: result.newestRecord || '',
          oldestRecord: result.oldestRecord || '',
          grid: lat + ':' + lng
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [latStart, lonStart],
            [latStart, lonEnd],
            [latEnd, lonEnd],
            [latEnd, lonStart],
            [latStart, lonStart],
          ].map(convert)]
        }
      });
    });
    return features;
  }

}
