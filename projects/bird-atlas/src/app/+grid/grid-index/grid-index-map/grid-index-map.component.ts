import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { TileLayerName, LajiMap, DataOptions } from 'laji-map';
import { convertYkjToGeoJsonFeature } from 'projects/laji/src/app/root/coordinate-utils';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AtlasGrid, AtlasGridSquare } from '../../../core/atlas-api.service';
import { colorGradientLerp } from './color-math';

type AtlasActivityCategory =
  'MY.atlasActivityCategoryEnum0'
  | 'MY.atlasActivityCategoryEnum1'
  | 'MY.atlasActivityCategoryEnum2'
  | 'MY.atlasActivityCategoryEnum3'
  | 'MY.atlasActivityCategoryEnum4'
  | 'MY.atlasActivityCategoryEnum5';

const atlasActivityCategoryColor: Record<AtlasActivityCategory, string> = ((start: string, end: string) => ({
  'MY.atlasActivityCategoryEnum0': colorGradientLerp(start, end, 0/5),
  'MY.atlasActivityCategoryEnum1': colorGradientLerp(start, end, 1/5),
  'MY.atlasActivityCategoryEnum2': colorGradientLerp(start, end, 2/5),
  'MY.atlasActivityCategoryEnum3': colorGradientLerp(start, end, 3/5),
  'MY.atlasActivityCategoryEnum4': colorGradientLerp(start, end, 4/5),
  'MY.atlasActivityCategoryEnum5': colorGradientLerp(start, end, 5/5)
}))('abd1eb', '2691d9');

const LEGEND_MAX_SPECIES = 150;

const speciesCountColor = (speciesCount: number) => colorGradientLerp('FAFAD1', '4B57A4', Math.min(1, speciesCount / LEGEND_MAX_SPECIES));

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

type ColorMode = 'activityCategory' | 'speciesCount';
const getGetFeatureStyle = (grid: AtlasGrid, colorMode: ColorMode) => (
  (opt) => ({
    weight: 2,
    opacity: .5,
    fillOpacity: .5,
    color: '#' + (
      colorMode === 'activityCategory'
        ? atlasActivityCategoryColor[grid[opt.featureIdx].activityCategory.key]
        : speciesCountColor(grid[opt.featureIdx].speciesCount)
    )
  })
);

interface MapData {
  grid: AtlasGrid;
  data: DataOptions;
};

@Component({
  selector: 'ba-grid-index-map',
  templateUrl: './grid-index-map.component.html',
  styleUrls: ['./grid-index-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridIndexMapComponent implements AfterViewInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  @Input() set atlasGrid(grid: AtlasGrid) {
    // randomize species count for testing purposes
/*     grid.forEach(e => e.speciesCount = Math.floor(Math.random() * 150)); */
    this.mapData$.next(this.getMapData(grid));
  }
  @Output() selectYKJ = new EventEmitter<string>();

  @ViewChild('lajiMap', { static: false }) lajiMapElem: ElementRef;
  private _colorMode: ColorMode = 'speciesCount';
  set colorMode(m: ColorMode) {
    this._colorMode = m;
    const d = this.mapData$.getValue(); // mutate previous mapData for performance reasons
    d.data.getFeatureStyle = getGetFeatureStyle(d.grid, this.colorMode);
    this.mapData$.next(d);
  }
  get colorMode() {
    return this._colorMode;
  }

  private mapData$ = new BehaviorSubject<MapData>(undefined);
  private map: any;

  constructor(
    private zone: NgZone
  ) {
    this.zone.runOutsideAngular(() => {
      this.map = new LajiMap({
        tileLayerName: TileLayerName.maastokartta,
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

  private getMapData(grid: AtlasGrid): MapData {
    return {
      grid,
      data: {
        featureCollection: <any>getFeatureCollection(grid),
        getFeatureStyle: getGetFeatureStyle(grid, this.colorMode),
        on: {
          click: (e, d) => {
            this.selectYKJ.emit((<any>d.feature.geometry).coordinateVerbatim);
          }
        }
      }
    };
  }

  ngOnDestroy(): void {
    if (this.map) { this.map.destroy(); }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
