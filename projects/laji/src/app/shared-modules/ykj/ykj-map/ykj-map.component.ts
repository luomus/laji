import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { LajiMapComponent } from '../../laji-map/laji-map.component';
import { YkjService } from '../service/ykj.service';
import { TranslateService } from '@ngx-translate/core';
import { LajiMapLang, LajiMapOptions } from '../../laji-map/laji-map.interface';
import { map } from 'rxjs/operators';

export type MapBoxTypes = 'count'|'individualCount'|'individualCountSum'|'individualCountMax'|'oldest'|'newest'|'pairCount'|
  'individualCountSumPer10km';

@Component({
  selector: 'laji-ykj-map',
  templateUrl: './ykj-map.component.html',
  styleUrls: ['./ykj-map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YkjMapComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild(LajiMapComponent, { static: true }) mapComponent: LajiMapComponent;

  @Input() title: string;
  @Input() titleInfo: string;
  @Input() height = '605px';
  @Input() query: WarehouseQueryInterface;
  @Input() zeroObservationQuery: WarehouseQueryInterface;
  @Input() data: any;
  @Input() type: MapBoxTypes = 'count';
  @Input() types: MapBoxTypes[] = ['count', 'individualCount', 'newest'];
  @Input() typeLabels: any = {};
  @Input() colorRange: string[] = ['violet', '#1e90ff', 'lime', 'yellow', 'orange', '#dc143c'];
  @Input() individualColorRange: string[] = ['#ffffff', '#cccccc', 'violet', '#1e90ff', 'lime', 'yellow', 'orange', '#dc143c'];
  @Input() individualBreak: number[] = [0, null, 1, 10, 100, 1000, 10000, 100000];
  @Input() countBreak: number[] = [1, 10, 100, 1000, 10000, 100000];
  @Input() timeBreak: string[] = ['2020-01-01', '2015-01-01', '2010-01-01', '2005-01-01', '2000-01-01', '1991-01-01'];
  @Input() individualLabel: string[] = ['0', '1+', '1-', '10-', '100-', '1 000-', '10 000-', '100 000-'];
  @Input() countLabel: string[] = ['1-', '10-', '100-', '1 000-', '10 000-', '100 000-'];
  @Input() timeLabel: string[] = ['2020', '2015-', '2010-', '2005-', '2000-', '1990-'];
  @Input() maxBounds: [[number, number], [number, number]] = [[58.0, 19.0], [72.0, 35.0]];
  @Input() set mapOptions(mapOptions: LajiMapOptions) {
    this._mapOptions = {
      ...this._mapOptions,
      ...(mapOptions || {})
    };
  }
  get mapOptions() {
    return this._mapOptions;
  }
  @Input() taxon: Taxonomy;
  @Input() useStatistics = false;
  @Input() loading = false;

  @Output() gridClick = new EventEmitter<WarehouseQueryInterface>();
  @Output() boundsChange = new EventEmitter<any>();
  @Output() loaded = new EventEmitter<void>();

  count: {[k: string]: number} = {};
  legendList: {color: string, label: string}[] = [];

  private currentColor;
  private current;
  private subQuery: Subscription;
  private subLang: Subscription;
  private _mapOptions: LajiMapOptions = {
    center: [64.709804, 25],
    zoom: 2,
    tileLayerOpacity: 0.5,
    controls: true
  };

  constructor(
    public translate: TranslateService,
    private ykjService: YkjService,
    private cd: ChangeDetectorRef
  ) {
    const now = new Date();
    this.timeLabel[0] = '' + now.getFullYear();
    this.timeBreak[0] = now.getFullYear() + '-01-01';
  }

  onMapLoad(): void {
    this.initMapData();
    this.loaded.emit();
  }

  ngOnInit() {
    this.subLang = this.translate.onLangChange.subscribe(() => {
      this._mapOptions = {...this._mapOptions, lang: <LajiMapLang> this.translate.currentLang};
      this.cd.markForCheck();
    });
    this._mapOptions['lang'] = <LajiMapLang> this.translate.currentLang;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initMapData(!!changes.data);
  }

  ngOnDestroy() {
    if (this.subLang) {
      this.subLang.unsubscribe();
    }
  }

  changeType(type: MapBoxTypes) {
    this.type = type;
    this.initMapData();
  }

  private initMapData(dataIsChanged = false) {
    if ((!this.query && !this.data) || !this.mapComponent.map) {
      return;
    }
    const key = JSON.stringify({'query': this.query, 'zeroQuery': this.zeroObservationQuery});
    if (!dataIsChanged && this.current === key) {
      const colorKey = this.getColorKey();
      if (this.currentColor !== colorKey) {
        this.initColor();
        this.currentColor = colorKey;
      }
      return;
    }
    delete this.taxon;
    this.current = key;
    this.loading = true;
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
    let geoJson$:  Observable<any>;
    if (this.data) {
      geoJson$ = of(this.data);
    } else {
      geoJson$ = this.zeroObservationQuery ? forkJoin([
        this.ykjService.getGeoJson(this.zeroObservationQuery, undefined, undefined, this.useStatistics, true),
        this.ykjService.getGeoJson(this.query, undefined, undefined, this.useStatistics)
      ]).pipe(map(geoJsons => (this.ykjService.combineGeoJsons(geoJsons[1], geoJsons[0])))) :
        this.ykjService.getGeoJson(this.query, undefined, undefined, this.useStatistics);
    }

    this.subQuery = geoJson$
      .subscribe(geoJson => {
        this.mapComponent.setData({
          on: {
            click: (event, data) => {
              try {
                this.gridClick.emit({
                  ...(this.query || {}),
                  ykj10kmCenter: data.feature.properties.grid
                });
              } catch (e) {}
            }
          },
          getFeatureStyle: () => ({
            weight: 0.2,
            opacity: 1,
            fillOpacity: 0.8,
            color: '#000000'
          }),
          featureCollection: {
            type: 'FeatureCollection',
            features: geoJson
          }
        });
        this.initColor();
        const dataLayer = this.getDataLayer();
        if (dataLayer) {
          this.boundsChange.emit(dataLayer.getBounds());
        }
        this.loading = false;
        this.cd.markForCheck();
      },
      () => {
        this.loading = false;
        this.cd.markForCheck();
      });
  }

  initLegend() {
    let labelSrc = 'countLabel';
    let rangeSrc = 'countBreak';
    let colorRange = [...this.colorRange];
    switch (this.type) {
      case 'oldest':
      case 'newest':
        labelSrc = 'timeLabel';
        rangeSrc = 'timeBreak';
        break;
      case 'individualCount':
      case 'individualCountSum':
      case 'individualCountSumPer10km':
      case 'individualCountMax':
        labelSrc = 'individualLabel';
        rangeSrc = 'individualBreak';
        colorRange = [...this.individualColorRange];
    }
    this.legendList = [];
    this[rangeSrc].map((breakPoint, idx) => this.legendList.push({
      label: this[labelSrc][idx] || breakPoint,
      color: colorRange[idx]
    }));
  }

  initColor() {
    this.count = {total: 0};
    const dataLayer = this.getDataLayer();
    if (!dataLayer) {
      return;
    }
    let col;
    switch (this.type) {
      case 'individualCount':
      case 'individualCountSum':
      case 'individualCountMax':
        col = this.individualsColor.bind(this);
        break;
      case 'individualCountSumPer10km':
        col = this.individualsPer10kmColor.bind(this);
        break;
      case 'oldest':
      case 'newest':
        col = this.newestColor.bind(this);
        break;
      case 'pairCount':
        col = this.pairCountColor.bind(this);
        break;
      default:
        col = this.countColor.bind(this);
        break;
    }
    dataLayer.eachLayer((layer) => {
      const color = col(layer.feature);
      layer.setStyle({fillColor: color});
    });
    this.initLegend();
  }

  newestColor(feature) {
    const cnt = feature.properties.newestRecord || '1991-01-01';
    const len = this.timeBreak.length;
    let newColor = '#ffffff';
    for (let idx = len - 1; idx >= 0; idx--) {
      if (cnt >= this.timeBreak[idx]) {
        newColor = this.colorRange[idx];
      } else {
        break;
      }
    }
    if (typeof this.count[newColor] === 'undefined') {
      this.count[newColor] = 0;
    }
    this.count[newColor]++;
    this.count['total']++;
    return newColor;
  }

  individualsColor(feature) {
    return this.countColor(feature, 'individualCountSum', this.individualBreak, this.individualColorRange);
  }

  individualsPer10kmColor(feature) {
    const divisor = feature.properties.lineLengthSum / 10000;
    return this.countColor(feature, 'individualCountSum', this.individualBreak, this.individualColorRange, divisor);
  }

  pairCountColor(feature) {
    return this.countColor(feature, 'pairCountSum');
  }

  countColor(feature, prop = 'count', breaks = this.countBreak, range = this.colorRange, divisor = 1) {
    const isDefined = typeof feature.properties[prop] !== 'undefined';
    const cnt = (isDefined ? feature.properties[prop] : 1) / divisor;
    let newColor = '#ffffff';
    for (const idx in breaks) {
      if (!breaks.hasOwnProperty(idx)) {
        continue;
      }
      if (breaks[idx] === null) {
        if (!isDefined) {
          newColor = range[idx];
          break;
        }
      } else if (cnt >= breaks[idx]) {
        newColor = range[idx];
      } else {
        break;
      }
    }
    if (!this.count[newColor]) {
      this.count[newColor] = 0;
    }
    this.count[newColor]++;
    this.count['total']++;
    return newColor;
  }


  private getDataLayer() {
    try {
      const layers = this.mapComponent.map.getData();
      for (const layer of layers) {
        return layer.group;
      }
    } catch (e) {
    }
    return null;
  }

  private getColorKey() {
    return JSON.stringify(this.query) + JSON.stringify(this.zeroObservationQuery) + this.type;
  }
}
