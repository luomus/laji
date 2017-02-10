import {Component, OnInit, AfterViewInit, Input, ViewChild, SimpleChanges, OnChanges} from '@angular/core';
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
  @Input() namedPlaces: NamedPlace[];
  @Input() activeNP: number;

  private currentActiveNP: number;
  private _data: any;

  constructor() { }

  ngOnInit() {
    this.initMapData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['namedPlaces']) {
      this.initMapData();
    }
    this.setActiveNP();
  }

  ngAfterViewInit() {
    this.setActiveNP();
  }

  setActiveNP() {
    if (this.activeNP == this.currentActiveNP) return;

    if (this._data && this._data[this.activeNP] && this.lajiMap.map) {
      this.currentActiveNP = this.activeNP;
      this.lajiMap.map.setData([this._data[this.activeNP] || {}]);
      this.lajiMap.map.map.fitBounds(
        this.lajiMap.map.dataLayerGroups[0].getBounds(),
        {maxZoom: this.lajiMap.map.map.getZoom()}
      );
    }
  }

  private initMapData() {
    if (!this.namedPlaces) {
      return;
    }

    try {
      this._data = this.namedPlaces.map(np => ({
        getFeatureStyle: () => ({
          weight: 5,
          opacity: 1,
          fillOpacity: 0.3,
          color: '#00aa00'
        }),
        featureCollection: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: np.geometry,
            properties: {}
          }]
        }
      }))
    } catch (e) { }
  }
}
