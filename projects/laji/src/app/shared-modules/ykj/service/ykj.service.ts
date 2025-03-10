import { concat, delay, map, retryWhen, take } from 'rxjs/operators';
import { Observable, Observer, of as ObservableOf, throwError as observableThrowError } from 'rxjs';
import { Injectable } from '@angular/core';
import * as MapUtil from '@luomus/laji-map/lib/utils';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';

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
  private data?: any[];
  private pending?: Observable<any>;
  private pendingKey?: string;

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

  getGeoJson(query: WarehouseQueryInterface, grid: Grid = '10kmCenter', key?: string,
             useStatistics = false, zeroObservations = false, enableOnlyCount = false): Observable<any> {
    return this.getList(query, grid, key, useStatistics, zeroObservations, [], enableOnlyCount).pipe(
      map(data => this.resultToGeoJson(data, grid, zeroObservations))
    );
  }

  getList(query: WarehouseQueryInterface, grid: Grid = '10kmCenter', key?: string,
             useStatistics = false, zeroObservations = false, selected: any[] = [], enableOnlyCount = false): Observable<any> {
    if (!key) {
      key = JSON.stringify(query);
    }
    key += ':' + grid;
    if (this.key === key) {
      return ObservableOf(this.data);
    } else if (this.pendingKey === key && this.pending) {
      return Observable.create((observer: Observer<any>) => {
        const onComplete = (res: any) => {
          observer.next(res);
          observer.complete();
        };
        (this.pending as any).subscribe((data: any) => { onComplete(data); });
      });
    }
    this.pendingKey = key;
    const sourceMethod: (query: any, aggregate: any, orderBy: any, pageSize: any, page: any, geoJson: any, onlyCount: any) => Observable<any> = zeroObservations
      ? this.warehouseApi.warehouseQueryGatheringStatisticsGet.bind(this.warehouseApi) : useStatistics
      ? this.warehouseApi.warehouseQueryStatisticsGet.bind(this.warehouseApi)
      : this.warehouseApi.warehouseQueryAggregateGet.bind(this.warehouseApi);
    this.pending = sourceMethod(
        {...query, cache: (query.cache || WarehouseApi.isEmptyQuery(query))},
        [`gathering.conversions.ykj${grid}.lat,gathering.conversions.ykj${grid}.lon`, ...selected],
        selected.length > 0 ? [`gathering.conversions.ykj${grid}.lat,gathering.conversions.ykj${grid}.lon`] : undefined,
        10000,
        1,
        false,
        enableOnlyCount
      ).pipe(
        retryWhen(errors => errors.pipe(delay(1000), take(3), concat(observableThrowError(errors)))),
        map(data => data.results)
      );
    return this.pending;
  }

  combineGeoJsons(geoJson: any[], zeroObsGeoJson: any[]) {
    const grids = geoJson.map(g => (g.properties.grid));
    const filteredGeoJson: any[] = [];

    const filteredZeroObsGeoJson = zeroObsGeoJson.filter((z: any) => {
      if (z.properties.lineLengthSum === 0) {
        return false;
      }

      const idx = grids.indexOf(z.properties.grid);
      if (idx === -1) {
        return true;
      }

      filteredGeoJson.push({...geoJson[idx], properties: {...geoJson[idx].properties, lineLengthSum: z.properties.lineLengthSum}});
      return false;
    });

    return filteredGeoJson.concat(filteredZeroObsGeoJson);
  }

  resultToGeoJson(data: any[], grid: string, zeroObservations = false) {
    const features: any[] = [];
    data.map((result: any) => {
      features.push(this.convertYkjToGeoJsonFeature(
        result.aggregateBy[`gathering.conversions.ykj${grid}.lat`],
        result.aggregateBy[`gathering.conversions.ykj${grid}.lon`],
        {
          count: zeroObservations ? 0 : result.count || 0,
          individualCountSum: zeroObservations ? 0 : result.individualCountSum,
          pairCountSum: zeroObservations ? 0 : result.pairCountSum,
          newestRecord: result.newestRecord || '',
          oldestRecord: result.oldestRecord || '',
          lineLengthSum: zeroObservations ? result.lineLengthSum || 0 : undefined,
          grid: parseInt(result.aggregateBy[`gathering.conversions.ykj${grid}.lat`], 10) + ':'
          + parseInt(result.aggregateBy[`gathering.conversions.ykj${grid}.lon`], 10)
        }
      ));
    });
    return features;
  }

  convertYkjToGeoJsonFeature(lat: any, lng: any, properties: {[k: string]: any} = {}): GeoJSON.Feature | null {
    lat = parseInt(lat, 10);
    lng = parseInt(lng, 10);
    if (isNaN(lat) || isNaN(lng)) {
      return null;
    }
    const latStart = this.pad(lat);
    const latEnd = this.pad(lat + 1);
    const lonStart = this.pad(lng);
    const lonEnd = this.pad(lng + 1);
    return {
      type: 'Feature',
      properties,
      geometry: {
        type: 'Polygon',
        coordinates: [([
          [latStart, lonStart],
          [latStart, lonEnd],
          [latEnd, lonEnd],
          [latEnd, lonStart],
          [latStart, lonStart],
        ] as [string, string][]).map(this.convertYkjLatLngToWgsLngLat)]
      }
    };
  }

  private convertYkjLatLngToWgsLngLat(latLng: [any, any]): [number, number] {
    return MapUtil.convertLatLng(latLng, 'EPSG:2393', 'WGS84').reverse() as [number, number];
  }

  private pad(value: any) {
    value = '' + value;
    return value + '0000000'.slice(value.length);
  }
}
