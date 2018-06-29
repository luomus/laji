export namespace LajiMap {

  export interface Options {
    rootElem?: Element;
    tileLayerName?: TileLayer;
    overlayNames?: string[];
    tileLayerOpacity?: number;
    availableTileLayerNamesBlacklist?: TileLayer[];
    zoom?: number;
    center?: [number, number];
    zoomToData?: object | boolean,
    lang?: string;
    data?: any;
    drawIdx?: number;
    draw?: {
      marker?: boolean;
      polyline?: boolean;
      polygon?: boolean;
      circle?: boolean;
      rectangle?: boolean;
      onChange?: (eventData: any) => void;
    } | false;
    lineTransect?: {
      feature: any;
      printMode?: boolean;
      editable?: boolean;
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
      location?: boolean;
    } | boolean;
    on?: {
      load?: any;
      tileLayerChange?: (arg: {tileLayerName: string, type: string, target: any}) => void;
      tileLayerOpacityChange?: (event: {tileLayerOpacity: string, type: string, target: any}) => void;
      tileLayerOpacityChangeEnd?: (event: {tileLayerOpacity: number, type: string, target: any}) => void;
      overlaysChange?: (event: {overlayNames: string[], type: string, target: any}) => void;
    };
    clickBeforeZoomAndSpan?: boolean;
  }

  export enum TileLayer {
    taustakartta = 'taustakartta',
    pohjakartta = 'pohjakartta',
    maastokartta = 'maastokartta',
    openStreetMap = 'openStreetMap',
    googleSatellite = 'googleSatellite'
  }
}
