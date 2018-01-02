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
    draw?: boolean;
    drawCopy?: boolean;
    drawUndo?: boolean;
    drawRedo?: boolean;
    drawClear?: boolean;
    coordinates?: boolean;
    lineTransect?: boolean;
    coordinateInput?: boolean;
  };
  on?: {
    tileLayerChange?: (arg: {tileLayerName: string, type: string, target: any}) => void;
    tileLayerOpacityChange?: (event: {tileLayerOpacity: string, type: string, target: any}) => void;
    tileLayerOpacityChangeEnd?: (event: {tileLayerOpacity: string, type: string, target: any}) => void;
    overlaysChange?: (event: {overlayNames: string[], type: string, target: any}) => void;
  };
}
