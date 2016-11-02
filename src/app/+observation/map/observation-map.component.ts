import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Subscription } from 'rxjs';
import { Util } from '../../shared/service/util.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { TranslateService } from 'ng2-translate';
import { ValueDecoratorService } from '../result-list/value-decorator.sevice';
import LatLngBounds = L.LatLngBounds;

@Component({
  selector: 'laji-observation-map',
  templateUrl: 'observation-map.component.html',
  styleUrls: ['./observation-map.component.css'],
  providers: [ValueDecoratorService]
})
export class ObservationMapComponent implements OnInit, OnChanges {

  @Input() visible: boolean = false;
  @Input() query: WarehouseQueryInterface;
  @Input() opacity: number = .5;
  @Input() lat: string[] = ['gathering.conversions.wgs84Grid05.lat', 'gathering.conversions.wgs84Grid005.lat'];
  @Input() lon: string[] = ['gathering.conversions.wgs84Grid1.lon', 'gathering.conversions.wgs84Grid01.lon'];
  // zoom levels from lowest to highest when to move to more accurate grid
  @Input() zoomThresholds: number[] = [5];
  // when active level is higher or equal to this will be using viewport coordinates to show grid
  @Input() onlyViewPortThreshold: number = 1;
  @Input() size: number = 5000;
  @Input() initWithWorldMap: boolean = false;
  @Input() lastPage: number = 7; // 0 = no page limit
  @Input() draw: any = false;
  @Input() height: number;
  @Input() selectColor: string = '#00aa00';
  @Input() color: any = ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'];
  @Input() showLoadMore: boolean = true;
  @Input() legend: boolean = false;
  @Input() colorThresholds = [10, 100, 1000, 10000]; // 0-10 color[0], 11-100 color[1] etc and 1001+ color[4]
  @Output() create = new EventEmitter();
  @Input() showItemsWhenLessThan: number = 0;
  @Input() tick: number;
  @Input() itemFields: string[] = [
    'unit.linkings.taxon',
    'gathering.team',
    'gathering.eventDate'
  ];

  public mapData;
  public drawData: any = {featureCollection: {type: 'featureCollection', features: []}};
  public loading = false;
  public topMargin: string = '0';
  public legendList: {color: string, range: string}[] = [];
  private prev: string = '';
  private subDataFetch: Subscription;
  private style: (count: number) => string;
  private lastQuery: WarehouseQueryInterface;
  private viewBound: LatLngBounds;
  private activeLevel = 0;
  private activeBounds: LatLngBounds;
  private reset = true;
  private showingItems = false;
  private legendsCache: any;
  private dataCache: any;


  private static getValue(row: any, propertyName: string): string {
    let val = '';
    let first = propertyName.split(',')[0];
    try {
      val = first.split('.').reduce((prev: any, curr: any) => prev[curr], row);
    } catch (e) {
    }
    return val;
  }

  private static getFeature(geometry: Object) {
    return {
      type: 'Feature',
      geometry: geometry
    };
  }

  constructor(private warehouseService: WarehouseApi,
              public translate: TranslateService,
              private decorator: ValueDecoratorService) {
  }

  ngOnInit() {
    this.lastQuery = JSON.stringify(this.query);
    this.updateMapData();
    this.initColorScale();
  }

  ngOnChanges() {
    this.decorator.lang = this.translate.currentLang;
    this.updateMapData();
    this.initLegendTopMargin();
    this.initLegend();
  }

  onCreate(e) {
    this.create.emit(e);
  }

  onMove(e) {
    let curActive = this.activeLevel;
    this.viewBound = e.bounds;
    this.activeLevel = 0;
    for (let i = 0, len = this.zoomThresholds.length; i < len; i++) {
      if (this.zoomThresholds[i] < e.zoom) {
        this.activeLevel = i + 1;
      }
    }
    if (
      !this.showingItems &&
      e.type === 'moveend' && (
        curActive !== this.activeLevel ||
        (this.activeLevel >= this.onlyViewPortThreshold && (!this.activeBounds || !this.activeBounds.contains(e.bounds)))
      )
    ) {
      this.activeBounds = e.bounds.pad(1);
      this.updateMapData();
    }
  }

  initLegendTopMargin(): void {
    let top = 20, items = this.color instanceof Array ? this.color.length : 1;
    this.topMargin = '-' + (top + (items * 20)) + 'px';
  }

  initLegend(): void {
    let legend = [];
    let start = 1;
    if (this.color instanceof Array) {
      this.color.map((color, idx) => {
        let end = '+', newStart;
        if (this.colorThresholds[idx]) {
          newStart = this.colorThresholds[idx];
          end = '-' + newStart;
        }
        legend.push({
          color: color,
          range: start + end
        });
        start = newStart + 1;
      });
    }
    this.legendList = legend;
  }

  private initColorScale() {
    if (typeof this.color === 'string') {
      this.style = () => String(this.color);
    } else {
      let i, len = this.colorThresholds.length, memory = {};
      this.style = (count) => {
        if (memory[count]) {
          return memory[count];
        }
        let found = false;
        for (i = 0; i < len; i++) {
          if (count <= this.colorThresholds[i]) {
            memory[count] = this.color[i];
            found = true;
            break;
          }
        }
        if (!found) {
          memory[count] = this.color[len];
        }
        return memory[count];
      };
    }
  }

  private initDrawData() {
    this.drawData.getFeatureStyle = () => {
      return {
        weight: 2,
        opacity: 1,
        fillOpacity: 0,
        color: this.selectColor
      };
    };
    if (!this.query.coordinates) {
      return;
    }
    let features = [];
    this.query.coordinates.map(coord => {
      let parts = coord.split(':');
      let system = parts.pop();
      if (system === 'WGS84' && parts.length === 4) {
        features.push(ObservationMapComponent.getFeature({
          type: 'Polygon',
          coordinates: [[
            [parts[2], parts[0]], [parts[2], parts[1]],
            [parts[3], parts[1]], [parts[3], parts[0]],
            [parts[2], parts[0]]
          ]]
        }));
      }
    });
    if (features.length) {
      this.drawData.featureCollection.features = features;
    }
  }

