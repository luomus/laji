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
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { IUserSettings, UserService } from '../../shared/service/user.service';
import { Subscription } from 'rxjs';
import { Logger } from '../../shared/logger/logger.service';
import { Options, Lang, TileLayersOptions } from 'laji-map';
import { Global } from '../../../environments/global';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorage } from 'ngx-webstorage';
import { environment } from 'projects/laji/src/environments/environment';
import { LajiMapVisualization } from './visualization/laji-map-visualization';

@Component({
  selector: 'laji-map',
  template: `
    <div class="laji-map-wrap">
      <div #lajiMap class="laji-map"></div>
      <div class="loading-map loading" *ngIf="loading"></div>
      <ng-content></ng-content>
      <laji-map-legend
        *ngIf="visualization"
        [visualization]="visualization"
        [mode]="visualizationMode"
        [displayObservationAccuracy]="displayObservationAccuracy"
        (modeChange)="onVisualizationModeChange($event)"
      ></laji-map-legend>
    </div>`,
  styleUrls: ['./laji-map.component.css'],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiMapComponent<T extends string> implements OnDestroy, OnChanges, AfterViewInit {
  @Input() data: any = [];
  @Input() visualization: LajiMapVisualization<T> | undefined; // overwrites getFeatureStyle and getClusterStyle
  @Input() visualizationMode: T | undefined;
  @Input() loading = false;
  @Input() showControls = true;
  @Input() maxBounds: [[number, number], [number, number]];
  @Input() onPopupClose: (elem: string | HTMLElement) => void;
  @Input() displayObservationAccuracy = false;

  @Output() loaded = new EventEmitter();
  @Output() create = new EventEmitter();
  @Output() move = new EventEmitter();
  @Output() tileLayersChange =  new EventEmitter();
  @Output() visualizationModeChange = new EventEmitter<T>();
  @Output() clusterclick = new EventEmitter<{leafletEvent; lajiMapEvent}>();
  @ViewChild('lajiMap', { static: true }) elemRef: ElementRef;

  lang: string;
  map: any;
  _options: Options = {};
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
  ) {}

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
        } as any};
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

  ngOnDestroy() {
    try {
      this.map.destroy();
      this.map = undefined;
    } catch (e) {}
    if (this.subSet) {
      this.subSet.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.lang = this.translate.currentLang;
    if (changes.data) {
      this.setData(this.data);
    }
    if (changes.visualization && changes.visualization.currentValue) {
      this.visualizationMode = <T>Object.keys(this.visualization)[0];
      this.updateVisualization();
    }
  }

  initMap() {
    import('laji-map').then(({ LajiMap }) => { // eslint-disable-line @typescript-eslint/naming-convention
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
        type
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
    if (this.visualization) {
      data = this.patchMapDataCallbacks(data);
    }
    this.map.setData(data);
  }

  onChange(events) {
    this.zone.run(() => {
      this.create.emit(events);
    });
  }

  drawToMap(type: string) {
    if (type === 'Coordinates') {
      this.map.openCoordinatesInputDialog();
    } else if (['Rectangle'].includes(type)) {
      this.map.triggerDrawing(type);
    }
  }

  onVisualizationModeChange(mode: T) {
    this.visualizationMode = mode;
    this.visualizationModeChange.emit(mode);
    this.updateVisualization();
  }

  updateVisualization() {
    if (!this.map) { return; }
    this.map.setData(this.patchMapDataCallbacks(this.map.getData()));
  }

  patchMapDataCallbacks(data: any) {
    const vis = this.visualization[this.visualizationMode];
    data.forEach(d => {
      if (vis.getFeatureStyle) { d.getFeatureStyle = vis.getFeatureStyle; }
      if (vis.getClusterStyle) { d.getClusterStyle = vis.getClusterStyle; }
      if (vis.getClusterClassName) { d.getClusterClassName = vis.getClusterClassName; }
      if (!d.on) {
        d.on = {};
      }
      d.on['clusterclick'] = (leafletEvent, lajiMapEvent) => {
        this.clusterclick.emit({leafletEvent, lajiMapEvent});
      };
    });
    return data;
  }
}
