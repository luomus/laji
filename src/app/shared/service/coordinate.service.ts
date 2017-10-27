import { Injectable } from '@angular/core';
import * as MapUtil from 'laji-map/lib/utils';

@Injectable()
export class CoordinateService {

  constructor() { }

  getFeature(geometry: Object, properties = {}) {
    return {
      type: 'Feature',
      properties: properties,
      geometry: geometry
    };
  }

  convertLajiEtlCoordinatesToGeometry(coordinate) {
    if (!coordinate) {
      return undefined;
    }
    if (Array.isArray(coordinate)) {
      return {
        type: 'GeometryCollection',
        geometries: coordinate.map(coord => this.convertLajiEtlCoordinatesToGeometry(coord))
      }
    }
    const parts = coordinate.split(':');
    const system = parts.pop();
    if (system === 'WGS84' && parts.length === 4) {
      return {
        type: 'Polygon',
        coordinates: [[
          [parts[2], parts[0]], [parts[2], parts[1]],
          [parts[3], parts[1]], [parts[3], parts[0]],
          [parts[2], parts[0]]
        ]]
      };
    } else if (system === 'YKJ' && parts.length === 2) {
      return this.convertYkjToGeoJsonFeature(parts[0], parts[1]);
    }
  }

  convertYkjToGeoJsonFeature(lat: any, lng: any, properties: {[k: string]: any} = {}) {
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

  convertWgs84ToYkj(lat: any, lng: any) {
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
