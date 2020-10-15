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
    <div class="laji-map-wrap">
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
  @ViewChild('lajiMap', { static: true }) elemRef: ElementRef;

  lang: string;
  map: any;
  _options: Options = {};
  _legend: {color: string, label: string}[];
  @LocalStorage('onlycount') onlyCount;


  private _settingsKey: keyof IUserSettings;
  private subSet: Subscription;
  private userSettings: Options = {};
  private mapData: any;

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
          this.userSettings = settings || {};
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
        if (!this.showControls) {
          options.controls = false;
        }
        try {
          this.map = new LajiMap(options);
          this.map.map.on('moveend', _ => {
            this.moveEvent('moveend');
          });
          this.map.map.on('movestart', () => {
            this.moveEvent('movestart');
          });
          this.moveEvent('moveend');
          if (this.mapData) {
            this.setData(this.mapData);
            this.mapData = undefined;
          } else {
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
}