  private updateMapData() {
    let query = Util.clone(this.query);
    let cacheKey = this.getCacheKey(query);
    if (this.prev === cacheKey) {
      return;
    }
    this.prev = cacheKey;
    if (this.subDataFetch) {
      this.subDataFetch.unsubscribe();
    }
    this.drawData.featureCollection.features = [];
    if (query.coordinates) {
      this.initDrawData();
    }
    this.reset = true;
    this.loading = true;
    this.showingItems = false;
    this.addToMap(query);
  }

  private addToMap(query: WarehouseQueryInterface, page = 1) {
    const items$ = this.warehouseService.warehouseQueryListGet(query, [
      'gathering.conversions.wgs84CenterPoint.lon',
      'gathering.conversions.wgs84CenterPoint.lat',
      ...this.itemFields
    ], undefined, this.showItemsWhenLessThan).map(data => {
      let features = [];
      if (data.results) {
        data.results.map(row => {
          let coordinates = [
            ObservationMapComponent.getValue(row, 'gathering.conversions.wgs84CenterPoint.lon'),
            ObservationMapComponent.getValue(row, 'gathering.conversions.wgs84CenterPoint.lat')
          ];
          if (!coordinates[0] || !coordinates[0]) {
            return;
          }
          let properties = {title: 1};
          this.itemFields.map(field => {
            let name = field.split('.').pop();
            properties[name] = ObservationMapComponent.getValue(row, field);
          });
          features.push({
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': coordinates
            },
            'properties': properties
          });
        });
      }
      return {
        featureCollection: {
          'type': 'FeatureCollection',
          'features': features
        },
        cluster: {
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: true,
          singleMarkerMode: true,
          maxClusterRadius: 60
        }
      };
    }).do(() => {
      if (this.activeLevel < this.onlyViewPortThreshold) {
        this.showingItems = true;
      }
    });

    const count$ = this.warehouseService
      .warehouseQueryCountGet(query)
      .switchMap(cnt => {
        return cnt.total < this.showItemsWhenLessThan ? items$ : (this.warehouseService.warehouseQueryAggregateGet(
          this.addViewPortCoordinates(query), [this.lat[this.activeLevel] + ',' + this.lon[this.activeLevel]],
          undefined, this.size, page, true
        ));
      });

    this.subDataFetch = (this.showItemsWhenLessThan > 0 ? count$ : (this.warehouseService.warehouseQueryAggregateGet(
      this.addViewPortCoordinates(query), [this.lat[this.activeLevel] + ',' + this.lon[this.activeLevel]],
      undefined, this.size, page, true
    )))
      .subscribe(
        (data) => {
          if (data.featureCollection) {
            if (this.reset) {
              this.reset = false;
              this.dataCache = data.featureCollection;
            } else {
              this.dataCache.features =
                this.dataCache.features.concat(data.featureCollection.features);
            }
          }
          if (data.lastPage > page && (this.lastPage === 0 || page <= this.lastPage)) {
            page++;
            this.addToMap(query, page);
          } else {
            this.mapData = [{
              featureCollection: Util.clone(this.dataCache),
              getFeatureStyle: this.getStyle.bind(this),
              getClusterStyle: this.getClusterStyle.bind(this),
              getPopup: this.getPopup.bind(this),
              cluster: data.cluster || false
            }];
            this.loading = false;
          }
        }
      );
  }

  private addViewPortCoordinates(query: WarehouseQueryInterface) {
    if (!query.coordinates && this.activeBounds && this.activeLevel >= this.onlyViewPortThreshold) {
      query.coordinates = [
        this.activeBounds.getSouthWest().lat + ':' + this.activeBounds.getNorthEast().lat + ':' +
        this.activeBounds.getSouthWest().lng + ':' + this.activeBounds.getNorthEast().lng + ':WGS84'
      ];
    }
    return query;
  }

  private getCacheKey(query: WarehouseQueryInterface) {
    let cache = JSON.stringify(query);
    if ((!this.activeBounds || this.activeLevel < this.onlyViewPortThreshold) || query.coordinates) {
      return cache + this.activeLevel;
    }
    return cache + this.activeBounds.toBBoxString() + this.activeLevel;
  }

  private getClusterStyle(count) {
    return {
      weight: 1,
      opacity: 1,
      fillOpacity: 1,
      color: this.style(count)
    };
  }

  private getStyle(data: StyleParam) {
    let currentColor = '#00aa00';
    let feature = this.mapData[data.dataIdx].featureCollection.features[data.featureIdx];
    if (feature.properties.title) {
      currentColor = this.style(+feature.properties.title);
    }
    return {
      weight: 1,
      opacity: 1,
      fillOpacity: this.opacity,
      color: currentColor
    };
  }


  private getPopup(idx: number, cb: Function) {
    try {
      const properties = this.mapData[0].featureCollection.features[idx].properties;
      let cnt = properties.title;
      let description = '';
      this.itemFields.map(field => {
        let name = field.split('.').pop();
        if (properties[name]) {
          description += this.decorator.decorate(field, properties[name], {}) + '<br>';
        }
      });
      if (description) {
        cb(description);
      } else if (cnt) {
        this.translate.get('result.allObservation')
          .subscribe(translation => cb(`${cnt} ${translation}`));
      }
    } catch (e) {
    }
  }
}

interface StyleParam {
  dataIdx: number;
  featureIdx: number;
}
