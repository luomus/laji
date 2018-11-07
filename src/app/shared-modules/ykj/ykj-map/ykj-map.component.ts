import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { forkJoin, of, Observable, Subscription } from 'rxjs';
import { LajiMapComponent } from '@laji-map/laji-map.component';
import { YkjService } from '../service/ykj.service';
import { TranslateService } from '@ngx-translate/core';
import { LajiMapLang, LajiMapOptions } from '@laji-map/laji-map.interface';
import { map } from 'rxjs/operators';

export type MapBoxTypes = 'count'|'individualCount'|'individualCountSum'|'individualCountMax'|'oldest'|'newest'|'pairCount';

@Component({
  selector: 'laji-ykj-map',
  templateUrl: './ykj-map.component.html',
  styleUrls: ['./ykj-map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YkjMapComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @ViewChild(LajiMapComponent) mapComponent: LajiMapComponent;

  @Input() title: string;
  @Input() titleInfo: string;
  @Input() height = '605px';
  @Input() query: WarehouseQueryInterface;
  @Input() zeroObservationQuery: WarehouseQueryInterface;
  @Input() data: any;
  @Input() type: MapBoxTypes = 'count';
  @Input() types = ['count', 'individualCount', 'newest'];
  @Input() typeLabels: any = {};
  @Input() colorRange: string[] = ['violet', 'blue', 'lime', 'yellow', 'orange', 'red'];
  @Input() individualColorRange: string[] = ['#ffffff', '#cccccc', 'violet', 'blue', 'lime', 'yellow', 'orange', 'red'];
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
    }
  }
  get mapOptions() {
    return this._mapOptions;
  }
  @Input() taxon: Taxonomy;
  @Input() useStatistics = false;
  @Input() loading = false;

  @Output() onGridClick = new EventEmitter<WarehouseQueryInterface>();

  geoJsonLayer;
  mapInit = false;
  count: {[k: string]: number} = {};
  legendList: {color: string, label: string}[] = [];

  private currentColor;
  private current;
  private subQuery: Subscription;
  private subLang: Subscription;
  private _mapOptions: LajiMapOptions = {
    controls: {
      draw: false
    },
    center: [64.709804, 25],
    zoom: 2
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

  ngOnInit() {
    this.subLang = this.translate.onLangChange.subscribe(() => {
      this._mapOptions = {...this._mapOptions, lang: <LajiMapLang> this.translate.currentLang};
      this.cd.markForCheck();
    });
    this._mapOptions['lang'] = <LajiMapLang> this.translate.currentLang;
    if (!this.geoJsonLayer) {
      this.initGeoJsonLayer();
    }
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initMapdata(!!changes.data);
  }

  ngOnDestroy() {
    this.subLang.unsubscribe();
  }

  changeType(type: MapBoxTypes) {
    this.type = type;
    this.initMapdata();
  }

  initMapdata(dataIsChanged = false) {
    if (!this.query && !this.data) {
      return;
    }
    const key = JSON.stringify({'query': this.query, 'zeroQuery': this.zeroObservationQuery});
    if (!dataIsChanged && this.current === key) {
      const colorKey = this.getColorKey();
      if (this.currentColor !== colorKey  && this.geoJsonLayer) {
        this.initColor();
      }
      return;
    }
    delete this.taxon;
    this.current = key;
    this.loading = true;
    this.initGeoJsonLayer();
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
          this.geoJsonLayer.addData(geoJson);
          this.currentColor = '';
          this.loading = false;
          this.initColor();
          this.cd.markForCheck();
        },
        error => {
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

  initGeoJsonLayer() {
    if (this.geoJsonLayer) {
      this.geoJsonLayer.clearLayers();
    } else if (!this.geoJsonLayer) {
      this.geoJsonLayer = L.geoJSON(undefined, {
        style: function() {
          return { color: '#000000', weight: 0.3, opacity: 1, fillOpacity: 0.9 };
        }
      });
      this.geoJsonLayer.on('click', (evt) => {
        if (!evt.layer.feature.properties || !evt.layer.feature.properties.grid) {
          return;
        }
        const query = JSON.parse(JSON.stringify(this.query || {}));
        query.ykj10kmCenter = evt.layer.feature.properties.grid;
        this.onGridClick.emit(query);
      });
    }
  }

  initColor() {
    this.count = {total: 0};
    const colorKey = this.getColorKey();
    if (this.currentColor === colorKey) {
      return;
    }
    this.currentColor = colorKey;
    let col;
    switch (this.type) {
      case 'individualCount':
      case 'individualCountSum':
      case 'individualCountMax':
        col = this.individualsColor.bind(this);
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
    this.geoJsonLayer.eachLayer((layer) => {
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

  pairCountColor(feature) {
    return this.countColor(feature, 'pairCountSum');
  }

  countColor(feature, prop = 'count', breaks = this.countBreak, range = this.colorRange) {
    const isDefined = typeof feature.properties[prop] !== 'undefined';
    const cnt = isDefined ? feature.properties[prop] : 1;
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

  private initMap() {
    if (this.mapInit || !this.mapComponent || !this.mapComponent.map || !this.mapComponent.map.map) {
      return;
    }
    this.mapInit = true;
    this.mapComponent.map.map.options.maxZoom = 8;
    this.mapComponent.map.map.options.minZoom = 2;
    if (this.geoJsonLayer) {
      this.geoJsonLayer.addTo(this.mapComponent.map.map);
    }
  }

  private getColorKey() {
    return JSON.stringify(this.query) + JSON.stringify(this.zeroObservationQuery) + this.type;
  }
}
