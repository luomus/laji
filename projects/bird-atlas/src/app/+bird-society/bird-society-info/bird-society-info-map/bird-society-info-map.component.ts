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
import { getAtlasActivityCategoryColor, getSpeciesCountColor, VisualizationMode } from '../../../shared-modules/map-utils/visualization-mode';

interface MapData {
  grid: AtlasGrid;
  dataOptions: DataOptions;
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

const getFeatureColor = (gridSq: AtlasGridSquare, visualizationMode: VisualizationMode): string => (
  visualizationMode === 'activityCategory'
    ? getAtlasActivityCategoryColor(gridSq.activityCategory.key)
    : getSpeciesCountColor(gridSq.speciesCount)
);
const getGetFeatureStyle = (selectedIdx: number, grid: AtlasGrid, visualizationMode: VisualizationMode) => (
  (opt: GetFeatureStyleOptions): PathOptions => {
    if (opt.featureIdx === selectedIdx) {
      return {
        weight: 2,
        color: '#000000',
        opacity: .6,
        fillColor: '#' + getFeatureColor(grid[opt.featureIdx], visualizationMode),
        fillOpacity: .5
      };
    } else {
      return {
        weight: 1,
        color: '#000000',
        opacity: .2,
        fillColor: '#' + getFeatureColor(grid[opt.featureIdx], visualizationMode),
        fillOpacity: .4
      };
    }
  }
);

@Component({
  selector: 'ba-bird-society-info-map',
  templateUrl: './bird-society-info-map.component.html',
  styleUrls: ['./bird-society-info-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdSocietyInfoMapComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() atlasGrid: AtlasGrid;
  @Input() visualizationMode: VisualizationMode = 'activityCategory';
  @Input() set selectedDataIdx(idx: number) { this.setSelectedDataIdx(idx); };
  get selectedDataIdx() { return this._selectedDataIdx; };
  @Output() selectDataIdx = new EventEmitter<number>();

  @ViewChild('lajiMap', { static: false }) lajiMapElem: ElementRef;

  private map: any;
  private mapData$ = new BehaviorSubject<MapData>(undefined);
  private mapInitialized = false;
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
            atlasGrid: { opacity: .3, visible: true }
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
        } else {
          this.map.zoomToData();
        }
        this.mapInitialized = true;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.atlasGrid?.currentValue) {
      this.mapData$.next({
        grid: changes.atlasGrid.currentValue,
        dataOptions: {
          featureCollection: <any>getFeatureCollection(changes.atlasGrid.currentValue),
          getFeatureStyle: getGetFeatureStyle(this.selectedDataIdx, changes.atlasGrid.currentValue, this.visualizationMode),
          on: {
            click: (e, d) => {
              this.selectDataIdx.emit(d.idx);
            }
          }
        }
      });
    }
    if (changes.visualizationMode?.currentValue) {
      this.triggerFeatureStyleUpdate();
    }
  }

  private setSelectedDataIdx(idx: number) {
    this._selectedDataIdx = idx;
    this.triggerFeatureStyleUpdate();
  }

  private triggerFeatureStyleUpdate() {
    const curr = this.mapData$.getValue();
    this.mapData$.next({grid: curr?.grid, dataOptions: {
      ...curr?.dataOptions,
      getFeatureStyle: getGetFeatureStyle(this.selectedDataIdx, curr?.grid, this.visualizationMode)
    }});
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.popstateService.setPathData(
        { map: { center: this.map.getOption('center'), zoom: this.map.getNormalizedZoom() } }
      );
    }
    this.map?.destroy();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
