import * as MapUtil from '@luomus/laji-map/lib/utils';
import G from 'geojson';

export const convertYkjToGeoJsonFeature = (origLat: string | number, origLng: string | number, properties: {[k: string]: any} = {}): G.Feature<G.Polygon> => {
  const lat = parseInt((origLat as string), 10);
  const lng = parseInt((origLng as string), 10);
  const latStart = +pad(lat);
  const latEnd = +pad(lat + 1);
  const lonStart = +pad(lng);
  const lonEnd = +pad(lng + 1);
  const polygon: G.Polygon = {
    type: 'Polygon',
    coordinates: [([
      [latStart, lonStart],
      [latStart, lonEnd],
      [latEnd, lonEnd],
      [latEnd, lonStart],
      [latStart, lonStart],
    ] as [number, number][]).map((latLng) => convertYkjToWgs(latLng).reverse())],
  };
  (polygon as any).coordinateVerbatim = origLat + ':' + origLng;  // 'any' conversion because 'coordinateVerbatim' isn't in GeoJSON.
  return {
    type: 'Feature',
    properties,
    geometry: polygon
  };
};

export const getFeatureFromGeometry = <T extends G.Geometry>(geometry: T, properties = {}): G.Feature<T> => (
  {
    type: 'Feature',
    properties,
    geometry
  }
);

export const getFeatureCollectionFromGeometry = <T extends G.Geometry>(geometry: T, properties = {}): G.FeatureCollection<T> => (
  {
    type: 'FeatureCollection',
    features: [getFeatureFromGeometry(geometry, properties)]
  }
);

export const getGeometryFromFeatureCollection = (featureCollection: any) => {
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
    };
  }
  return undefined;
};

function convertLajiEtlCoordinatesToGeometry(coordinate: string[]): G.GeometryCollection;
function convertLajiEtlCoordinatesToGeometry(coordinate: string): G.Polygon;
function convertLajiEtlCoordinatesToGeometry(coordinate: string[] | string): G.GeometryCollection | G.Polygon {
  if (Array.isArray(coordinate)) {
    return {
      type: 'GeometryCollection',
      geometries: coordinate.map(coord => convertLajiEtlCoordinatesToGeometry(coord))
    };
  }
  const parts = coordinate.split(':');
  const system = parts.pop();
  const coords = parts.map(c => +c);
  if (system === 'WGS84' && parts.length === 4) {
    return {
      type: 'Polygon',
      coordinates: [[
        [coords[2], coords[0]], [coords[2], coords[1]],
        [coords[3], coords[1]], [coords[3], coords[0]],
        [coords[2], coords[0]]
      ]]
    };
  } else if (system === 'YKJ' && parts.length === 2) {
    return convertYkjToGeoJsonFeature(coords[0], parts[1]).geometry;
  }
  throw new Error('Invalid Laji ETL coordinates ' + coordinate);
};

export { convertLajiEtlCoordinatesToGeometry };

export const convertYkjToWgs = <T extends string | number>(latLng: [T, T]): [number, number] => (
  MapUtil.convertLatLng([+latLng[0], +latLng[1]], 'EPSG:2393', 'WGS84')
);

/**
 * Convert WGS84 (lat, lng) to YKJ (lat, lng)
 */
export const convertWgs84ToYkj = (lat: any, lng: any): [number, number] => (
  MapUtil.convertLatLng([lat, lng], 'WGS84', 'EPSG:2393')
);

/**
 * Convert Etrs (lat, lng) to WGS84 (lat, lng)
 */
export const convertEtrsToWgs = (lat: any, lng: any) => (
  MapUtil.convertLatLng([lat, lng], 'EPSG:3067', 'WGS84')
);

const pad = (value) => {
  value = '' + value;
  return value + '0000000'.slice(value.length);
};
