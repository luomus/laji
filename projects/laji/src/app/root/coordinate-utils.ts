import * as MapUtil from 'laji-map/lib/utils';

export const convertYkjToGeoJsonFeature = (origLat: any, origLng: any, properties: {[k: string]: any} = {}) => {
  const lat = parseInt(origLat, 10);
  const lng = parseInt(origLng, 10);
  const latStart = pad(lat);
  const latEnd = pad(lat + 1);
  const lonStart = pad(lng);
  const lonEnd = pad(lng + 1);
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
      ] as [string, string][]).map((latLng: [string, string]) => convertYkjToWgs(latLng).reverse())],
      coordinateVerbatim: origLat + ':' + origLng
    }
  };
};

export const getFeatureFromGeometry = (geometry: Record<string, unknown>, properties = {}) => (
  {
    type: 'Feature',
    properties,
    geometry: geometry || {}
  }
);

export const getFeatureCollectionFromGeometry = (geometry: Record<string, unknown>, properties = {}) => (
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

export const convertLajiEtlCoordinatesToGeometry = (coordinate) => {
  if (!coordinate) {
    return undefined;
  }
  if (Array.isArray(coordinate)) {
    return {
      type: 'GeometryCollection',
      geometries: coordinate.map(coord => convertLajiEtlCoordinatesToGeometry(coord))
    };
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
    return convertYkjToGeoJsonFeature(parts[0], parts[1]).geometry;
  }
};

export const convertYkjToWgs = (latLng: [string, string]): [string, string] => (
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