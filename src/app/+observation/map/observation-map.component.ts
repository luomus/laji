import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Util } from '../../shared/service/util.service';
import { TranslateService } from '@ngx-translate/core';
import { ValueDecoratorService } from '../result-list/value-decorator.sevice';
import { Logger } from '../../shared/logger/logger.service';
import { LabelPipe } from '../../shared/pipe/label.pipe';
import { ToQNamePipe } from '../../shared/pipe/to-qname.pipe';
import 'leaflet';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { MapComponent } from '../../shared/map/map.component';
import { CollectionNamePipe } from '../../shared/pipe/collection-name.pipe';
import { CoordinateService } from '../../shared/service/coordinate.service';
import LatLngBounds = L.LatLngBounds;

const maxCoordinateAccuracy = 10000;

@Component({
  selector: 'laji-observation-map',
  templateUrl: './observation-map.component.html',
  styleUrls: ['./observation-map.component.css'],
  providers: [ValueDecoratorService, LabelPipe, ToQNamePipe, CollectionNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationMapComponent implements OnInit, OnChanges {
  @ViewChild(MapComponent) lajiMap: MapComponent;

  @Input() visible = false;
  @Input() query: any;
  @Input() opacity = .5;
  @Input() lat: string[] = ['gathering.conversions.wgs84Grid05.lat', 'gathering.conversions.wgs84Grid005.lat'];
  @Input() lon: string[] = ['gathering.conversions.wgs84Grid1.lon', 'gathering.conversions.wgs84Grid01.lon'];
  // zoom levels from lowest to highest when to move to more accurate grid
  @Input() zoomThresholds: number[] = [4];
  // when active level is higher or equal to this will be using viewport coordinates to show grid
  @Input() onlyViewPortThreshold = 1;
  @Input() size = 10000;
  @Input() initWithWorldMap = false;
  @Input() lastPage = 0; // 0 = no page limit
  @Input() draw: any = false;
  @Input() center: [number, number];
  @Input() showControls = true;
  @Input() height = 500;
  @Input() selectColor = '#00aa00';
  @Input() color: any;
  @Input() showLoadMore = true;
  @Input() settingsKey = 'observationMap';
  @Input() legend = false;
  @Input() colorThresholds = [10, 100, 1000, 10000]; // 0-10 color[0], 11-100 color[1] etc and 1001+ color[4]
  @Output() create = new EventEmitter();
  @Input() showItemsWhenLessThan = 0;
  @Input() tick: number;
  @Input() itemFields: string[] = [
    'unit.linkings.taxon',
    'gathering.team',
    'gathering.eventDate',
    'document.documentId',
    'unit.unitId'
  ];

  public mapData;
  public drawData: any = {featureCollection: {type: 'featureCollection', features: []}};
  public loading = false;
  public lang: string;
  public reloading = false;
  public topMargin = '0';
  public legendList: {color: string, range: string}[] = [];
  private prev = '';
  private subDataFetch: Subscription;
  private subLang: Subscription;
  private style: (count: number) => string;
  private lastQuery: any;
  private viewBound: LatLngBounds;
  private activeLevel = 0;
  private activeBounds: LatLngBounds;
  private reset = true;
  private showingItems = false;
  private dataCache: any;
  private accuracy;


  private static getValue(row: any, propertyName: string): string {
    let val = '';
    const first = propertyName.split(',')[0];
    try {
      val = first.split('.').reduce((prev: any, curr: any) => prev[curr], row);
    } catch (e) {
    }
    return val;
  }

  private static getFeature(geometry: Object) {
    return {
      type: 'Feature',
      properties: {},
      geometry: geometry
    };
  }

  constructor(private warehouseService: WarehouseApi,
              public translate: TranslateService,
              private decorator: ValueDecoratorService,
              private coordinateService: CoordinateService,
              private logger: Logger,
              private changeDetector: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    if (!this.color) {
      this.color = ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'];
    }
    this.lastQuery = JSON.stringify(this.query);
    this.updateMapData();
    this.initColorScale();
    this.lang = this.translate.currentLang;
    this.subLang = this.translate.onLangChange.subscribe(() => {
      this.lang = this.translate.currentLang;
      this.changeDetector.markForCheck();
    });
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

  drawToMap(type) {
    this.lajiMap.drawToMap(type);
  }

  onMove(e) {
    const curActive = this.activeLevel;
    const len = this.zoomThresholds.length;
    this.viewBound = e.bounds;
    this.activeLevel = 0;
    for (let i = 0; i < len; i++) {
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

  invalidateSize() {
    this.lajiMap.invalidateSize();
  }

  initLegendTopMargin(): void {
    const top = 20, items = this.color instanceof Array ? this.color.length : 1;
    this.topMargin = '-' + (top + (items * 20)) + 'px';
  }

  initLegend(): void {
    const legend = [];
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
    this.changeDetector.markForCheck();
  }

  refreshMap() {
    setTimeout(() => {
      this.reloading = true;
    }, 100);
    setTimeout(() => {
      this.reloading = false;
    }, 200);
  }

  private initColorScale() {
    if (typeof this.color === 'string') {
      this.style = () => String(this.color);
    } else {
      let i;
      const len = this.colorThresholds.length, memory = {};
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
      this.accuracy = maxCoordinateAccuracy;
      return;
    }
    const features = [];
    this.query.coordinates.map(coord => {
      const parts = coord.split(':');
      const system = parts.pop();
      if (system === 'WGS84' && parts.length === 4) {
        if (!this.query.coordinateAccuracyMax) {
          const spot1 = new (L as any).LatLng(+parts[2], +parts[0]);
          const spot2 = new (L as any).LatLng(+parts[2], +parts[1]);
          const spot3 = new (L as any).LatLng(+parts[3], +parts[1]);
          setTimeout(() => {
            if (!this.query.coordinateAccuracyMax) {
              this.query.coordinateAccuracyMax = Math.max(Math.pow(10, Math.ceil(
                Math.log(Math.min(
                  spot1.distanceTo(spot3),
                  spot1.distanceTo(spot2),
                  maxCoordinateAccuracy
                )) * Math.LOG10E)), 1
              );
            }
          });
        }
        features.push(ObservationMapComponent.getFeature({
          type: 'Polygon',
          coordinates: [[
            [parts[2], parts[0]], [parts[2], parts[1]],
            [parts[3], parts[1]], [parts[3], parts[0]],
            [parts[2], parts[0]]
          ]]
        }));
      } else if (system === 'YKJ' && parts.length === 2) {
        if (!this.query.coordinateAccuracyMax) {
          setTimeout(() => {
            this.query.coordinateAccuracyMax = Math.pow(10, 7 - parts[0].length);
          });
        }
        features.push(
          this.coordinateService.convertYkjToGeoJsonFeature(
            parts[0], parts[1]
          )
        );
      }
    });
    if (features.length) {
      this.drawData.featureCollection.features = features;
    }
  }

  private updateMapData() {
    const query = Util.clone(this.query);
    const cacheKey = this.getCacheKey(query);
    if (this.prev === cacheKey) {
      this.changeDetector.markForCheck();
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
    if (WarehouseApi.isEmptyQuery(query)) {
      query.cache = true;
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
      const features = [];
      if (data.results) {
        data.results.map(row => {
          const coordinates = [
            ObservationMapComponent.getValue(row, 'gathering.conversions.wgs84CenterPoint.lon'),
            ObservationMapComponent.getValue(row, 'gathering.conversions.wgs84CenterPoint.lat')
          ];
          if (!coordinates[0] || !coordinates[0]) {
            return;
          }
          const properties = {title: 1};
          this.itemFields.map(field => {
            const name = field.split('.').pop();
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
        lastPage: 1,
        featureCollection: {
          'type': 'FeatureCollection',
          'features': features
        },
        cluster: {
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: true,
          singleMarkerMode: true,
          maxClusterRadius: 20
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
        if (cnt.total < this.showItemsWhenLessThan) {
          return items$;
        } else {
          return (this.warehouseService.warehouseQueryAggregateGet(
            this.addViewPortCoordinates(query), [this.lat[this.activeLevel] + ',' + this.lon[this.activeLevel]],
            undefined, this.size, page, true
          ));
        }
      });
    this.subDataFetch = Observable.of(this.showItemsWhenLessThan)
      .switchMap((less) => {
        return less > 0 ? count$ : this.warehouseService.warehouseQueryAggregateGet(
          this.addViewPortCoordinates(query), [this.lat[this.activeLevel] + ',' + this.lon[this.activeLevel]],
          undefined, this.size, page, true
        );
      })
      .delay(100)
      .subscribe((data: any) => {
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
            this.changeDetector.markForCheck();
          }
        }
      );
  }

  /**
   * This cannot be used at the moment since addData method in the map is working like set data
   * @param query
   * @param page
   */
  private addData(query: WarehouseQueryInterface, page) {
    this.warehouseService.warehouseQueryAggregateGet(
      this.addViewPortCoordinates(query), [this.lat[this.activeLevel] + ',' + this.lon[this.activeLevel]],
      undefined, this.size, page, true
    ).subscribe(data => {
      if (data.featureCollection) {
        this.lajiMap.addData([{
          featureCollection: data.featureCollection,
          getFeatureStyle: this.getStyle.bind(this),
          getClusterStyle: this.getClusterStyle.bind(this),
          getPopup: this.getPopup.bind(this),
          cluster: data.cluster || false
        }]);
      }
      if (data.lastPage > page && (this.lastPage === 0 || page <= this.lastPage)) {
        page++;
        this.addData(query, page);
      } else {
        this.loading = false;
      }
    });
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
    const cache = JSON.stringify(query);
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
    if (data.feature && data.feature.properties && data.feature.properties.title) {
      currentColor = this.style(+data.feature.properties.title);
    }
    return {
      weight: 1,
      opacity: 1,
      fillOpacity: this.opacity,
      color: currentColor
    };
  }


  private getPopup(idx: number, geometry: any, cb: Function) {
    this.translate.get('more')
      .subscribe((moreInfo) => {
        try {
          const properties = this.mapData[0].featureCollection.features[idx].properties;
          const cnt = properties.title;
          let description = '';
          this.itemFields.map(field => {
            const name = field.split('.').pop();
            if (properties[name] && name !== 'documentId' && name !== 'unitId') {
              description += this.decorator.decorate(field, properties[name], {}) + '<br>';
            }
          });
          if (properties['documentId'] && properties['unitId']) {
            description += '<a target="_blank" href="/view?uri=' +
              properties['documentId'] +
              '&highlight=' +
              properties['unitId'].replace('#', '_') + '">' +
              moreInfo + '</a>';
          }
          if (description) {
            cb(description);
          } else if (cnt) {
            return;
            // this.translate.get('result.allObservation')
            //  .subscribe(translation => cb(`${cnt} ${translation}`));
          }
        } catch (e) {
          this.logger.log('Failed to display popup for the map', e);
        }
      });
  }
}

interface StyleParam {
  dataIdx: number;
  feature: any;
  featureIdx: number;
}
