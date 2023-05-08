/* eslint-disable @typescript-eslint/naming-convention */
import * as LajiMap from 'laji-map';
import * as L from 'leaflet';

export type LajiMapOptions = LajiMap.Options;

export type LajiMapControlsOptions = LajiMap.ControlsOptions;

export const LajiMapTileLayerName = {
  ...LajiMap.TileLayerName
};

export const LajiMapOverlayName = {
  ...LajiMap.OverlayName
};

export type LajiMapOverlayName = LajiMap.OverlayName;

export const LajiMapLang = {
  ...LajiMap.Lang
};

export type LajiMapLang = LajiMap.Lang;

export type LajiMapLineTransectGeometry = LajiMap.LineTransectGeometry;

export type LajiMapDataOptions = LajiMap.DataOptions;

export type LajiMapTileLayersOptions = LajiMap.TileLayersOptions;

export type LajiMapDrawEvent = LajiMap.LajiMapEvent;

export const Rectangle = L.Rectangle;
