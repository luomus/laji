import {
  AfterViewInit, ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges,
  ViewChild
} from '@angular/core';
import { LajiMapComponent } from '@laji-map/laji-map.component';
import { LajiMap } from '../../shared-modules/laji-map/laji-map.interface';

@Component({
  selector: 'laji-viewer-map',
  templateUrl: './viewer-map.component.html',
  styleUrls: ['./viewer-map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewerMapComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(LajiMapComponent) lajiMap: LajiMapComponent;
  @Input() data: any;
  @Input() height = 300;
  @Input() visible = true;
  @Input() active = 0;
  @Input() useWorldMap = true;

  _data: any;
  mapOptions: LajiMap.Options = {
    controls: {
      coordinates: false
    },
    zoom: 4
  };

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
    this.setActiveIndex(this.active);
    this.lajiMap.invalidateSize();
  }

  setActiveIndex(idx: number) {
    this.active = idx;
    if (this._data && this._data[idx]) {
      this.lajiMap.map.setData([this._data[idx] || {}]);
      this.lajiMap.map.map.fitBounds(
        this.lajiMap.map.data[0].group.getBounds(),
        {maxZoom: this.lajiMap.map.map.getZoom()}
      );
    } else {
      this.lajiMap.map.setData([]);
    }
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
