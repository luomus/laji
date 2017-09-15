import {
  AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core/src/translate.service';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { Subscription } from 'rxjs/Subscription';
import { Map3Component } from '../../map/map.component';
import { LajiMapOptions } from '../../map/map-options.interface';
import { YkjService } from '../service/ykj.service';
import { Util } from '../../../shared/service/util.service';

@Component({
  selector: 'laji-ykj-map',
  templateUrl: './ykj-map.component.html',
  styleUrls: ['./ykj-map.component.css']
})
export class YkjMapComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @ViewChild(Map3Component) mapComponent: Map3Component;

  @Input() title: string;
  @Input() height = '605px';
  @Input() query: WarehouseQueryInterface;
  @Input() type = 'count';
  @Input() colorRange: string[] = ['#c0ffff', '#80ff40', '#ffff00', '#ff8000', '#ff0000', '#c00000'];
  @Input() countBreak: number[] = [1, 5, 10, 50, 100, 500];
  @Input() timeBreak: string[] = ['2020-01-01', '2015-01-01', '2010-01-01', '2005-01-01', '2000-01-01', '1991-01-01'];
  @Input() countLabel: string[] = ['1-4', '5-9', '10-49', '50-99', '100-499', '500-'];
  @Input() timeLabel: string[] = ['2020', '2015-', '2010-', '2005-', '2000-', '1990-'];
  @Input() maxBounds: [[number, number], [number, number]] = [[58.0, 19.0], [72.0, 35.0]];
  @Input() mapOptions: LajiMapOptions = {
    controlSettings: {
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
  @Output() onGridClick = new EventEmitter<WarehouseQueryInterface>();

  geoJsonLayer;
  loading = false;
  mapInit = false;
  taxon: Taxonomy;
  count: {[k: string]: number} = {};
  legendList: {color: string, label: string}[] = [];

  private currentColor;
  private current;
  private subQuery: Subscription;
  private subLang: Subscription;

  constructor(
    public translate: TranslateService,
    private ykjService: YkjService
  ) {
    const now = new Date();
    this.timeLabel[0] = '' + now.getFullYear();
    this.timeBreak[0] = now.getFullYear() + '-01-01';
  }

  ngOnInit() {
    this.subLang = this.translate.onLangChange.subscribe(() => {
      this.mapOptions = {...this.mapOptions, lang: this.translate.currentLang}
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
          this.initTitle();
        },
        error => {
          this.loading = false;
        });
  }

  initLegend() {
    let labelSrc = 'countLabel';
    let rangeSrc = 'countBreak';
    switch (this.type) {
      case 'oldest':
      case 'newest':
        labelSrc = 'timeLabel';
        rangeSrc = 'timeBreak';
    }
    this.legendList = [];
    this[rangeSrc].map((breakPoint, idx) => this.legendList.push({
      label: this[labelSrc][idx] || breakPoint,
      color: this.colorRange[idx]
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

  initTitle() {
    if (!this.query || !this.query.taxonId || this.query.taxonId.length === 0) {
      this.taxon = undefined;
    } else {
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
    if (!this.count[newColor]) {
      this.count[newColor] = 0;
    }
    this.count[newColor]++;
    this.count['total']++;
    return newColor;
  }

  individualsColor(feature) {
    return this.countColor(feature, 'individualCountSum');
  }

  countColor(feature, prop = 'count') {
    const cnt = feature.properties[prop] || 0;
    let newColor = '#ffffff';
    for (const idx in this.countBreak) {
      if (!this.countBreak.hasOwnProperty(idx)) {
        continue;
      }
      if (cnt >= this.countBreak[idx]) {
        newColor = this.colorRange[idx];
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
