import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input,
  NgZone, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { LajiMap, DataOptions, TileLayersOptions, Lang, GetFeatureStyleOptions } from 'laji-map';
import L, { LatLngTuple } from 'leaflet';
import { PathOptions } from 'leaflet';
import { convertYkjToGeoJsonFeature } from 'projects/laji/src/app/root/coordinate-utils';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AtlasClass, AtlasGridSquare, BirdSocietyTaxaResponseElem } from '../../../core/atlas-api.service';
import { PopstateService } from '../../../core/popstate.service';
import { getFeatureColor, VisualizationMode } from '../../../shared-modules/map-utils/visualization-mode';
import { convertYkjToWgs } from 'projects/laji/src/app/root/coordinate-utils';

interface MapData {
  grid: AtlasGridSquare[];
  dataOptions: DataOptions;
};

const gridSqToFeature = (square: AtlasGridSquare) => {
  const latLngStr = square.coordinates.split(':');
  return convertYkjToGeoJsonFeature(latLngStr[0], latLngStr[1]);
};
const getFeatureCollection = (grid: AtlasGridSquare[]) => ({
  features: [
    ...grid.map(square => <any>gridSqToFeature(square))
  ],
  type: 'FeatureCollection'
});
const getGetFeatureStyle = (grid: AtlasGridSquare[], visualizationMode: VisualizationMode, selectedIdx = -1) => (
  (opt: GetFeatureStyleOptions): PathOptions => {
    const sq: AtlasGridSquare = grid[opt.featureIdx];
    const o: PathOptions = {
      weight: 1,
      color: '#000000',
      opacity: .4,
      fillColor: '#' + getFeatureColor(sq, visualizationMode),
      fillOpacity: .8
    };
    if (opt.featureIdx === selectedIdx) {
      o['weight'] = 2;
      o['opacity'] = 1;
    }
    return o;
  }
);

// radii for the taxon visualization
export const atlasClassStyleLookup: Record<AtlasClass, {radius: number; fillColor: string}> = {
  'MY.atlasClassEnumA': { radius: 100,  fillColor: '#7cf00a' },
  'MY.atlasClassEnumB': { radius: 133, fillColor: '#F0FFBC' },
  'MY.atlasClassEnumC': { radius: 166, fillColor: '#01E635' },
  'MY.atlasClassEnumD': { radius: 200, fillColor: '#006262' }
};

@Component({
  selector: 'ba-bird-society-info-map',
  templateUrl: './bird-society-info-map.component.html',
  styleUrls: ['./bird-society-info-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdSocietyInfoMapComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() atlasGrid: AtlasGridSquare[];
  @Input() visualizationMode: VisualizationMode = 'activityCategory';
  @Input() set selectedDataIdx(idx: number) { this.setSelectedDataIdx(idx); };
  get selectedDataIdx() { return this._selectedDataIdx; };
  @Input() taxonVisualization: BirdSocietyTaxaResponseElem[] | undefined;

  @Output() selectDataIdx = new EventEmitter<number>();

  @ViewChild('lajiMap', { static: false }) lajiMapElem: ElementRef;

  private map: any;
  private mapData$ = new BehaviorSubject<MapData>(undefined);
  private mapInitialized = false;
  private taxonVisualizationMarkers: L.Circle<any>[] = [];
  private _selectedDataIdx = -1;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private popstateService: PopstateService
  ) {
    this.zone.runOutsideAngular(() => {
      this.map = new LajiMap({
        tileLayers: <TileLayersOptions>{
          layers: {
            taustakartta: { opacity: 1, visible: true },
            atlasGrid: { opacity: .6, visible: true }
          }
        },
        controls: true,
        lang: Lang.fi,
        center: [64.8, 25],
        zoom: 1.6
      });
    });
  }

  ngAfterViewInit(): void {
    const pathData = this.popstateService.getPathData();
    this.map.setRootElem(this.lajiMapElem.nativeElement);
    this.mapData$.pipe(
      takeUntil(this.unsubscribe$),
      filter(d => d !== undefined)
    ).subscribe(mapData => {
      this.map.setData(mapData.dataOptions);
      if (!this.mapInitialized) {
        if (pathData['map']) {
          this.map.setNormalizedZoom(pathData['map'].zoom);
          this.map.setCenter(pathData['map'].center);
          this.map.setTileLayers(pathData['map'].tileLayers);
        } else {
          this.map.zoomToData();
        }
        this.mapInitialized = true;
      }
      this.leafletTaxonVisualization();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.atlasGrid?.currentValue) {
      this.mapData$.next({
        grid: changes.atlasGrid.currentValue,
        dataOptions: {
          featureCollection: <any>getFeatureCollection(changes.atlasGrid.currentValue),
          getFeatureStyle: getGetFeatureStyle(changes.atlasGrid.currentValue, this.visualizationMode, this.selectedDataIdx),
          maxFillOpacity: 0.8,
          on: {
            click: (e, d) => {
              this.selectDataIdx.emit(d.idx ?? d.dataIdx);
            }
          }
        }
      });
    }
    if (changes.visualizationMode?.currentValue) {
      this.triggerFeatureStyleUpdate();
    }
    if (changes.taxonVisualization) {
      this.leafletTaxonVisualization();
    }
  }

  private leafletTaxonVisualization() {
    this.clearCustomMarkers();
    if (!this.taxonVisualization) { return; }
    this.taxonVisualization.forEach((square, idx) => {
      if (square.atlasClass === undefined) { return; }
      // transform coordinates such that the point lies in the center of the square
      const ykj = <[string, string]>square.coordinates.split(':').map(c => c += '5000');
      const latlng: LatLngTuple = convertYkjToWgs(ykj);
      const style = atlasClassStyleLookup[<AtlasClass>square.atlasClass.key];
      const radius = style.radius * 20;
      const circle = L.circle(latlng, radius, {
        fill: true, stroke: true, fillOpacity: 1, fillColor: style.fillColor,
        color: '#000000', weight: 2
      });
      // don't include "epätodennäköinen"
      if (square.atlasClass.key !== 'MY.atlasClassEnumA') {
        this.taxonVisualizationMarkers.push(circle);
        circle.addEventListener('click', () => this.selectDataIdx.emit(idx));
        circle.addTo(this.map.map);
      }
    });
  }

  private clearCustomMarkers() {
    this.taxonVisualizationMarkers.forEach(marker => {
      marker.removeFrom(this.map.map);
      marker.clearAllEventListeners();
    });
    this.taxonVisualizationMarkers = [];
  }

  private setSelectedDataIdx(idx: number) {
    this._selectedDataIdx = idx;
    this.triggerFeatureStyleUpdate();
  }

  private triggerFeatureStyleUpdate() {
    const curr = this.mapData$.getValue();
    this.mapData$.next({grid: curr?.grid, dataOptions: {
      ...curr?.dataOptions,
      getFeatureStyle: getGetFeatureStyle(curr?.grid, this.visualizationMode, this.selectedDataIdx)
    }});
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.popstateService.setPathData({
        map: {
          center: this.map.getOption('center'),
          zoom: this.map.getNormalizedZoom(),
          tileLayers: this.map.getOption('tileLayers')
        }
      });
      this.map.destroy();
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
