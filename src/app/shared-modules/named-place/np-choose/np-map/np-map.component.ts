import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MapComponent } from '../../../../shared/map/map.component';
import { NamedPlace } from '../../../../shared/model/NamedPlace';

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
  @Input() height: string;
  @Output() onActivePlaceChange = new EventEmitter<number>();

  private _data: any;

  private placeColor = '#00aa00';
  private activePlaceColor = '#007700';

  constructor() { }

  ngOnInit() {
    this.initMapData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['namedPlaces']) {
      this.initMapData();
      this.setMapData();
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
      this.lajiMap.map.setData([this._data]);
    }
  }

  private setNewActivePlace(oldActive: number, newActive: number) {
    if (!this.lajiMap.map) { return; }

    const geojsonLayer = this.lajiMap.map.data[0].group;

    const that = this;
    geojsonLayer.eachLayer(function (layer) {
      let color = null;
      if (layer.feature.properties.lajiMapIdx === newActive) {
        color = that.activePlaceColor;
      } else if (layer.feature.properties.lajiMapIdx === oldActive) {
        color = that.placeColor;
      }

      if (color) {
        if (layer.options.icon) {
          const icon = layer.options.icon;
          icon.options.markerColor = color;
          layer.setIcon(icon);
        } else {
          layer.setStyle({color: color});
        }
      }
    });
  }

  private initMapData() {
    if (!this.namedPlaces) {
      return;
    }

    try {
      this._data = {
        getFeatureStyle: (o) => {
          const style = {
            weight: 5,
            opacity: 1,
            fillOpacity: 0.3,
            color: ''
          };

          style.color = o.featureIdx === this.activeNP ? this.activePlaceColor : this.placeColor;

          return style;
        },
        on: {
          click: (e, o) => {
            this.onActivePlaceChange.emit(o.idx);
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
      };
    } catch (e) { }
  }
}
