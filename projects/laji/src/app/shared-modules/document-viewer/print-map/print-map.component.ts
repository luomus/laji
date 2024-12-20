import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { LajiMapComponent } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.component';
import type { Options } from '@luomus/laji-map';

@Component({
  selector: 'laji-print-map',
  templateUrl: './print-map.component.html',
  styleUrls: ['./print-map.component.css']
})
export class PrintMapComponent implements OnChanges {
  @ViewChild(LajiMapComponent, { static: true }) lajiMap!: LajiMapComponent;
  @Input() data: any;

  _data: any;
  mapOptions: Options = {viewLocked: true};

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.initData();
    }
  }

  onMapLoad() {
    this.lajiMap.map.setData([this._data || {}]);
    this.lajiMap.map.zoomToData({maxZoom: 4});
  }

  private initData() {
    if (!this.data) {
      return;
    }
    try {
      this._data = {
        getFeatureStyle: () => ({
          weight: 5,
          opacity: 1,
          fillOpacity: 0.3,
          color: '#00aa00'
        }),
        featureCollection: this.getFeatureCollection(this.data)
      };
    } catch (e) { }
  }

  private getFeatureCollection(data: any) {
    if (data.features) {
      return {
        type: data.type,
        features: data.features.map((feat: any) => ({
          type: feat.type,
          geometry: feat.geometry,
          properties: {}
        }))

      };
    } else {
      return {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: data.geoJSON ? data.geoJSON : data,
        }]
      };
    }
  }
}
