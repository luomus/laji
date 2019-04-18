import {
  AfterViewChecked,
  AfterViewInit, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input, NgZone,
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
  private _zoomOnNextTick = false;
  private _lastVisibleActiveNP: number;

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
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.initMapData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['namedPlaces']) {
      this.initMapData();
      this.setMapData();
    }
    if (changes['visible'] && changes['visible'].currentValue === true && this._lastVisibleActiveNP !== this.activeNP) {
      this._zoomOnNextTick = true;
    }
    if (changes['activeNP']) {
      if (this.visible) {
        this._lastVisibleActiveNP = this.activeNP;
      }
      this.setNewActivePlace(changes['activeNP'].currentValue);
    }
  }

  ngAfterViewInit() {
    this.setMapData();
  }

  ngAfterViewChecked() {
    const {nativeElement: popup} = this.popupComponent || {nativeElement: undefined};
    if (popup && this._popupCallback) {
      this._popupCallback(popup);
    }
    if (this._zoomOnNextTick) {
      this._zoomOnNextTick = false;
      if (this.activeNP !== undefined && this.activeNP !== -1) {
        const layer = this.lajiMap.map.getLayerByIdxTuple([0, this.activeNP]);
        if (!layer) {
          return;
        }
        this.lajiMap.map.fitBounds(this.lajiMap.map.getBoundsForLayers([layer]));
      } else if ((this.documentForm.namedPlaceOptions || {}).zoomToData) {
        this.lajiMap.map.zoomToData();
      }
    }
  }

  setMapData() {
    if (this._data && this.lajiMap.map) {
      this.lajiMap.map.setData([this._data]);
    }
  }

  private setNewActivePlace(newActive: number) {
    if (!this.lajiMap.map) { return; }

    this.lajiMap.map.setActive(this.lajiMap.map.getLayerByIdxTuple([0, newActive]));
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
        getFeatureStyle: ({feature, featureIdx, dataIdx, active}) => {
          const style = {
            weight: 5,
            opacity: 1,
            fillOpacity: 0.3,
            color: ''
          };

          if (active) {
            style.color = this.getFeatureColor(feature, true);
            style.weight = 10;
          } else {
            style.color = this.getFeatureColor(feature);
          }
          return style;
        },
        onChange: (events) => {
          events.forEach(e => {
            if (e.type === 'active') {
              this.zone.run(() => {
                this.activePlaceChange.emit(e.idx);
              });
            }
          });
        },
        featureCollection: {
          type: 'FeatureCollection',
          features: this.namedPlaces.map(np => ({
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
        getPopup: ({featureIdx, feature}, cb: (elem: string | HTMLElement) => void) => {
          this.listItems = NpInfoComponent.getListItems(this.placeForm, this.namedPlaces[featureIdx], this.documentForm);
          this._popupCallback = cb;
          this.cdr.markForCheck();
        },
        activeIdx: this.activeNP
      };
    } catch (e) { }
  }

  onPopupClose() {
    this._popupCallback = undefined;
  }

  private getFeatureColor(feature, active?) {
    switch (feature.properties.reserved) {
      case 'sent':
        return active ? this.sentActiveColor : this.sentColor;
      case 'reserved':
        return active ? this.reservedActiveColor : this.reservedColor;
      case 'mine':
        return active ? this.mineActiveColor : this.mineColor;
      default:
        return active ? this.placeActiveColor : this.placeColor;
    }
  }

}
