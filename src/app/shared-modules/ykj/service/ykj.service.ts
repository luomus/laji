import { Injectable } from '@angular/core';
import * as MapUtil from 'laji-map/lib/utils';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

type Grid = '100kmCenter'
  |'50kmCenter'
  |'10kmCenter'
  |'1kmCenter'
  |'100km'
  |'50km'
  |'10km'
  |'1km';

@Injectable()
export class YkjService {

  private key: undefined;
  private data: any[];
  private pending: Observable<any>;
  private pendingKey: string;

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

  getGeoJson(query: WarehouseQueryInterface, grid: Grid = '10kmCenter', key?: string, useStatistics = false): Observable<any> {
    if (!key) {
      key = JSON.stringify(query);
    }
    key += ':' + grid;
    if (this.key === key) {
      return Observable.of(this.data);
    } else if (this.pendingKey === key && this.pending) {
      return Observable.create((observer: Observer<any>) => {
        const onComplete = (res: any) => {
          observer.next(res);
          observer.complete();
        };
        this.pending.subscribe((data) => { onComplete(data); });
      });
    }
    this.pendingKey = key;
    const sourceMethod = useStatistics
        ? this.warehouseApi.warehouseQueryStatisticsGet.bind(this.warehouseApi)
        : this.warehouseApi.warehouseQueryAggregateGet.bind(this.warehouseApi);
    this.pending = sourceMethod(
        {...query, cache: (query.cache || WarehouseApi.isEmptyQuery(query))},
        [`gathering.conversions.ykj${grid}.lat,gathering.conversions.ykj${grid}.lon`],
        undefined,
        10000,
        1,
        false,
        false
      )
      .retryWhen(errors => errors.delay(1000).take(3).concat(Observable.throw(errors)))
      .map(data => data.results)
      .map(data => this.resultToGeoJson(data, grid));
    return this.pending;
  }

  private resultToGeoJson(data, grid) {
    const features = [];
    data.map(result => {
      features.push(this.convertYkjToGeoJsonFeature(
        result.aggregateBy[`gathering.conversions.ykj${grid}.lat`],
        result.aggregateBy[`gathering.conversions.ykj${grid}.lon`],
        {
          count: result.count || 0,
          individualCountSum: result.individualCountSum,
          newestRecord: result.newestRecord || '',
          oldestRecord: result.oldestRecord || '',
          grid: parseInt(result.aggregateBy[`gathering.conversions.ykj${grid}.lat`], 10) + ':'
          + parseInt(result.aggregateBy[`gathering.conversions.ykj${grid}.lon`], 10)
        }
      ));
    });
    return features;
  }

  private convertYkjToGeoJsonFeature(lat: any, lng: any, properties: {[k: string]: any} = {}) {
    lat = parseInt(lat, 10);
    lng = parseInt(lng, 10);
    const latStart = this.pad(lat);
    const latEnd = this.pad(lat + 1);
    const lonStart = this.pad(lng);
    const lonEnd = this.pad(lng + 1);
    return {
      type: 'Feature',
      properties: properties,
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [latStart, lonStart],
          [latStart, lonEnd],
          [latEnd, lonEnd],
          [latEnd, lonStart],
          [latStart, lonStart],
        ].map(this.convertYkjToWgs)]
      }
    };
  }

  private convertWgs84ToYkj(lat: any, lng: any) {
    return MapUtil.convertLatLng([lat, lng], 'WGS84', 'EPSG:2393');
  }

  private convertYkjToWgs(latLng: [string, string]): [string, string] {
    return MapUtil.convertLatLng(latLng, 'EPSG:2393', 'WGS84');
  }

  private pad(value) {
    value = '' + value;
    return value + '0000000'.slice(value.length);
  }
}
