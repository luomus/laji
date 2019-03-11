import { Component, OnChanges, Input, AfterViewInit, ViewChild, SimpleChanges } from '@angular/core';
import { LajiMapComponent } from '@laji-map/laji-map.component';
import { LajiMapOptions } from '@laji-map/laji-map.interface';

@Component({
  selector: 'laji-print-map',
  templateUrl: './print-map.component.html',
  styleUrls: ['./print-map.component.css']
})
export class PrintMapComponent implements OnChanges, AfterViewInit {
  @ViewChild(LajiMapComponent) lajiMap: LajiMapComponent;
  @Input() data: any;

  _data: any;
  mapOptions: LajiMapOptions = {viewLocked: true};

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.initData();
    }
  }

  ngAfterViewInit() {
    this.lajiMap.map.setData([this._data || {}]);
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
        features: data.features.map(feat => ({
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
          geometry: data,
        }]
      };
    }
  }
}
