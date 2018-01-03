export interface LajiMapOptions {
  rootElem?: Element;
  tileLayerName?: string;
  overlayNames?: string[];
  availableTileLayerNamesBlacklist?: string[];
  zoom?: number;
  center?: [number, number];
  lang?: string;
  data?: any;
  draw?: any;
  lineTransect?: {
    feature: any;
  };
  markerPopupOffset?: number;
  featurePopupOffset?: number;
  controls?: {
    draw?: {
      marker?: boolean;
      polyline?: boolean;
      polygon?: boolean;
      circle?: boolean;
      rectangle?: boolean;
      copy?: boolean;
      upload?: boolean;
      undo?: boolean;
      redo?: boolean;
      clear?: boolean;
      delete?: boolean;
      reverse?: boolean;
      coordinateInput?: boolean;
    } | boolean;
    coordinates?: boolean;
    lineTransect?: boolean;
  };
  on?: {
    tileLayerChange?: (arg: {tileLayerName: string, type: string, target: any}) => void;
    tileLayerOpacityChange?: (event: {tileLayerOpacity: string, type: string, target: any}) => void;
    tileLayerOpacityChangeEnd?: (event: {tileLayerOpacity: string, type: string, target: any}) => void;
    overlaysChange?: (event: {overlayNames: string[], type: string, target: any}) => void;
  };
}
