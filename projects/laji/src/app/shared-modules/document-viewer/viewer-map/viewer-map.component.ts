import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { LajiMapComponent } from '../../laji-map/laji-map.component';
import { LajiMapOptions } from '../../laji-map/laji-map.interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-viewer-map',
  templateUrl: './viewer-map.component.html',
  styleUrls: ['./viewer-map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewerMapComponent implements OnInit, OnChanges {
  @ViewChild(LajiMapComponent, { static: true }) lajiMap: LajiMapComponent;
  @Input() data: {
    geoJSON: any;
    wgs84: any;
    ykj: any;
    sourceOfCoordinates: any;
    coordinateAccuracy: any;
    wgs84CenterPoint: any;
    ykj1km: any;
    ykj1kmCenter: any;
    ykj10km: any;
    ykj10kmCenter: any;
  }[];
  @Input() height = 300;
  @Input() visible = true;
  @Input() active = 0;
  @Input() useWorldMap = true;
  @Input() settingsKey: any;
  @Input() hideCoordinates: boolean;
  @Input() zoomToData = false;

  _data: any;
  mapOptions: LajiMapOptions;

  constructor(
    public translate: TranslateService
  ) { }

  ngOnInit() {
    this.mapOptions = {
      controls: {
        coordinates: false,
        draw: {
          copy: true
        }
      },
      draw: {
        editable: false
      },
      zoom: 4,
      zoomToData: this.zoomToData
    };
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.initData();
    }
  }

  onMapLoad() {
    this.setActiveIndex(this.active);
    this.lajiMap.invalidateSize();
  }

  setActiveIndex(idx: number) {
    this.active = idx;
    if (!this.lajiMap.map) {
      return;
    }
    if (this.data[0].geoJSON && this._data.featureCollection !== this.getFeatureCollection(this.data[0].geoJSON) ) {
      this.initData();
    }
    if (this._data && this._data[idx]) {
      this.lajiMap.map.setDraw({...(<any> this.mapOptions.draw), ...(this._data[idx] || {})});
      const zoomToDataOptions = this.zoomToData ? {padding: [10, 10]} : {maxZoom: this.lajiMap.map.getNormalizedZoom()};
      this.lajiMap.map.zoomToData(zoomToDataOptions);
    } else {
      this.lajiMap.map.setDraw(this.mapOptions.draw);
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
        featureCollection: this.getFeatureCollection(set.geoJSON)
      }));
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
