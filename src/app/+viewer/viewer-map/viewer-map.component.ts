import { Component, OnInit, Input, OnChanges, ViewChild, AfterViewInit, SimpleChanges } from '@angular/core';
import { MapComponent } from '../../shared/map/map.component';

@Component({
  selector: 'laji-viewer-map',
  templateUrl: './viewer-map.component.html',
  styleUrls: ['./viewer-map.component.css']
})
export class ViewerMapComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(MapComponent) lajiMap: MapComponent;
  @Input() data: any;
  @Input() height = 300;
  @Input() visible = true;

  public _data: any;

  constructor() { }

  ngOnInit() {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.initData();
    }
  }

  ngAfterViewInit() {
    if (this.lajiMap && this.lajiMap.map.dataLayerGroups && this.lajiMap.map.dataLayerGroups[0]) {
      this.lajiMap.map.map.fitBounds(this.lajiMap.map.dataLayerGroups[0].getBounds(), {maxZoom: 5});
      this.lajiMap.invalidateSize();
    }
  }

  setActiveIndex(idx: number) {
    this.lajiMap.map.setActive(idx);
  }

  private initData() {
    if (!this.data) {
      return;
    }
    try {
      this._data = this.data.map(set => ({
        getFeatureStyle: () => ({
          weight: 5,
          opacity: 1,
          fillOpacity: 0.3,
          color: '#00aa00'
        }),
        featureCollection: {
          type: set.type,
          features: set.features.map(feat => ({
            type: feat.type,
            geometry: feat.geometry,
            properties: {}
          }))
        }
      }));
    } catch (e) { }
  }

}
