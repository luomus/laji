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
import { getFeatureColor, VisualizationMode } from '../../../shared-modules/map-utils/visualization-mode';

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
const getGetFeatureStyle = (grid: AtlasGrid, visualizationMode: VisualizationMode, selectedIdx = -1) => (
  (opt: GetFeatureStyleOptions): PathOptions => {
    const sq: AtlasGridSquare = grid[opt.featureIdx];
    const o: PathOptions = {
      weight: 1,
      color: '#000000',
      opacity: .4,
      fillColor: '#' + getFeatureColor(sq, visualizationMode),
      fillOpacity: .8
    };
    if (
      (visualizationMode === 'activityCategory' && sq.activityCategory.key === 'MY.atlasActivityCategoryEnum0')
      || (visualizationMode === 'speciesCount' && sq.speciesCount === 0)
    ) {
      o['fillOpacity'] = 0;
    }
    if (opt.featureIdx === selectedIdx) {
      o['weight'] = 2;
      o['opacity'] = 1;
    }
    return o;
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
          getFeatureStyle: getGetFeatureStyle(changes.atlasGrid.currentValue, this.visualizationMode, this.selectedDataIdx),
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
      getFeatureStyle: getGetFeatureStyle(curr?.grid, this.visualizationMode, this.selectedDataIdx)
    }});
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.popstateService.setPathData(
        { map: { center: this.map.getOption('center'), zoom: this.map.getNormalizedZoom() } }
      );
      this.map.destroy();
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
