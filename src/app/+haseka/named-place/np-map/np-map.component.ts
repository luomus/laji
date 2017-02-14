import {Component, OnInit, AfterViewInit, Input, Output, ViewChild, SimpleChanges, OnChanges, EventEmitter} from '@angular/core';
import { MapComponent } from '../../../shared/map/map.component';
import { Observable } from 'rxjs/Observable';
import { NamedPlace } from '../../../shared/model/NamedPlace';

@Component({
  selector: 'laji-np-map',
  templateUrl: './np-map.component.html',
  styleUrls: ['./np-map.component.css']
})
export class NpMapComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(MapComponent) lajiMap: MapComponent;
  @Input() visible = false;
  @Input() namedPlaces: NamedPlace[];
  @Input() activeNP: number;
  @Output() onActivePlaceChange = new EventEmitter<NamedPlace>();

  private _data: any;

  constructor() { }

  ngOnInit() {
    this.initMapData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['namedPlaces']) {
      this.initMapData();
    }
    if (changes['activeNP']) {
      const c = changes['activeNP'];
      this.setNewActivePlace(c.previousValue, c.currentValue);
    }
  }

  ngAfterViewInit() {
    this.setMapData();
  }

  setMapData() {
    if (this._data && this.lajiMap.map) {
      this.lajiMap.map.setData([this._data || {}]);

      const geojsonLayer = this.lajiMap.map.dataLayerGroups[0];
      this.lajiMap.map.map.fitBounds(
        geojsonLayer.getBounds(),
        {maxZoom: this.lajiMap.map.map.getZoom()}
      );
      const that = this;
      geojsonLayer.on({
        click: (event) => {
          const idx = event.layer.feature.properties.lajiMapIdx;
          that.onActivePlaceChange.emit(idx);
        }
      })
    }
  }

  private setNewActivePlace(oldActive: number, newActive: number) {
    if (!this.lajiMap.map) return;

    const geojsonLayer = this.lajiMap.map.dataLayerGroups[0];

    geojsonLayer.eachLayer(function (layer) {
      let color = null;
      if(layer.feature.properties.lajiMapIdx == newActive) {
        color = '#007700';
      } else if (oldActive && layer.feature.properties.lajiMapIdx == oldActive) {
        color = '#00aa00';
      }

      if (color) {
        if (layer.feature.geometry.type === 'Point') {
          const icon = layer.options.icon;
          icon.options.markerColor = color;
          layer.setIcon(icon);
        } else {
          layer.setStyle({color: color});
        }
      }
    });

    this.activeNP = newActive;
  }

  private initMapData() {
    if (!this.namedPlaces) {
      return;
    }

    try {
      this._data = {
        getFeatureStyle: (o) => {
          if (this.activeNP == o.feature.properties.lajiMapIdx) {
            return {
              weight: 5,
              opacity: 1,
              fillOpacity: 0.3,
              color: '#007700'
            }
          } else {
            return {
              weight: 5,
              opacity: 1,
              fillOpacity: 0.3,
              color: '#00aa00'
            }
          }
        },
        featureCollection: {
          type: 'FeatureCollection',
          features: this.namedPlaces.map((np, i) => ({
            type: 'Feature',
            geometry: np.geometry,
            properties: { }
          }))
        }
      }
    } catch (e) { }
  }
}
