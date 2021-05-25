import { Component, ChangeDetectionStrategy, ViewChild, Input } from '@angular/core';
import { LajiMapComponent } from '@laji-map/laji-map.component';
import { LajiMapOptions, LajiMapTileLayerName, LajiMapDataOptions } from '@laji-map/laji-map.interface';
import { Geometry } from 'geojson';

@Component({
  selector: 'laji-audio-info-map',
  templateUrl: './audio-info-map.component.html',
  styleUrls: ['./audio-info-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioInfoMapComponent {
  @ViewChild(LajiMapComponent, { static: true }) lajiMap: LajiMapComponent;
  @Input() color = '#00aa00';

  mapOptions: LajiMapOptions = {
    tileLayerName: LajiMapTileLayerName.laser,
    controls: { location: false },
    zoomToData: { maxZoom: 13 }
  };

  data: LajiMapDataOptions;

  @Input() set geometry(geometry: Geometry) {
    this.data = this.getData(geometry);
  }

  getData(geometry: Geometry): LajiMapDataOptions {
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
        features: [{
          type: 'Feature',
          geometry: geometry,
          properties: {}
        }]
      }
    };
  }
}
