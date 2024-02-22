import { take, tap } from 'rxjs/operators';
import {
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
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { IUserSettings, UserService } from '../../shared/service/user.service';
import { of, Observable, Subscription } from 'rxjs';
import { Logger } from '../../shared/logger/logger.service';
import type { Options, Lang, TileLayersOptions } from '@luomus/laji-map/lib/defs';
import { Global } from '../../../environments/global';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorage } from 'ngx-webstorage';
import { environment } from 'projects/laji/src/environments/environment';
import { DEFAULT_LANG } from '../../locale/localize-router.service';
import type { PathOptions, DivIcon } from 'leaflet';
import { Feature } from 'geojson';
import { PlatformService } from '../../root/platform.service';

const classNamesAsArr = (c?: string) => c?.split(' ') || [];

export const getPointIconAsCircle = (po: PathOptions, feature: Feature): DivIcon => {
  let classNames = classNamesAsArr(po.className);
  const icon: DivIcon = (window as any).L.divIcon({
    className: ['laji-circle-marker-icon', ...classNames].join(' '),
    html: `<span>${feature.properties.count}</span>`
  });
  (icon as any).setStyle = (iconDomElem: HTMLElement, po2: PathOptions) => {
    const opacityAsHexCode = po2.opacity < 1 ? po2.opacity
      .toString(16) // Convert to hex.
      .padEnd(4, '0') // Pad with zeros to fix length.
      .substr(2, 2) : ''; // Leave whole number our, pick the two first decimals.
    iconDomElem.style['background-color'] = po2.color + opacityAsHexCode;
    iconDomElem.style['height'] = '30px';
    iconDomElem.style['width'] = '30px';
    iconDomElem.style['border-radius'] = '100%';
    const newClassNames = classNamesAsArr(po2.className);
    classNames.forEach(c => iconDomElem.classList.remove(c));
    newClassNames.forEach(c => iconDomElem.classList.add(c));
    classNames = newClassNames;
  };
  return icon;
};

@Component({
  selector: 'laji-map',
  template: `
    <div class="laji-map-wrap">
      <div #lajiMap class="laji-map"></div>
      <div class="loading-map loading" *ngIf="loading"></div>
      <ng-content></ng-content>
    </div>`,
  styleUrls: ['./laji-map.component.scss'],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiMapComponent implements OnDestroy, OnChanges {
  @Input() data: any = [];
  @Input() loading = false;
  @Input() showControls = true;
  @Input() maxBounds: [[number, number], [number, number]];
  @Input() onPopupClose: (elem: string | HTMLElement) => void;

  @Output() loaded = new EventEmitter();
  @Output() create = new EventEmitter();
  @Output() move = new EventEmitter();
  @Output() tileLayersChange = new EventEmitter();
  @ViewChild('lajiMap', { static: true }) elemRef: ElementRef;

  lang: string;
  map: any;
  _options: Options = {};
  @LocalStorage('onlycount') onlyCount;

  private updateSettingsSub: Subscription;
  private userSettings: Options = {};
  private mapData: any;
  private drawToMapType: string;

  constructor(
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private logger: Logger,
    private translate: TranslateService,
    private zone: NgZone,
    private platformService: PlatformService
  ) { }

  @Input() options: Options;
  @Input() settingsKey: keyof IUserSettings;

  ngOnDestroy() {
    try {
      this.map.destroy();
      this.map = undefined;
    } catch (e) { }
    if (this.updateSettingsSub) {
      this.updateSettingsSub.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const lang = this.translate.currentLang;
    if (Global.lajiMapSupportedLanguages.includes(lang)) {
      this.lang = lang;
    }

    if (changes.data) {
      this.setData(this.data);
    }

    if (changes.options || changes.settingsKey) {
      if (this.updateSettingsSub) {
        this.updateSettingsSub.unsubscribe();
      }

      if (changes.options) {
        this.updateOptions();
      }

      let settings$ = of(this.userSettings);

      if (this.settingsKey && changes.settingsKey) {
        settings$ = this.updateSettings();
      }

      this.updateSettingsSub = settings$.subscribe(() => {
        this.initMap();
        this.cd.markForCheck();
      });
    }
  }

  initMap() {
    // laji-map depends on Leaflet, which doesn't work on SSR because it uses 'window'
    if (!this.platformService.isBrowser) {
      return;
    }
    import('@luomus/laji-map').then(({ LajiMap }) => { // eslint-disable-line @typescript-eslint/naming-convention
      this.zone.runOutsideAngular(() => {
        if (this.map) {
          this.map.destroy();
        }
        const options: any = {
          lang: (this.lang || DEFAULT_LANG) as Lang,
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
          this.map.map.on('moveend', () => {
            this.moveEvent('moveend');
          });
          this.moveEvent('moveend');
          if (this.mapData) {
            this.setData(this.mapData);
            this.mapData = undefined;
          }
          if (this.drawToMapType) {
            this.drawToMap(this.drawToMapType);
            this.drawToMapType = undefined;
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
        type
      });
    });
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
    this.zone.run(() => {
      this.create.emit(events);
    });
  }

  drawToMap(type: string) {
    if (!this.map) {
      this.drawToMapType = type;
      return;
    }
    if (type === 'Coordinates') {
      this.map.openCoordinatesInputDialog();
    } else if (type === 'CoordinatesImport') {
      this.map.openDrawUploadDialog();
    } else if (['Rectangle', 'Polygon'].includes(type)) {
      this.map.triggerDrawing(type);
    }
  }

  updateOptions() {
    let options = this.options;
    if (!options.on) {
      options = {
        ...options, on: {
          tileLayersChange: (event) => {
            this.zone.run(() => {
              this.tileLayersChange.emit((event as any).tileLayers);
            });

            if (this.settingsKey) {
              this.userSettings.tileLayers = (event as any).tileLayers as TileLayersOptions;
              this.userService.setUserSetting(this.settingsKey, this.userSettings);
            }
          }
        } as any
      };
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
    if ((environment as any).geoserver) {
      options.lajiGeoServerAddress = (environment as any).geoserver;
    }
    this._options = options;
  }

  updateSettings(): Observable<Options> {
    return this.userService.getUserSetting<Options>(this.settingsKey).pipe(
      take(1),
      tap(settings => {
        this.userSettings = settings || {};
        if (this.userSettings.tileLayers) {
          this.tileLayersChange.emit(this.userSettings.tileLayers);
        }
      })
    );
  }
}
