import {
  ChangeDetectionStrategy, ChangeDetectorRef,
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
import { LajiMap as Map } from './laji-map.interface';
import { USER_INFO, UserService } from '../../shared/service/user.service';
import { Subscription } from 'rxjs';
import LajiMap from 'laji-map/lib/map';

@Component({
  selector: 'laji-map',
  template: `
<div class="laji-map-wrap" [ngClass]="{'no-controls': !showControls}">
  <div #lajiMap class="laji-map"></div>
  <div class="loading-map loading" *ngIf="loading"></div>
  <ng-content></ng-content>
  <ul class="legend" *ngIf="_legend && _legend.length > 0" [ngStyle]="{'margin-top': 0 }">
    <li *ngFor="let leg of _legend">
      <span class="color" [ngStyle]="{'background-color': leg.color}"></span>{{leg.label}}
    </li>
  </ul>
</div>`,
  styleUrls: ['./laji-map.component.css'],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiMapComponent implements OnInit, OnDestroy, OnChanges {

  @Input() data: any = [];
  @Input() loading = false;
  @Input() showControls = true;
  @Input() maxBounds: [[number, number], [number, number]];
  @Input() tileLayerOpacity: number;
  @Output() select = new EventEmitter();

  @Output() onCreate = new EventEmitter();
  @Output() onMove = new EventEmitter();
  @Output() onFailure =  new EventEmitter();
  @Output() onTileLayerChange =  new EventEmitter();
  @ViewChild('lajiMap') elemRef: ElementRef;

  map: any;
  _options: Map.Options = {};
  _legend: {color: string, label: string}[];

  private _settingsKey: string;
  private subSet: Subscription;
  private userSettings: Map.Options = {};

  constructor(
    private userService: UserService,
    private cd: ChangeDetectorRef
  ) { }

  @Input()
  set options(options: Map.Options) {
    if (!options.on) {
      options = {...options, on: {
          tileLayerChange: (event) => {
            this.onTileLayerChange.emit(event.tileLayerName);

            if (this._settingsKey) {
              this.userSettings.tileLayerName = event.tileLayerName as Map.TileLayer;
              this.userService.setUserSetting(this._settingsKey, this.userSettings);
            }
          },
          tileLayerOpacityChangeEnd: (event) => {
            this.userSettings.tileLayerOpacity = event.tileLayerOpacity;
            if (this._settingsKey) {
              this.userService.setUserSetting(this._settingsKey, this.userSettings);
            }
          },
          overlaysChange: (event) => {
            this.userSettings.overlayNames = event.overlayNames;
            if (this._settingsKey) {
              this.userService.setUserSetting(this._settingsKey, this.userSettings);
            }
          }
        }}
    }
    if (typeof options.draw === 'object' && !options.draw.onChange) {
      options = {
        ...options,
        draw: {
          ...options.draw,
          onChange: e => this.onChange(e)
        }
      }
    }
    this._options = options;
    this.initMap();
  }

  @Input() set settingsKey(key: string) {
    this._settingsKey = key;
    if (this.subSet) {
      this.subSet.unsubscribe();
    }
    if (key) {
      this.subSet = this.userService.getUserSetting(this._settingsKey)
        .merge(this.userService.action$
          .filter(action => action === USER_INFO)
          .switchMap(() => this.userService.getUserSetting(this._settingsKey))
        )
        .subscribe(settings => {
          this.userSettings = settings || {};
          if (this.userSettings.tileLayerName) {
            this.onTileLayerChange.emit(this.userSettings.tileLayerName);
          }
          this.initMap();
          this.cd.markForCheck();
        });
    }
  }

  @Input()
  set lang(lang: string) {
    this._options = {...this._options, lang: lang || 'fi'};
  }

  @Input() set legend(legend: {[color: string]: string}) {
    const leg = [];
    Object.keys(legend).forEach(color => {
      leg.push({color, label: legend[color]});
    });
    this._legend = leg;
  }

  ngOnInit() {
    if (this.settingsKey) {
      this.userService.getUserSetting(this.settingsKey)
        .merge(this.userService.action$
          .filter(action => action === USER_INFO)
          .switchMap(() => this.userService.getUserSetting(this.settingsKey))
        )
        .subscribe(settings => {
          this.userSettings = settings;
          this.initMap();
          this.cd.markForCheck();
        });
    }
  }

  ngOnDestroy() {
    try {
      this.map.destroy();
    } catch (e) {}
    if (this.subSet) {
      this.subSet.unsubscribe();
    }
  }

  ngOnChanges(changes) {
    if (changes.data) {
      this.setData(this.data);
    }
    if (changes.maxBounds && this.map) {
      // this.initMap();
    }
    if (changes.tileLayerOpacity && this.map && this.map.tileLayer) {
      this.map.setTileLayerOpacity(typeof this.tileLayerOpacity === 'undefined' ? this.tileLayerOpacity : 1);
    }
  }

  initMap() {
    if (this.map) {
      this.map.destroy();
    }
    const options = {...this._options, ...(this.userSettings || {}), rootElem: this.elemRef.nativeElement};
    this.map = new LajiMap(options);
    if (this.data) {
      this.map.setData(this.data);
    }
    if (this.maxBounds) {
      this.map.map.setMaxBounds(this.maxBounds);
    }
    if (this.tileLayerOpacity) {
      this.map.setTileLayerOpacity(this.tileLayerOpacity);
    }
    this.map.map.on('moveend', _ => {
      this.moveEvent('moveend');
    });
    this.map.map.on('movestart', _ => {
      this.moveEvent('movestart');
    });
    this.moveEvent('moveend');
  }

  moveEvent(type: string) {
    this.onMove.emit({
      zoom: this.map.getNormalizedZoom(),
      bounds: this.map.map.getBounds(),
      type: type
    });
  }

  invalidateSize() {
    try {
      if (this.map) {
        this.map.map.invalidateSize();
      }
    } catch (e) {
    }
  }

  setData(data) {
    if (!this.map || !data) {
      return;
    }
    this.map.setData(data);
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

  drawToMap(type: string) {
    if (type === 'Coordinates') {
      this.map.openCoordinatesInputDialog();
    } else if (['Rectangle'].indexOf(type) > -1) {
      new (L as any).Draw[type](this.map.map, this.getDrawingDraftStyle(type))
        .enable();
    }
  }

  getDrawingDraftStyle(type): any {
    if (type === 'marker') {
      return {};
    } else {
      return {shapeOptions: {color: '#00aa00', opacity: 1, fillOpacity: 0}};
    }
  }
}
