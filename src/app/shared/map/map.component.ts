import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { Logger } from '../logger/logger.service';
import { MapService } from './map.service';
import { LajiExternalService } from '../service/laji-external.service';
import { LajiMapOptions } from './map2.component';
import { UserService } from '../service/user.service';

@Component({
  selector: 'laji-map',
  template: `
<div class="laji-map-wrap" [ngClass]="{'no-controls': !showControls}">
  <div #map class="laji-map"></div>
  <div class="loading-map loading" *ngIf="loading"></div>
  <ng-content></ng-content>
</div>`,
  styleUrls: ['./map.component.css'],
  providers: []
})
export class MapComponent implements OnDestroy, OnChanges, AfterViewInit {

  @Input() data: any = [];
  @Input() drawData: any;
  @Input() visible = true;
  @Input() draw: any = false;
  @Input() lang = 'fi';
  @Input() loading = false;
  @Input() center: [number, number];
  @Input() maxBounds: [[number, number], [number, number]];
  @Input() showControls = true;
  @Input() initWithWorldMap = false;
  @Input() bringDrawLayerToBack = true;
  @Input() zoom = 1;
  @Input() tileOpacity: number;
  @Input() controlSettings: any = {
    draw: false,
    drawCopy: false,
    drawClear: false,
    coordinates: false,
    coordinateInput: false
  };
  @Input() settingsKey: string;
  @Input() overlayNames: string[];

  @Output() select = new EventEmitter();
  @Output() onCreate = new EventEmitter();
  @Output() onMove = new EventEmitter();
  @Output() onFailure =  new EventEmitter();
  @ViewChild('map') elemRef: ElementRef;

  map: any;
  private initEvents = false;
  private failureSend = false;
  private userSettings: any = {};

  constructor(
    private mapService: MapService,
    private logger: Logger,
    private lajiExternalService: LajiExternalService,
    private userService: UserService
  ) {

  }

  ngAfterViewInit() {
    this.userService.getUserSetting(this.settingsKey)
      .subscribe(settings => {
        const draw = this.draw;
        if (this.draw) {
          draw.onChange = draw.onChange || (e => this.onChange(e));
          draw.getDraftStyle = draw.getDraftStyle || this.getDrawingDraftStyle;
          draw.data = draw.data || this.drawData;
          draw.editable = draw.editable !== false ? draw.editable : false;
          draw.marker = draw.marker !== false ? draw.marker : false;
          draw.polygon = draw.polygon !== false ? draw.polygon : false;
          draw.polyline = draw.polyline !== false ? draw.polyline : false;
          draw.hasActive = draw.hasActive !== true ? draw.hasActive : true;
        }
        const mapOptions: LajiMapOptions = {
          tileLayerName: this.initWithWorldMap ? 'openStreetMap' : 'taustakartta',
          zoom: this.zoom,
          center: this.center || [65, 26],
          lang: this.lang,
          data: [],
          draw: draw,
          markerPopupOffset: 5,
          featurePopupOffset: 0,
          rootElem: this.elemRef.nativeElement,
          controlSettings: this.controlSettings,
          overlayNames: this.overlayNames
        };

        if (this.settingsKey) {
          mapOptions.on = {
            tileLayerChange: (event) => {
              this.userSettings.tileLayerName = event.tileLayerName;
              this.userService.setUserSetting(this.settingsKey, this.userSettings);
            },
            tileLayerOpacityChangeEnd: (event) => {
              this.userSettings.tileLayerOpacity = event.tileLayerOpacity;
              this.userService.setUserSetting(this.settingsKey, this.userSettings);
            },
            overlaysChange: (event) => {
              this.userSettings.overlayNames = event.overlayNames;
              this.userService.setUserSetting(this.settingsKey, this.userSettings);
            }
          };
          for (const key in settings) {
            if (settings.hasOwnProperty(key)) {
              mapOptions[key] = settings[key];
            }
          }
        }

        this.map = this.lajiExternalService.getMap(mapOptions);
        this.map.map.on('moveend', _ => {
          this.moveEvent('moveend');
        });
        this.map.map.on('movestart', _ => {
          this.moveEvent('movestart');
        });
        this.initMapOptions();
        this.updateData();
        this.initDrawData();
        this.moveEvent('moveend');
      });
  }

  moveEvent(type: string) {
    this.onMove.emit({
      zoom: this.map.getNormalizedZoom(),
      bounds: this.map.map.getBounds(),
      type: type
    });
  }

  onChange(events) {
    events.map(event => {
      switch (event.type) {
        case 'create':
          this.onCreate.emit(event.feature.geometry);
          break;
        case 'delete':
          this.onCreate.emit();
          break;
        default:
      }
    });
  }

  getDrawingDraftStyle(type): any {
    if (type === 'marker') {
      return {};
    } else {
      return {shapeOptions: {color: '#00aa00', opacity: 1, fillOpacity: 0}};
    }
  }

  drawToMap(type) {
    if (type === 'Coordinates') {
      this.map.openCoordinatesInputDialog();
    } else if (['Rectangle'].indexOf(type) > -1) {
      new (L as any).Draw[type](this.map.map, this.getDrawingDraftStyle(type))
        .enable();
    }
  }

  ngOnDestroy() {
    try {
      this.map.destroy();
    } catch (e) {}
  }

  ngOnChanges(changes) {
    if (changes.tileOpacity) {
      this.initMapOptions();
    }
    if (changes.visible) {
      setTimeout(() => {
        this.invalidateSize();
      }, 200);
    }
    if (changes.data || changes.drawData) {
      this.updateData();
      this.initDrawData();
    }
    if (changes.lang && this.map) {
      this.map.setLang(this.lang);
    }
  }

  invalidateSize() {
    try {
      if (this.map) {
        this.map.map.invalidateSize();
      }
    } catch (e) {
    }
  }

  updateData() {
    if (!this.map || !this.data) {
      return;
    }
    try {
      this.map.setData(this.data);
      if (this.initEvents) {
        return;
      }
      this.initEvents = true;
      this.map.map.addEventListener({
        'draw:drawstop': event => this.mapService.stopDraw()
      });
      this.map.map.addEventListener({
        'draw:drawstart': event => this.mapService.startDraw()
      });
    } catch (err) {
      if (this.failureSend) {
        this.logger.error('Failed to add map data', {error: err && err.message || 'no data' });
      } else {
        this.onFailure.emit(true);
        this.failureSend = true;
      }
    }
  }

  addData(data) {
    this.map.addData(data);
  }

  initDrawData() {
    if (this.map && this.drawData) {
      this.map.setDrawData(this.drawData);
      if (this.bringDrawLayerToBack) {
        this.map.drawLayerGroup.bringToBack();
      }
    }
  }

  initMapOptions() {
    if (!this.map) {
      return;
    }
    if (this.tileOpacity) {
      this.map.tileLayer.setOpacity(this.tileOpacity);
    }
    if (this.maxBounds) {
      this.map.map.setMaxBounds(this.maxBounds);
    }
  }
}
