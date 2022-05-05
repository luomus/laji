import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { LajiMap, DataOptions, TileLayersOptions } from 'laji-map';
import { environment } from 'projects/bird-atlas/src/env/environment';
import { convertYkjToGeoJsonFeature } from 'projects/laji/src/app/root/coordinate-utils';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AtlasGrid, AtlasGridSquare } from '../../../core/atlas-api.service';
import { discreteColorGradient } from './color-math';

type AtlasActivityCategory =
  'MY.atlasActivityCategoryEnum0'
  | 'MY.atlasActivityCategoryEnum1'
  | 'MY.atlasActivityCategoryEnum2'
  | 'MY.atlasActivityCategoryEnum3'
  | 'MY.atlasActivityCategoryEnum4'
  | 'MY.atlasActivityCategoryEnum5';

type ColorMode = 'activityCategory' | 'speciesCount';

interface MapData {
  grid: AtlasGrid;
  data: DataOptions;
};

const acGradient = discreteColorGradient('FAFAD1', '4B57A4', 6);
const scGradient = discreteColorGradient('FAFAD1', '4B57A4', 4);

const atlasActivityCategoryColors: Record<AtlasActivityCategory, string> = ({
  'MY.atlasActivityCategoryEnum0': acGradient[0],
  'MY.atlasActivityCategoryEnum1': acGradient[1],
  'MY.atlasActivityCategoryEnum2': acGradient[2],
  'MY.atlasActivityCategoryEnum3': acGradient[3],
  'MY.atlasActivityCategoryEnum4': acGradient[4],
  'MY.atlasActivityCategoryEnum5': acGradient[5]
});

const getSpeciesCountColor = (speciesCount: number): string => {
  if (speciesCount < 50) { return scGradient[0]; }
  if (speciesCount < 100) { return scGradient[1]; }
  if (speciesCount < 150) { return scGradient[2]; }
  return scGradient[3];
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

const getGetFeatureStyle = (grid: AtlasGrid, colorMode: ColorMode) => (
  (opt) => ({
    weight: 0,
    opacity: 0,
    fillOpacity: .5,
    color: '#' + (
      colorMode === 'activityCategory'
        ? atlasActivityCategoryColors[grid[opt.featureIdx].activityCategory.key]
        : getSpeciesCountColor(grid[opt.featureIdx].speciesCount)
    )
  })
);

const speciesCountLegendLabels = [
  '1-49 lajia',
  '50-99 lajia',
  '100-149 lajia',
  '150+ lajia',
];

const activityCategoryLegendLabels = {
  'MY.atlasActivityCategoryEnum0': 'Ei havaintoja',
  'MY.atlasActivityCategoryEnum1': 'Satunnaishavaintoja',
  'MY.atlasActivityCategoryEnum2': 'Välttävä',
  'MY.atlasActivityCategoryEnum3': 'Tyydyttävä',
  'MY.atlasActivityCategoryEnum4': 'Hyvä',
  'MY.atlasActivityCategoryEnum5': 'Erinomainen'
};

const legends: Record<ColorMode, { color: string; label: string }[]> = {
  speciesCount: Object.entries(scGradient).map(([key, val]) => ({
    color: val,
    label: speciesCountLegendLabels[key]
  })),
  activityCategory: Object.entries(atlasActivityCategoryColors).map(([key, val]) => ({
    color: val,
    label: activityCategoryLegendLabels[key]
  }))
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
    if (environment.production === false) {
      // populate test data
      grid.forEach(g => {
        g.speciesCount = Math.random() * 200;
        const ac = Object.entries(activityCategoryLegendLabels)[Math.round(Math.random() * 5)];
        g.activityCategory = {key: ac[0], value: ac[1]};
      });
    }
    this.mapData$.next(this.getMapData(grid));
  }
  @Output() selectYKJ = new EventEmitter<string>();

  @ViewChild('lajiMap', { static: false }) lajiMapElem: ElementRef;
  private _colorMode: ColorMode = 'activityCategory';
  set colorMode(m: ColorMode) {
    this._colorMode = m;
    const d = this.mapData$.getValue(); // mutate previous mapData for performance reasons
    d.data.getFeatureStyle = getGetFeatureStyle(d.grid, this.colorMode);
    this.mapData$.next(d);
  }
  get colorMode() {
    return this._colorMode;
  }

  legends = legends;

  private mapData$ = new BehaviorSubject<MapData>(undefined);
  private map: any;

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
