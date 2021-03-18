import {Component, ChangeDetectionStrategy, ViewChild, Input} from '@angular/core';
import {LajiMapComponent} from '@laji-map/laji-map.component';
import {LajiMapOptions} from '@laji-map/laji-map.interface';
import {GeoJSON} from 'geojson';
import { TileLayerName } from 'laji-map';

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
    tileLayerName: TileLayerName.laser,
    controls: { location: false },
    zoomToData: { maxZoom: 13 }
  };

  data: any;

  @Input() set geometry(geometry: GeoJSON.Geometry) {
    this.data = this.getData(geometry);
  }

  constructor() { }

  getData(geometry: GeoJSON.Geometry) {
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
