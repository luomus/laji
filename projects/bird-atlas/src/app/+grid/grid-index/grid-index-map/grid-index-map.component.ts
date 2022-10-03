import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input,
  NgZone, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { LajiMap, DataOptions, TileLayersOptions, Lang, GetFeatureStyleOptions } from 'laji-map';
import { PathOptions } from 'leaflet';
import { convertYkjToGeoJsonFeature } from 'projects/laji/src/app/root/coordinate-utils';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AtlasGrid, AtlasGridSquare } from '../../../core/atlas-api.service';
import { PopstateService } from '../../../core/popstate.service';
import {getFeatureColor, VisualizationMode } from '../../../shared-modules/map-utils/visualization-mode';

interface MapData {
  grid: AtlasGrid;
  data: DataOptions;
};

const gridSqToFeature = (square: AtlasGridSquare) => {
  const latLngStr = square.coordinates.split(':');
  return convertYkjToGeoJsonFeature(latLngStr[0], latLngStr[1]);
};
const getFeatureCollection = (grid: AtlasGrid) => ({
  features: [
    ...grid.map(square => <any>gridSqToFeature(square))
  ],
  type: 'FeatureCollection'
});
export const getGetFeatureStyle = (grid: AtlasGrid, visualizationMode: VisualizationMode) => (
  (opt: GetFeatureStyleOptions): PathOptions => {
    const sq: AtlasGridSquare = grid[opt.featureIdx];
    const o: PathOptions = {
      weight: 0,
      color: '#000000',
      opacity: .2,
      fillColor: '#' + getFeatureColor(sq, visualizationMode),
      fillOpacity: .8
    };
    return o;
  }
);

@Component({
  selector: 'ba-grid-index-map',
  templateUrl: './grid-index-map.component.html',
  styleUrls: ['./grid-index-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridIndexMapComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() atlasGrid: AtlasGrid;
  @Output() selectYKJ = new EventEmitter<string>();

  @ViewChild('lajiMap', { static: false }) lajiMapElem: ElementRef;

  visualization: VisualizationMode = 'activityCategory';

  private map: any;
  private mapData$ = new BehaviorSubject<MapData>(undefined);
  private mapInitialized = false;
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
      this.map.setData(mapData.data);
      if (!this.mapInitialized) {
        if (pathData['map']) {
          this.map.setNormalizedZoom(pathData['map'].zoom);
          this.map.setCenter(pathData['map'].center);
          this.map.setTileLayers(pathData['map'].tileLayers);
        }
        this.mapInitialized = true;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.atlasGrid) {
      const change = changes.atlasGrid;
      this.mapData$.next(this.getMapData(change.currentValue));
    }
  }

  private getMapData(grid: AtlasGrid): MapData {
    return {
      grid,
      data: {
        featureCollection: <any>getFeatureCollection(grid),
        getFeatureStyle: getGetFeatureStyle(grid, this.visualization),
        on: {
          click: (e, d) => {
            this.selectYKJ.emit((<any>d.feature.geometry).coordinateVerbatim);
          }
        }
      }
    };
  }

  onVisualizationChange(v: VisualizationMode) {
    if (v === this.visualization) { return; }
    this.visualization = v;
    const d = this.mapData$.getValue(); // mutate previous mapData for performance reasons
    d.data.getFeatureStyle = getGetFeatureStyle(d.grid, v);
    this.mapData$.next(d);
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
