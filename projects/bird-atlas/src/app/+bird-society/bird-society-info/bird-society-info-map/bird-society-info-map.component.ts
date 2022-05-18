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

interface MapData {
  grid: AtlasGrid;
  data: DataOptions;
  zoomToData: boolean;
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
const getGetFeatureStyle = (selectedIdx: number) => (
  (opt: GetFeatureStyleOptions): PathOptions => {
    if (opt.featureIdx === selectedIdx) {
      return {
        weight: 2,
        color: '#000000',
        opacity: .6,
        fillColor: '#ff00ff',
        fillOpacity: .5
      };
    } else {
      return {
        weight: 1,
        color: '#000000',
        opacity: .2,
        fillColor: '#ff00ff',
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
  @Input() set selectedDataIdx(idx: number) { this.setSelectedDataIdx(idx); };
  get selectedDataIdx() { return this._selectedDataIdx; };
  @Output() selectDataIdx = new EventEmitter<number>();

  @ViewChild('lajiMap', { static: false }) lajiMapElem: ElementRef;

  private map: any;
  private mapData$ = new BehaviorSubject<MapData>(undefined);
  private _selectedDataIdx = -1;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone
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
    this.map.setRootElem(this.lajiMapElem.nativeElement);
    this.mapData$.pipe(
      takeUntil(this.unsubscribe$),
      filter(d => d !== undefined)
    ).subscribe(mapData => {
      this.map.setData(mapData.data);
      if (mapData.zoomToData) {
        this.map.zoomToData();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.atlasGrid?.currentValue) {
      this.mapData$.next({
        grid: changes.atlasGrid.currentValue,
        zoomToData: true,
        data: {
          featureCollection: <any>getFeatureCollection(changes.atlasGrid.currentValue),
          getFeatureStyle: getGetFeatureStyle(this.selectedDataIdx),
          on: {
            click: (e, d) => {
              this.selectDataIdx.emit(d.idx);
            }
          }
        }
      });
    }
  }

  private setSelectedDataIdx(idx: number) {
    this._selectedDataIdx = idx;
    const curr = this.mapData$.getValue();
    this.mapData$.next({grid: curr?.grid, zoomToData: false, data: {
      ...curr?.data,
      getFeatureStyle: getGetFeatureStyle(idx)
    }});
  }

  ngOnDestroy(): void {
    this.map?.destroy();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
