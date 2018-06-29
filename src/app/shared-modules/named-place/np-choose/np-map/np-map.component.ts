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
import { ExtendedNamedPlace } from '../../model/extended-named-place';
import { LajiMapComponent } from '@laji-map/laji-map.component';

@Component({
  selector: 'laji-np-map',
  templateUrl: './np-map.component.html',
  styleUrls: ['./np-map.component.css']
})
export class NpMapComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(LajiMapComponent) lajiMap: LajiMapComponent;
  @Input() visible = false;
  @Input() namedPlaces: ExtendedNamedPlace[];
  @Input() activeNP: number;
  @Input() height: string;
  @Input() userID: string;
  @Output() onActivePlaceChange = new EventEmitter<number>();
  legend;

  private _data: any;

  private placeColor = '#5294cc';
  private placeActiveColor = '#375577';
  private reservedColor = '#d1c400';
  private reservedActiveColor = '#77720c';
  private mineColor = '#d16e04';
  private mineActiveColor = '#774000';
  private sentColor = '#00aa00';
  private sentActiveColor = '#007700';

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
      let weight = 5;
      if (layer.feature.properties.lajiMapIdx === newActive) {
        color = that.getFeatureColor(layer.feature);
        weight = 10;
      } else if (layer.feature.properties.lajiMapIdx === oldActive) {
        color = that.getFeatureColor(layer.feature, newActive);
      }

      if (color) {
        if (layer.options.icon) {
          const icon = layer.options.icon;
          icon.options.markerColor = color;
          layer.setIcon(icon);
        } else {
          layer.setStyle({color: color, weight: weight});
        }
      }
    });
  }

  private initMapData() {
    if (!this.namedPlaces) {
      return;
    }
    this.legend = {
      [this.placeColor]: 'Vapaa',
      [this.reservedColor]: 'Varattu',
      [this.mineColor]: 'Itselle varattu',
      [this.sentColor]: 'Ilmoitettu'
    };

    try {
      this._data = {
        getFeatureStyle: (o) => {
          const style = {
            weight: 5,
            opacity: 1,
            fillOpacity: 0.3,
            color: ''
          };
          style.color = this.getFeatureColor(o.feature, this.activeNP);
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
            properties: {
              reserved: np._status
            }
          }))
        }
      };
    } catch (e) { }
  }

  private getFeatureColor(feature, active?) {
    switch (feature.properties.reserved) {
      case 'sent':
        return feature.featureIdx === active ? this.sentActiveColor : this.sentColor;
      case 'reserved':
        return feature.featureIdx === active ? this.reservedActiveColor : this.reservedColor;
      case 'mine':
        return feature.featureIdx === active ? this.mineActiveColor : this.mineColor;
      default:
        return feature.featureIdx === active ? this.placeActiveColor : this.placeColor;
    }
  }

}
