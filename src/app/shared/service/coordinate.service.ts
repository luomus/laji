import { Injectable } from '@angular/core';
import * as MapUtil from 'laji-map/lib/utils';
import {GeometryCollection} from 'geojson';

@Injectable()
export class CoordinateService {

  constructor() { }

  getFeatureFromGeometry(geometry: Object, properties = {}) {
    return {
      type: 'Feature',
      properties: properties,
      geometry: geometry || {}
    };
  }

  getFeatureCollectionFromGeometry(geometry: Object, properties = {}) {
    return {
      type: 'FeatureCollection',
      features: [this.getFeatureFromGeometry(geometry, properties)]
    };
  }

  getGeometryFromFeatureCollection(featureCollection: any) {
    if (featureCollection && Array.isArray(featureCollection.features)) {
      if (featureCollection.features.length === 0) {
        return undefined;
      }
      if (featureCollection.features.length === 1) {
        return featureCollection.features[0].geometry;
      }
      return {
        type: 'GeometryCollection',
        geometries: featureCollection.features.map(feature => feature.geometry)
      }
    }
    return undefined;
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
      return this.convertYkjToGeoJsonFeature(parts[0], parts[1]).geometry;
    }
  }

  convertYkjToGeoJsonFeature(origLat: any, origLng: any, properties: {[k: string]: any} = {}) {
    const lat = parseInt(origLat, 10);
    const lng = parseInt(origLng, 10);
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
        ].map(this.convertYkjToWgs)],
        coordinateVerbatim: origLat + ':' + origLng
      }
    };
  }

  convertWgs84ToYkj(lat: any, lng: any): [number, number] {
    return MapUtil.convertLatLng([lat, lng], 'WGS84', 'EPSG:2393');
  }

  convertEtrsToWgs(lat: any, lng: any) {
    return MapUtil.convertLatLng([lat, lng], 'EPSG:3067', 'WGS84');
  }

  private convertYkjToWgs(latLng: [string, string]): [string, string] {
    return MapUtil.convertLatLng(latLng, 'EPSG:2393', 'WGS84');
  }

  private pad(value) {
    value = '' + value;
    return value + '0000000'.slice(value.length);
  }
}
