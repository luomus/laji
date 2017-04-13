import {
  AfterViewInit,
  Component,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { NamedPlace } from '../../../../../shared/model/NamedPlace';
import { MapComponent } from '../../../../../shared/map/map.component';

@Component({
  selector: 'laji-np-info-map',
  templateUrl: './np-info-map.component.html',
  styleUrls: ['./np-info-map.component.css']
})
export class NpInfoMapComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(MapComponent) lajiMap: MapComponent;
  @Input() visible: boolean;
  @Input() namedPlace: NamedPlace;

  private _data: any;
  private resize: any;

  constructor() { }

  ngOnInit() {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['namedPlace']) {
      this.initData();
      this.setData();
    }
  }

  ngAfterViewInit() {
    this.setData();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    clearTimeout(this.resize);
    const that = this;
    this.resize = setTimeout(function(){
      that.setZoom();
    }, 500);
  }

  setData() {
    if (this._data && this.lajiMap.map) {
      this.lajiMap.map.setData([this._data]);

      this.setZoom();
    }
  }

  setZoom() {
    if (this._data && this.lajiMap.map) {
      const geojsonLayer = this.lajiMap.map.dataLayerGroups[0];
      this.lajiMap.map.map.fitBounds(
        geojsonLayer.getBounds(), { maxZoom: 3, padding: [10, 10] });
    }
  }

  initData() {
    if (!this.namedPlace) {
      return;
    }

    this._data = {
      getFeatureStyle: (o) => {
        return {
          weight: 5,
          opacity: 1,
          fillOpacity: 0.3,
          color: '#007700'
        };
      },
      featureCollection: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: this.namedPlace.geometry,
          properties: {}
        }]
      }
    };
  }
}
