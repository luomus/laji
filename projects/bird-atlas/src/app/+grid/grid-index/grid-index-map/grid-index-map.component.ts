import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input,
  NgZone, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { LajiMap, DataOptions, TileLayersOptions, Lang } from 'laji-map';
import { environment } from 'projects/bird-atlas/src/env/environment';
import { convertYkjToGeoJsonFeature } from 'projects/laji/src/app/root/coordinate-utils';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AtlasGrid, AtlasGridSquare } from '../../../core/atlas-api.service';

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

// Performance optimization: precomputing gradients
// import { discreteColorGradient } from './color-math';
// const acGradient = discreteColorGradient('FAFAD1', '4B57A4', 6);
// const scGradient = discreteColorGradient('FAFAD1', '4B57A4', 4);
const acGradient = ['fafad1', 'cbf2ad', '8ee59a', '72d5b9', '59a3c2', '4b57a4'];
const scGradient = ['fafad1', '9bea98', '69cfc6', '4b57a4'];

const getAtlasActivityCategoryColor = (ac: AtlasActivityCategory): string => ({
  'MY.atlasActivityCategoryEnum0': acGradient[0],
  'MY.atlasActivityCategoryEnum1': acGradient[1],
  'MY.atlasActivityCategoryEnum2': acGradient[2],
  'MY.atlasActivityCategoryEnum3': acGradient[3],
  'MY.atlasActivityCategoryEnum4': acGradient[4],
  'MY.atlasActivityCategoryEnum5': acGradient[5]
}[ac]);
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
        ? getAtlasActivityCategoryColor(<AtlasActivityCategory>grid[opt.featureIdx].activityCategory.key)
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
const activityCategoryLegendLabels = [
  'Ei havaintoja',
  'Satunnaishavaintoja',
  'Välttävä',
  'Tyydyttävä',
  'Hyvä',
  'Erinomainen'
];
const legends: Record<ColorMode, { color: string; label: string }[]> = {
  speciesCount: Object.entries(scGradient).map(([key, val]) => ({
    color: val,
    label: speciesCountLegendLabels[key]
  })),
  activityCategory: Object.entries(acGradient).map(([key, val]) => ({
    color: val,
    label: activityCategoryLegendLabels[key]
  }))
};

const populateTestData = (atlasGrid: AtlasGrid) => {
  atlasGrid.forEach(g => {
    g.speciesCount = Math.random() * 200;
    const ac = Object.entries([
      'MY.atlasActivityCategoryEnum0', 'MY.atlasActivityCategoryEnum1',
      'MY.atlasActivityCategoryEnum2', 'MY.atlasActivityCategoryEnum3',
      'MY.atlasActivityCategoryEnum4', 'MY.atlasActivityCategoryEnum5'
    ])[Math.round(Math.random() * 5)];
    g.activityCategory = {key: ac[1], value: undefined};
  });
};

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

  legends = legends;
  get colorMode() { return this._colorMode; }
  set colorMode(m: ColorMode) { this.setColorMode(m); }

  private map: any;
  private mapData$ = new BehaviorSubject<MapData>(undefined);
  private unsubscribe$ = new Subject<void>();
  private _colorMode: ColorMode = 'activityCategory';

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
      if (environment.production === false) {
        populateTestData(change.currentValue);
      }
      this.mapData$.next(this.getMapData(change.currentValue));
    }
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

  private setColorMode(m: ColorMode) {
    this._colorMode = m;
    const d = this.mapData$.getValue(); // mutate previous mapData for performance reasons
    d.data.getFeatureStyle = getGetFeatureStyle(d.grid, this.colorMode);
    this.mapData$.next(d);
  }

  ngOnDestroy(): void {
    this.map?.destroy();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
