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
  private viewIsInitialized = false;

  constructor() { }

  ngOnInit() {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['namedPlace'] && this.viewIsInitialized) {
      this.initData();
      this.setData();
    }
  }

  ngAfterViewInit() {
    this.setData();
    this.viewIsInitialized = true;
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
      const geojsonLayer = this.lajiMap.map.data[0].group;

      this.lajiMap.map.map.fitBounds(
        geojsonLayer.getBounds(), { maxZoom: 4 });
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
          geometry: this.getGeometry(),
          properties: {}
        }]
      }
    };
  }

  private getGeometry() {
    if (this.namedPlace.prepopulatedDocument && this.namedPlace.prepopulatedDocument.gatherings) {
      const geometries = this.namedPlace.prepopulatedDocument.gatherings.reduce((prev, curr) => {
        if (curr.geometry) {
          prev.push(curr.geometry);
        }
        return prev;
      }, []);
      if (geometries.length === 1) {
        return geometries[0];
      } else if (geometries.length === 1) {
        return {
          type: 'GeometryCollection',
          geometries: geometries
        };
      }
    }
    return this.namedPlace.geometry;
  }
}
