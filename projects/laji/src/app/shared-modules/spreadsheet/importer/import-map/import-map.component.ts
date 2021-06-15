import { Component, ChangeDetectionStrategy, ViewChild, Input, OnChanges } from '@angular/core';
import { LajiMapComponent } from '@laji-map/laji-map.component';
import { LajiMapOptions, LajiMapTileLayerName, LajiMapDataOptions } from '@laji-map/laji-map.interface';
import * as Hash from 'object-hash';

@Component({
  selector: 'laji-import-map',
  templateUrl: './import-map.component.html',
  styleUrls: ['./import-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportMapComponent implements OnChanges {
  @ViewChild(LajiMapComponent, { static: true }) lajiMap: LajiMapComponent;
  @Input() data: {[key: string]: any}[] = [];
  @Input() colMap: {[key: string]: string} = {};
  @Input() geometryField = 'gatherings[*].geometry';
  @Input() color = '#00aa00';
  @Input() height = '100%';

  mapOptions: LajiMapOptions = {
    tileLayerName: LajiMapTileLayerName.maastokartta,
    tileLayerOpacity: 0.5,
    controls: { location: false },
    zoomToData: { maxZoom: 13 },
    popupOnHover: true
  };

  mapData: LajiMapDataOptions;

  ngOnChanges() {
    this.mapData = this.getMapData();
  }

  getMapData(): LajiMapDataOptions {
    const geometryCol = Object.keys(this.colMap).filter(col => this.colMap[col] === this.geometryField)?.[0];
    if (!geometryCol) {
      return {};
    }

    const geometries = {};
    this.data.forEach((dataItem) => {
      const geometry = dataItem[geometryCol];
      if (!geometry) {
        return;
      }
      const hash = Hash.sha1(geometry);
      if (!geometries[hash]) {
        geometries[hash] = geometry;
      }
    });

    return {
      getFeatureStyle: () => {
        return {
          weight: 2,
          opacity: 1,
          fillOpacity: 0,
          color: this.color
        };
      },
      featureCollection: {
        type: 'FeatureCollection',
        features: Object.keys(geometries).map(hash => ({
          type: 'Feature',
          geometry: geometries[hash]
        }))
      }
    };
  }
}
