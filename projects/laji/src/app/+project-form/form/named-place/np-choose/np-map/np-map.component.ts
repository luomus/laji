import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ExtendedNamedPlace } from '../../model/extended-named-place';
import { LajiMapComponent } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.component';
import { TranslateService } from '@ngx-translate/core';
import { NpInfoComponent } from '../../np-info/np-info.component';
import { NpInfoRow } from '../../np-info/np-info-row/np-info-row.component';
import { LabelPipe } from '../../../../../shared/pipe';
import { AreaNamePipe } from '../../../../../shared/pipe/area-name.pipe';
import { Form } from '../../../../../shared/model/Form';
import { LajiMapVisualization } from '../../../../../shared-modules/legend/laji-map-visualization';
import { TileLayerName, OverlayName } from '@luomus/laji-map/lib/defs';

@Component({
  selector: 'laji-np-map',
  templateUrl: './np-map.component.html',
  styleUrls: ['./np-map.component.css'],
  providers: [ LabelPipe, AreaNamePipe ]
})
export class NpMapComponent implements OnInit, OnChanges {
  @ViewChild(LajiMapComponent, { static: true }) lajiMap!: LajiMapComponent;
  @ViewChild('popup', { static: true }) popupComponent!: ElementRef<HTMLDivElement>;
  @Input() visible = false;
  @Input() namedPlaces?: ExtendedNamedPlace[];
  @Input() activeNP?: number|null;
  @Input() height?: string;
  @Input() userID?: string;
  @Input() reservable?: boolean;
  @Input() placeForm: any;
  @Input({ required: true }) documentForm!: Form.SchemaForm;
  @Output() activePlaceChange = new EventEmitter<number>();

  visualization?: LajiMapVisualization<any>;
  listItems: NpInfoRow[] = [];
  tileLayerName?: TileLayerName;
  overlayNames?: OverlayName[];
  _data: any;
  private _popupCallback?: (elemOrString: HTMLElement | string) => void;
  private _zoomOnNextTick = false;
  private _lastVisibleActiveNP?: number|null;

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
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.initMapData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['namedPlaces']) {
      this.initMapData();
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

  onMapLoad() {
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
      } else if (this.documentForm.options?.namedPlaceOptions?.zoomToData) {
        this.lajiMap.map.zoomToData();
      }
    }
  }

  private setNewActivePlace(newActive: number) {
    if (!this.lajiMap.map) { return; }

    try {
      this.lajiMap.map.setActive(this.lajiMap.map.getLayerByIdxTuple([0, newActive]));
    } catch (e) {}
  }

  private initLegend() {
    if (!this.reservable) {
      return;
    }

    type Counts = {[status in ExtendedNamedPlace['_status'] | 'all']: number};
    // eslint-disable-next-line @typescript-eslint/no-shadow, @typescript-eslint/no-non-null-assertion
    const counts = this.namedPlaces!.reduce<Counts>((counts, np) => ({
        ...counts,
        [np._status]: counts[np._status] + 1,
        all: counts.all + 1
      }),
      {all: 0, free: 0, reserved: 0, mine: 0, sent: 0}
    );
    this.visualization = {
      npVisualization: {
        label: '',
        categories: [
          {
            color: this.placeColor,
            label: `Vapaa ${counts.free} / ${counts.all}`
          },
          {
            color: this.reservedColor,
            label: `Varattu ${counts.reserved} / ${counts.all}`
          },
          {
            color: this.mineColor,
            label: `Itselle varattu ${counts.mine} / ${counts.all}`
          },
          {
            color: this.sentColor,
            label: `Ilmoitettu ${counts.sent} / ${counts.all}`
          }
        ],
        getFeatureStyle: undefined
      }
    };
    this.cdr.markForCheck();
  }

  private initMapData() {
    if (!this.namedPlaces) {
      return;
    }

    this.initLegend();

    const {mapTileLayerName = 'maastokartta', mapOverlayNames, mapCluster = false} = this.documentForm.options?.namedPlaceOptions || {};
    this.tileLayerName = mapTileLayerName as TileLayerName;
    this.overlayNames = mapOverlayNames as OverlayName[];

    try {
      this._data = {
        getFeatureStyle: ({feature, active} = {} as any) => {
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
        onChange: (events: any) => {
          events.forEach((e: any) => {
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
        getPopup: ({featureIdx, feature}: {featureIdx: number; feature: string}, cb: (elem: string | HTMLElement) => void) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.listItems = NpInfoComponent.getListItems(this.placeForm, this.namedPlaces![featureIdx], this.documentForm);
          this._popupCallback = cb;
          this.cdr.markForCheck();
        },
        activeIdx: this.activeNP,
        cluster: mapCluster
      };
    } catch (e) { }
  }

  onPopupClose() {
    this._popupCallback = undefined;
  }

  private getFeatureColor(feature?: any, active?: any) {
    switch (feature?.properties?.reserved) {
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
