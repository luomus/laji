
import {merge, switchMap, filter} from 'rxjs/operators';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { USER_INFO, UserService } from '../../shared/service/user.service';
import { Subscription } from 'rxjs';
import { Logger } from '../../shared/logger/logger.service';
import * as LajiMap from 'laji-map';
import { Global } from '../../../environments/global';


@Component({
  selector: 'laji-map',
  template: `
<div class="laji-map-wrap" [ngClass]="{'no-controls': !showControls}">
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
  @Input() lang: string;
  @Input() onPopupClose: (elem: string | HTMLElement) => void;
  @Output() select = new EventEmitter();

  @Output() create = new EventEmitter();
  @Output() move = new EventEmitter();
  @Output() failure =  new EventEmitter();
  @Output() tileLayerChange =  new EventEmitter();
  @ViewChild('lajiMap') elemRef: ElementRef;

  map: any;
  _options: LajiMap.Options = {};
  _legend: {color: string, label: string}[];

  private _settingsKey: string;
  private subSet: Subscription;
  private userSettings: LajiMap.Options = {};

  constructor(
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private logger: Logger
  ) { }

  ngAfterViewInit() {
    setTimeout(() => {
      this.invalidateSize();
    }, 100);
  }

  @Input()
  set options(options: LajiMap.Options) {
    if (!options.on) {
      options = {...options, on: {
          tileLayerChange: (event) => {
            this.tileLayerChange.emit((<any> event).tileLayerName);

            if (this._settingsKey) {
              this.userSettings.tileLayerName = (<any> event).tileLayerName as LajiMap.TileLayerName;
              this.userService.setUserSetting(this._settingsKey, this.userSettings);
            }
          },
          tileLayerOpacityChangeEnd: (event) => {
            this.userSettings.tileLayerOpacity = (<any> event).tileLayerOpacity;
            if (this._settingsKey) {
              this.userService.setUserSetting(this._settingsKey, this.userSettings);
            }
          },
          overlaysChange: (event) => {
            this.userSettings.overlayNames = (<any> event).overlayNames;
            if (this._settingsKey) {
              this.userService.setUserSetting(this._settingsKey, this.userSettings);
            }
          }
        }};
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

  @Input() set settingsKey(key: string) {
    this._settingsKey = key;
    if (this.subSet) {
      this.subSet.unsubscribe();
    }
    if (key) {
      this.subSet = this.userService.getUserSetting(this._settingsKey).pipe(
        merge(this.userService.action$.pipe(
          filter(action => action === USER_INFO),
          switchMap(() => this.userService.getUserSetting(this._settingsKey)), )
        ))
        .subscribe(settings => {
          this.userSettings = settings || {};
          if (this.userSettings.tileLayerName) {
            this.tileLayerChange.emit(this.userSettings.tileLayerName);
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
    if (changes.data) {
      this.setData(this.data);
    }
    if (changes.lang && this.map) {
      this.map.setOption('lang', (this.lang || 'fi'));
    }
  }

  initMap() {
    if (this.map) {
      this.map.destroy();
    }
    const options: any = {
      lang: (this.lang || 'fi'),
      ...this._options,
      ...(this.userSettings || {}),
      rootElem: this.elemRef.nativeElement,
      googleApiKey: Global.googleApiKey,
      data: this.data
    };
    try {
      this.map = new LajiMap.LajiMap(options);
      this.map.map.on('moveend', _ => {
        this.moveEvent('moveend');
      });
      this.map.map.on('movestart', _ => {
        this.moveEvent('movestart');
      });
      this.moveEvent('moveend');
    } catch (e) {
      this.logger.error('Map initialization failed', e);
    }
  }

  moveEvent(type: string) {
    this.move.emit({
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
          this.create.emit(event.feature.geometry);
          break;
        case 'delete':
          this.create.emit();
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
