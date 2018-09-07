import { AfterViewInit, Component, HostListener, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NamedPlace } from '../../../../../shared/model/NamedPlace';
import { LajiMapComponent } from '@laji-map/laji-map.component';
import { TranslateService } from '@ngx-translate/core';
import { LajiMapOptions, LajiMapTileLayerName } from '@laji-map/laji-map.interface';

@Component({
  selector: 'laji-np-info-map',
  templateUrl: './np-info-map.component.html',
  styleUrls: ['./np-info-map.component.css']
})
export class NpInfoMapComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(LajiMapComponent) lajiMap: LajiMapComponent;
  @Input() visible: boolean;
  @Input() namedPlace: NamedPlace;

  mapOptions: LajiMapOptions = {
    tileLayerName: LajiMapTileLayerName.maastokartta,
    tileLayerOpacity: 0.5,
    controls: {location: false}
  };

  private _data: any;
  private resize: any;
  private viewIsInitialized = false;

  constructor(
    public translate: TranslateService
  ) { }

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
    this.resize = setTimeout(function() {
      that.setZoom();
    }, 500);
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
        this.lajiMap.map.zoomToData();
      }
    } catch (e) {}
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
    if (this.namedPlace.acceptedDocument && this.namedPlace.acceptedDocument.gatherings) {
      const geometries = this.namedPlace.acceptedDocument.gatherings.reduce((prev, curr) => {
        if (curr.geometry) {
          prev.push(curr.geometry);
        }
        return prev;
      }, []);
      if (geometries.length === 1) {
        return geometries[0];
      } else if (geometries.length > 1) {
        return {
          type: 'GeometryCollection',
          geometries: geometries
        };
      }
    }
    if (this.namedPlace.prepopulatedDocument && this.namedPlace.prepopulatedDocument.gatherings) {
      const geometries = this.namedPlace.prepopulatedDocument.gatherings.reduce((prev, curr) => {
        if (curr.geometry) {
          prev.push(curr.geometry);
        }
        return prev;
      }, []);
      if (geometries.length === 1) {
        return geometries[0];
      } else if (geometries.length > 1) {
        return {
          type: 'GeometryCollection',
          geometries: geometries
        };
      }
    }
    return this.namedPlace.geometry;
  }
}
