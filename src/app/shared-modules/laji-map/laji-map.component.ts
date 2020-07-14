import { take } from 'rxjs/operators';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { IUserSettings, UserService } from '../../shared/service/user.service';
import { Subscription } from 'rxjs';
import { Logger } from '../../shared/logger/logger.service';
import { Options, TileLayerName, Lang, TileLayersOptions } from 'laji-map';
import { Global } from '../../../environments/global';
import { TranslateService } from '@ngx-translate/core';
import {LocalStorageService, LocalStorage} from 'ngx-webstorage';


@Component({
  selector: 'laji-map',
  template: `
    <div class="laji-map-wrap" [ngClass]="{'no-controls': !showControls, 'map-fullscreen': fullScreen}">
      <div #lajiMap class="laji-map"></div>
      <div class="loading-map loading" *ngIf="loading"></div>
      <ng-content></ng-content>
      <ul class="legend" *ngIf="_legend && _legend.length > 0" [ngStyle]="{'margin-top': 0 }">
        <li *ngFor="let leg of _legend">
          <span class="color" [ngStyle]="{'background-color': leg.color}"></span>{{ leg.label }}
        </li>
      </ul>
    </div>`,
  styleUrls: ['./laji-map.component.css'],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiMapComponent implements OnDestroy, OnChanges, AfterViewInit {

  @Input() data: any = [];
  @Input() showFullScreenControl = false;
  @Input() loading = false;
  @Input() showControls = true;
  @Input() maxBounds: [[number, number], [number, number]];
  @Input() onPopupClose: (elem: string | HTMLElement) => void;
  @Output() select = new EventEmitter();

  @Output() loaded = new EventEmitter();
  @Output() create = new EventEmitter();
  @Output() move = new EventEmitter();
  @Output() failure =  new EventEmitter();
  @Output() tileLayersChange =  new EventEmitter();
  // @Output() total = new EventEmitter<number>();
  @ViewChild('lajiMap', { static: true }) elemRef: ElementRef;

  lang: string;
  map: any;
  _options: Options = {};
  _legend: {color: string, label: string}[];
  fullScreen = false;
  @LocalStorage('onlycount') onlyCount;
  

  private _settingsKey: keyof IUserSettings;
  private subSet: Subscription;
  private userSettings: Options = {};
  private mapData: any;

  private customControlsSub: Subscription;

  constructor(
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private logger: Logger,
    private translate: TranslateService,
    private zone: NgZone
  ) {

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.invalidateSize();
    }, 100);
  }

  @Input()
  set options(options: Options) {
    if (!options.on) {
      options = {...options, on: {
        tileLayersChange: (event) => {
          this.zone.run(() => {
            this.tileLayersChange.emit((event as any).tileLayers);
          });

          if (this._settingsKey) {
            this.userSettings.tileLayers = (event as any).tileLayers as TileLayersOptions;
            this.userService.setUserSetting(this._settingsKey, this.userSettings);
          }
        }
        } as object};
    }
    if (typeof options.draw === 'object' && !options.draw.onChange) {
      options = {
        ...options,
        draw: {
          ...options.draw,
          onChange: e => this.onChange(e)
        }
      };
    }
    this._options = options;
    this.initMap();
  }

  @Input() set settingsKey(key: keyof IUserSettings) {
    this._settingsKey = key;
    if (this.subSet) {
      this.subSet.unsubscribe();
    }
    if (key) {
      this.subSet = this.userService.getUserSetting<Options>(this._settingsKey)
        .pipe(take(1))
        .subscribe(settings => {
          this.userSettings = settings || {};
          if (this.userSettings.tileLayers) {
            this.tileLayersChange.emit(this.userSettings.tileLayers);
          }
          this.initMap();
          this.cd.markForCheck();
        });
    }
  }

  @Input() set legend(legend: {[color: string]: string} | undefined) {
    if (!legend) {
      return;
    }
    const leg = [];
    Object.keys(legend).forEach(color => {
      leg.push({color, label: legend[color]});
    });
    this._legend = leg;
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
    this.lang = this.translate.currentLang;
    if (changes.data) {
      this.setData(this.data);
    }
    if (changes.showFullScreenControl) {
      this.updateCustomControls();
    }
  }

  initMap() {
    import('laji-map').then(({ LajiMap }) => {
      this.zone.runOutsideAngular(() => {
        if (this.map) {
          this.map.destroy();
        }
        const options: any = {
          lang: (this.lang || 'fi') as Lang,
          ...this._options,
          ...(this.userSettings || {}),
          rootElem: this.elemRef.nativeElement,
          googleApiKey: Global.googleApiKey,
          data: this.data
        };
        try {
          this.map = new LajiMap(options);
          this.map.map.on('moveend', _ => {
            this.moveEvent('moveend');
          });
          this.map.map.on('movestart', () => {
            this.moveEvent('movestart');
          });
          this.moveEvent('moveend');
          this.updateCustomControls();
          if (this.mapData) {
            this.setData(this.mapData);
            this.mapData = undefined;
          } else {
            // this.total.emit(0);
          }
          this.zone.run(() => {
            this.loaded.emit();
          });
        } catch (e) {
          this.logger.error('Map initialization failed', e);
        }
      });
    });
  }

  moveEvent(type: string) {
    this.zone.run(() => {
      this.move.emit({
        zoom: this.map.getNormalizedZoom(),
        bounds: this.map.map.getBounds(),
        type: type
      });
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
    
    /*let sum = 0;
   
    sum = this.buildTotalObservations(data);
    console.log(sum)
    this.total.emit(sum || 0);*/
    if (!this.map) {
      this.mapData = data;
      return;
    }
    if (!data) {
      return;
    }
    this.map.setData(data);
  }

  onChange(events) {
    events.map(event => {
      switch (event.type) {
        case 'create':
          this.zone.run(() => {
            this.create.emit(event.feature.geometry);
          });
          break;
        case 'delete':
          this.zone.run(() => {
            this.create.emit();
          });
          break;
        default:
      }
    });
  }

  drawToMap(type: string) {
    if (type === 'Coordinates') {
      this.map.openCoordinatesInputDialog();
    } else if (['Rectangle'].indexOf(type) > -1) {
      this.map.triggerDrawing('Rectangle');
    }
  }

  getDrawingDraftStyle(type): any {
    if (type === 'marker') {
      return {};
    } else {
      return {shapeOptions: {color: '#00aa00', opacity: 1, fillOpacity: 0}};
    }
  }

  private buildTotalObservations(data) {
    let features;
    let key = 'properties';
    let key1;
    
    if (Array.isArray(data)) {
      features = data[0]['featureCollection']['features'];
      key1 = 'count';
    } else {
      features = data['featureCollection']['features'];
      key1 = this.onlyCount === null ? 'count' :
      this.onlyCount ? 'count' : 'individualCountSum';
    }
    if (data && features && features.length > 0) {
      if (features.length === 1) {
        return this.onlyCount === null ? features[0][key][key1] :
        this.onlyCount ? features[0][key][key1] : features[0][key][key1];
      } else {
        return features.reduce((total, obj) => { 
          const value = this.onlyCount === null ? obj[key][key1] :
          this.onlyCount ? obj[key][key1] : obj[key][key1];
          console.log(value)
          return (parseInt(total) + parseInt(value));
          
        }, 0)
      }
    } else {
      return 0;
    }
  }

  private toggleFullscreen() {
    this.fullScreen = !this.fullScreen;
    this.updateCustomControls();
    setTimeout(() => {
      this.invalidateSize();
    }, 0);
    this.cd.markForCheck();
  }

  private updateCustomControls() {
    if (!this.map) {
      return;
    }
    if (this.customControlsSub) {
      this.customControlsSub.unsubscribe();
    }

    if (!this.showFullScreenControl) {
      this.map.setCustomControls([]);
    } else {
      this.customControlsSub = this.translate.get(this.fullScreen ? 'map.exitFullScreen' : 'map.fullScreen')
        .subscribe(text => {
          this.map.setCustomControls(
            [{
              iconCls: 'glyphicon glyphicon-resize-' + (this.fullScreen ? 'small' : 'full'),
              fn: this.toggleFullscreen.bind(this),
              position: 'bottomright',
              text: text
            }]
          );
        });
    }
  }
}
