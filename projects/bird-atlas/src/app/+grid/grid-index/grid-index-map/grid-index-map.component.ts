import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input,
  NgZone, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { LajiMap, DataOptions, TileLayersOptions, Lang } from 'laji-map';
import { PathOptions } from 'leaflet';
import { environment } from 'projects/bird-atlas/src/env/environment';
import { convertYkjToGeoJsonFeature } from 'projects/laji/src/app/root/coordinate-utils';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AtlasActivityCategory, AtlasGrid, AtlasGridSquare } from '../../../core/atlas-api.service';
import { getAtlasActivityCategoryColor, getSpeciesCountColor, VisualizationMode } from '../../../shared-modules/map-utils/visualization-mode';

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
const getGetFeatureStyle = (grid: AtlasGrid, visualizationMode: VisualizationMode) => (
  (opt): PathOptions => ({
    weight: 0,
    opacity: 0,
    fillOpacity: .5,
    color: '#' + (
      visualizationMode === 'activityCategory'
        ? getAtlasActivityCategoryColor(grid[opt.featureIdx].activityCategory.key)
        : getSpeciesCountColor(grid[opt.featureIdx].speciesCount)
    )
  })
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
  private unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone
  ) {
    this.zone.runOutsideAngular(() => {
      this.map = new LajiMap({
        tileLayers: <TileLayersOptions>{
          layers: {
            taustakartta: { opacity: 1, visible: true },
            atlasGrid: { opacity: 1, visible: true }
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
    this.map.setRootElem(this.lajiMapElem.nativeElement);
    this.mapData$.pipe(
      takeUntil(this.unsubscribe$),
      filter(d => d !== undefined)
    ).subscribe(mapData => {
      this.map.setData(mapData.data);
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
    this.map?.destroy();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
