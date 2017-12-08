import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy,
  OnInit, Output,
  ViewChild
} from '@angular/core';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { Subscription } from 'rxjs/Subscription';
import { Map3Component } from '../../map/map.component';
import { LajiMapOptions } from '../../map/map-options.interface';
import { YkjService } from '../service/ykj.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-ykj-map',
  templateUrl: './ykj-map.component.html',
  styleUrls: ['./ykj-map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YkjMapComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @ViewChild(Map3Component) mapComponent: Map3Component;

  @Input() title: string;
  @Input() height = '605px';
  @Input() query: WarehouseQueryInterface;
  @Input() type = 'count';
  @Input() colorRange: string[] = ['#c0ffff', '#80ff40', '#ffff00', '#ff8000', '#ff0000', '#c00000'];
  @Input() individualColorRange: string[] = ['#ffffff', '#cccccc', '#c0ffff', '#80ff40', '#ffff00', '#ff8000', '#ff0000', '#c00000'];
  @Input() individualBreak: number[] = [0, null, 1, 10, 100, 1000, 10000, 100000];
  @Input() countBreak: number[] = [1, 10, 100, 1000, 10000, 100000];
  @Input() timeBreak: string[] = ['2020-01-01', '2015-01-01', '2010-01-01', '2005-01-01', '2000-01-01', '1991-01-01'];
  @Input() individualLabel: string[] = ['0', '1+', '1-', '10-', '100-', '1 000-', '10 000-', '100 000-'];
  @Input() countLabel: string[] = ['1-', '10-', '100-', '1 000-', '10 000-', '100 000-'];
  @Input() timeLabel: string[] = ['2020', '2015-', '2010-', '2005-', '2000-', '1990-'];
  @Input() maxBounds: [[number, number], [number, number]] = [[58.0, 19.0], [72.0, 35.0]];
  @Input() mapOptions: LajiMapOptions = {
    controls: {
      draw: false,
      drawCopy: false,
      drawClear: false,
      coordinates: false,
      lineTransect: false,
      coordinateInput: false
    },
    center: [64.709804, 25],
    zoom: 2
  };
  @Input() taxon: Taxonomy;

  @Output() onGridClick = new EventEmitter<WarehouseQueryInterface>();

  geoJsonLayer;
  loading = false;
  mapInit = false;
  count: {[k: string]: number} = {};
  legendList: {color: string, label: string}[] = [];

  private currentColor;
  private current;
  private subQuery: Subscription;
  private subLang: Subscription;

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
      this.mapOptions = {...this.mapOptions, lang: this.translate.currentLang};
      this.cd.markForCheck();
    });
    this.mapOptions['lang'] = this.translate.currentLang;
    this.initMapdata();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnChanges() {
    this.initMapdata();
  }

  ngOnDestroy() {
    this.subLang.unsubscribe();
  }

  changeType(type: string) {
    this.type = type;
    this.initMapdata();
  }

  initMapdata() {
    if (!this.query) {
      return;
    }
    const key = JSON.stringify(this.query);
    if (this.current === key) {
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
    this.subQuery = this.ykjService
      .getGeoJson(this.query)
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
      case 'individuals':
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
        const query = JSON.parse(JSON.stringify(this.query));
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
      case 'individuals':
        col = this.individualsColor.bind(this);
        break;
      case 'newest':
        col = this.newestColor.bind(this);
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
    if (this.mapInit || !this.mapComponent || !this.mapComponent.lajiMap || !this.mapComponent.lajiMap.map) {
      return;
    }
    this.mapInit = true;
    this.mapComponent.lajiMap.map.options.maxZoom = 8;
    this.mapComponent.lajiMap.map.options.minZoom = 2;
    if (this.geoJsonLayer) {
      this.geoJsonLayer.addTo(this.mapComponent.lajiMap.map);
    }
  }

  private getColorKey() {
    return JSON.stringify(this.query) + this.type;
  }
}
