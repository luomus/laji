import * as LajiMap from 'laji-map';


export interface LajiMapOptions extends LajiMap.Options { // tslint:disable-line

}

export const LajiMapTileLayerName = {
  ...LajiMap.TileLayerName
};

export const LajiMapLang = {
  ...LajiMap.Lang
};

export type LajiMapLang = LajiMap.Lang;

export type LajiMapLineTransectGeometry = LajiMap.LineTransectGeometry;
