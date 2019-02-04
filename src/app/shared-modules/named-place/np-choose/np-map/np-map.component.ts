import {
  AfterViewChecked,
  AfterViewInit, ChangeDetectorRef,
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
import { TranslateService } from '@ngx-translate/core';
import { Logger } from 'app/shared/logger';
import { LabelPipe } from 'app/shared/pipe';
import { AreaNamePipe } from 'app/shared/pipe/area-name.pipe';
import { NpInfoComponent } from '../../np-edit/np-info/np-info.component';
import { NpInfoRow } from '../../np-edit/np-info/np-info-row/np-info-row.component';

@Component({
  selector: 'laji-np-map',
  templateUrl: './np-map.component.html',
  styleUrls: ['./np-map.component.css'],
  providers: [ LabelPipe, AreaNamePipe ]
})
export class NpMapComponent implements OnInit, OnChanges, AfterViewInit, AfterViewChecked {
  @ViewChild(LajiMapComponent) lajiMap: LajiMapComponent;
  @ViewChild('popup') popupComponent;
  @Input() visible = false;
  @Input() namedPlaces: ExtendedNamedPlace[];
  @Input() activeNP: number;
  @Input() height: string;
  @Input() userID: string;
  @Input() reservable: boolean;
  @Input() placeForm: any;
  @Input() documentForm: any;
  @Input() mapOptions: any;
  @Output() activePlaceChange = new EventEmitter<number>();

  legend;
  listItems: NpInfoRow[] = [];
  tileLayerName;
  overlayNames;
  private _data: any;
  private _popupCallback: (elemOrString: HTMLElement | string) => void;

  private placeColor = '#5294cc';
  private placeActiveColor = '#375577';
  private reservedColor = '#d1c400';
  private reservedActiveColor = '#77720c';
  private mineColor = '#d16e04';
  private mineActiveColor = '#774000';
  private sentColor = '#00aa00';
  private sentActiveColor = '#007700';

  constructor(
    public translate: TranslateService,
    private logger: Logger,
    private labelPipe: LabelPipe,
    private areaNamePipe: AreaNamePipe,
    private cdr: ChangeDetectorRef,
  ) { }

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
    this.setNewActivePlace(-1, this.activeNP);
  }

  ngAfterViewChecked() {
    const {nativeElement: popup} = this.popupComponent || {nativeElement: undefined};
    if (popup && this._popupCallback) {
      this._popupCallback(popup);
    }
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
    if (this.reservable) {
      this.legend = {
        [this.placeColor]: 'Vapaa',
        [this.reservedColor]: 'Varattu',
        [this.mineColor]: 'Itselle varattu',
        [this.sentColor]: 'Ilmoitettu'
      };
    }

    const {mapTileLayerName = 'maastokartta', mapOverlayNames} = this.documentForm.namedPlaceOptions || {mapOverlayNames: undefined};
    this.tileLayerName = mapTileLayerName;
    this.overlayNames = mapOverlayNames;

    try {
      this._data = {
        getFeatureStyle: (o) => {
          const style = {
            weight: 5,
            opacity: 1,
            fillOpacity: 0.3,
            color: ''
          };

          if (o.feature.properties.lajiMapIdx === this.activeNP) {
            style.color = this.getFeatureColor(o.feature);
            style.weight = 10;
          } else {
            style.color = this.getFeatureColor(o.feature, this.activeNP);
          }
          return style;
        },
        on: {
          click: (e, o) => {
            this.activePlaceChange.emit(o.idx);
          }
        },
        featureCollection: {
          type: 'FeatureCollection',
          features: this.namedPlaces.map((np, i) => ({
            type: 'Feature',
            geometry: np.geometry,
            properties: {
              reserved: np._status,
              name: np.name,
              municipality: np.municipality,
              taxon: np.taxonIDs
            }
          }))
        },
        getPopup: (idx: number, geo, cb: (elem: string | HTMLElement) => void) => {
          this.listItems = NpInfoComponent.getListItems(this.placeForm, this.namedPlaces[idx], this.documentForm);
          this._popupCallback = cb;
          this.cdr.markForCheck();
        }
      };
    } catch (e) { }
  }

  onPopupClose() {
    this._popupCallback = undefined;
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
