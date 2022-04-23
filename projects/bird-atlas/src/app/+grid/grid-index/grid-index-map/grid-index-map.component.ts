import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { TileLayerName, LajiMap } from 'laji-map';
import { convertYkjToGeoJsonFeature } from 'projects/laji/src/app/root/coordinate-utils';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AtlasGrid, AtlasGridSquare } from '../../../core/atlas-api.service';

const gridSqToFeature = (square: AtlasGridSquare) => {
  const latLngStr = square.coordinates.split(':');
  return convertYkjToGeoJsonFeature(latLngStr[0], latLngStr[1]);
};

const getMapData = (grid: AtlasGrid) => ({
  featureCollection: {
    features: [
      ...grid.map(square => gridSqToFeature(square))
    ],
    type: 'FeatureCollection'
  },
  getFeatureStyle: () => ({
    weight: 5,
    opacity: 1,
    fillOpacity: 0.3,
    color: '#00aa00'
  })
});

@Component({
  selector: 'ba-grid-index-map',
  templateUrl: './grid-index-map.component.html',
  styleUrls: ['./grid-index-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridIndexMapComponent implements AfterViewInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  @Input() set atlasGrid(grid: AtlasGrid) {
    this.mapData$.next(getMapData(grid));
  }
  @Output() selectYKJ = new EventEmitter<string>();

  @ViewChild('lajiMap', { static: false }) lajiMapElem: ElementRef;

  private mapData$ = new BehaviorSubject<any>(undefined);
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
      this.map.setData(mapData);
    });
  }

  ngOnDestroy(): void {
    if (this.map) { this.map.destroy(); }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
