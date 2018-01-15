import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Logger } from '../logger/logger.service';
import { MapService } from './map.service';
import { LajiExternalService } from '../service/laji-external.service';
import { USER_INFO, UserService } from '../service/user.service';
import { LajiMapOptions } from '../../shared-modules/map/map-options.interface';

@Component({
  selector: 'laji-map',
  template: `
<div class="laji-map-wrap" [ngClass]="{'no-controls': !showControls}">
  <div #map class="laji-map"></div>
  <div class="loading-map loading" *ngIf="loading"></div>
  <ng-content></ng-content>
</div>`,
  styleUrls: ['./map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: []
})
export class MapComponent implements OnDestroy, OnChanges, OnInit, AfterViewInit {

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
    draw: false
  };
  @Input() settingsKey: string;
  @Input() tileLayerName: string;
  @Input() overlayNames: string[];
  @Input() availableTileLayerNamesBlacklist: string[];

  @Output() select = new EventEmitter();
  @Output() onCreate = new EventEmitter();
  @Output() onMove = new EventEmitter();
  @Output() onFailure =  new EventEmitter();
  @ViewChild('map') elemRef: ElementRef;

  map: any;
  private initEvents = false;
  private failureSend = false;
  private userSettings: any = {};
  private settings: any;

  constructor(
    private mapService: MapService,
    private logger: Logger,
    private lajiExternalService: LajiExternalService,
    private userService: UserService,
    private cd: ChangeDetectorRef
  ) {

  }

  ngOnInit() {
    this.userService.getUserSetting(this.settingsKey)
      .merge(this.userService.action$
        .filter(action => action === USER_INFO)
        .switchMap(() => this.userService.getUserSetting(this.settingsKey))
      )
      .subscribe(settings => {
        this.settings = settings;
        if (this.map) {
          this.map.setOptions(settings);
          this.cd.markForCheck();
        }
      });
  }

  ngAfterViewInit() {
    try {
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
      let tileLayerName = this.initWithWorldMap ?  'openStreetMap' : 'taustakartta';
      if (this.tileLayerName) tileLayerName = this.tileLayerName;
      const mapOptions: LajiMapOptions = {
        tileLayerName: tileLayerName,
        zoom: this.zoom,
        center: this.center || [65, 26],
        lang: this.lang,
        data: [],
        draw: draw,
        markerPopupOffset: 5,
        featurePopupOffset: 0,
        rootElem: this.elemRef.nativeElement,
        controls: this.controlSettings,
        overlayNames: this.overlayNames,
        availableTileLayerNamesBlacklist: this.availableTileLayerNamesBlacklist
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
        for (const key in this.settings) {
          if (this.settings.hasOwnProperty(key)) {
            mapOptions[key] = this.settings[key];
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
    } catch (err) {
      this.logger.error('Failed init map', {error: err});
    }
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
    try {
      this.map.addData(data);
    } catch (err) {
      this.logger.error('Failed add data', {error: err});
    }
  }

  initDrawData() {
    if (this.map && this.drawData) {
      try {
        this.map.setDraw({...this.draw, ...this.drawData});
        if (this.bringDrawLayerToBack) {
          this.map.getDraw().group.bringToBack();
        }
      } catch (err) {
        this.logger.error('Failed init draw data', {error: err});
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
