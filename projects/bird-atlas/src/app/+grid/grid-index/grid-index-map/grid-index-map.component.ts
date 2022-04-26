import { E } from '@angular/cdk/keycodes';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { TileLayerName, LajiMap, DataOptions } from 'laji-map';
import { convertYkjToGeoJsonFeature } from 'projects/laji/src/app/root/coordinate-utils';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AtlasGrid, AtlasGridSquare } from '../../../core/atlas-api.service';

const gridSqToFeature = (square: AtlasGridSquare) => {
  const latLngStr = square.coordinates.split(':');
  return convertYkjToGeoJsonFeature(latLngStr[0], latLngStr[1]);
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
    this.mapData$.next(this.getMapData(grid));
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

  getMapData(grid: AtlasGrid): DataOptions {
    return {
      featureCollection: {
        features: [
          ...grid.map(square => <any>gridSqToFeature(square))
        ],
        type: 'FeatureCollection'
      },
      getFeatureStyle: () => ({
        weight: 2,
        opacity: 1,
        fillOpacity: 0.2,
        color: '#2691d9'
      }),
      on: {
        click: (e, d) => {
          this.selectYKJ.emit((<any>d.feature.geometry).coordinateVerbatim);
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
