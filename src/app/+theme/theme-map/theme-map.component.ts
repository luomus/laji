import { Component, AfterViewInit, OnChanges, ViewChild, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core/src/translate.service';
import { MapComponent } from '../../shared/map/map.component';
import { ResultService } from '../service/result.service';
import { Router } from '@angular/router';
import { Taxonomy } from '../../shared/model/Taxonomy';

export type MapTypes = 'count'|'individuals'|'newest'|'oldest';

@Component({
  selector: 'laji-theme-map',
  templateUrl: './theme-map.component.html',
  styleUrls: ['./theme-map.component.css']
})
export class ThemeMapComponent implements AfterViewInit, OnChanges {

  @ViewChild(MapComponent) lajiMap: MapComponent;

  @Input() time: string;
  @Input() taxonId: string;
  @Input() collectionId: string;
  @Input() grid: string;
  @Input() type: MapTypes = 'count';
  @Input() colorRange: string[] = ['#c0ffff', '#80ff40', '#ffff00', '#ff8000', '#ff0000', '#c00000'];
  @Input() countBreak: number[] = [1, 5, 10, 50, 100, 500];
  @Input() timeBreak: string[] = ['2020-01-01', '2015-01-01', '2010-01-01', '2005-01-01', '2000-01-01', '1995-01-01'];
  @Input() countLabel: string[] = ['1-4', '5-9', '10-49', '50-99', '100-499', '500-'];
  @Input() timeLabel: string[] = ['2020-', '2015-', '2010-', '2005-', '2000-', '1995-'];

  maxBounds = [[58.7, 18.6], [71.1, 33.6]];
  geoJsonLayer;
  loading = false;
  taxon: Taxonomy;
  legendList: {color: string, label: string}[] = [];

  private currentColor;
  private current;

  constructor(
    private resultService: ResultService,
    public translate: TranslateService,
    private router: Router
  ) {
    const now = new Date();
    this.timeLabel[0] = now.getFullYear() + '-';
  }

  ngAfterViewInit() {
    this.initMapdata();
  }

  ngOnChanges() {
    this.initMapdata();
  }

  initMapdata() {
    const key = this.taxonId + this.time;
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
    this.resultService
      .getGeoJson(this.taxonId, this.time, this.collectionId)
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
          return {
            color: '#000000',
            weight: 0.3,
            opacity: 1,
            fillOpacity: 0.9
          };
        }
      });
      this.initMap();
      this.geoJsonLayer.on('click', (evt) => {
        if (!evt.layer.feature.properties || !evt.layer.feature.properties.grid) {
          return;
        }
        this.router.navigate([], {queryParams: {
          grid: evt.layer.feature.properties.grid,
          time: this.time,
          taxonId: this.taxonId,
          type: this.type
        }});
      });
    }
  }

  initTitle() {
    this.resultService.getTaxon(this.taxonId)
      .subscribe(taxon => this.taxon = taxon);
  }

  initColor() {
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
    let newColor = '#ffffff';
    for (const idx in this.timeBreak) {
      if (!this.timeBreak.hasOwnProperty(idx)) {
        continue;
      }
      if (cnt <= this.timeBreak[idx]) {
        newColor = this.colorRange[idx];
      } else {
        break;
      }
    }
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
    return newColor;
  }

  initMap() {
    if (!this.lajiMap.map || !this.lajiMap.map.map) {
      setTimeout(() => {
        this.initMap();
      }, 1000);
      return;
    }
    this.lajiMap.map.map.options.maxZoom = 8;
    this.lajiMap.map.map.options.minZoom = 2;
    this.geoJsonLayer.addTo(this.lajiMap.map.map);
  }

  private getColorKey() {
    return this.taxonId + this.time + this.type;
  }
}
