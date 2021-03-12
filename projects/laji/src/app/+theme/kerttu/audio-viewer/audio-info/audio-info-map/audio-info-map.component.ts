import {Component, OnInit, ChangeDetectionStrategy, ViewChild, Input, SimpleChanges, HostListener, OnChanges} from '@angular/core';
import {LajiMapComponent} from '@laji-map/laji-map.component';
import {LajiMapOptions} from '@laji-map/laji-map.interface';

@Component({
  selector: 'laji-audio-info-map',
  templateUrl: './audio-info-map.component.html',
  styleUrls: ['./audio-info-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioInfoMapComponent implements OnInit, OnChanges {
  @ViewChild(LajiMapComponent, { static: true }) lajiMap: LajiMapComponent;

  @Input() geometry: any;

  mapOptions: LajiMapOptions = {
    controls: { location: false }
  };

  private _data: any;
  private resize: any;

  constructor(

  ) { }

  ngOnInit() {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initData();
    this.setData();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    clearTimeout(this.resize);
    const that = this;
    this.resize = setTimeout(function() {
      that.setZoom();
    }, 500);
  }

  onMapLoad() {
    this.setData();
  }

  setData() {
    if (this._data && this.lajiMap.map) {
      try {
        this.lajiMap.map.setData([this._data]);
      } catch (e) {}
      this.setZoom();
    }
  }

  setZoom() {
    try {
      if (this._data && this.lajiMap.map) {
        this.lajiMap.map.zoomToData({maxZoom: 3});
      }
    } catch (e) {}
  }

  initData() {
    if (!this.geometry) {
      return;
    }

    this._data = {
      getFeatureStyle: () => {
        return {
          weight: 2,
          opacity: 1,
          fillOpacity: 0,
          color: '#00aa00'
        };
      },
      featureCollection: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: this.geometry,
          properties: {}
        }]
      }
    };
  }
}
