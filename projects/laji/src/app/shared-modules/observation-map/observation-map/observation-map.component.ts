import { concat, delay, map, retryWhen, switchMap, take, tap, timeout } from 'rxjs/operators';
import { of, of as ObservableOf, Subscription, throwError as observableThrowError } from 'rxjs';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { TranslateService } from '@ngx-translate/core';
import { ValueDecoratorService } from '../../../+observation/result-list/value-decorator.sevice';
import { Logger } from '../../../shared/logger/logger.service';
import { LabelPipe } from '../../../shared/pipe/label.pipe';
import { ToQNamePipe } from '../../../shared/pipe/to-qname.pipe';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { CollectionNamePipe } from '../../../shared/pipe/collection-name.pipe';
import { CoordinateService } from '../../../shared/service/coordinate.service';
import { LajiMapComponent } from '@laji-map/laji-map.component';
import { LajiMapOptions, LajiMapTileLayerName } from '@laji-map/laji-map.interface';
import { PlatformService } from '../../../shared/service/platform.service';
import { latLngBounds as LlatLngBounds } from 'leaflet';
import { TileLayersOptions } from 'laji-map';

@Component({
  selector: 'laji-observation-map',
  templateUrl: './observation-map.component.html',
  styleUrls: ['./observation-map.component.css'],
  providers: [ValueDecoratorService, LabelPipe, ToQNamePipe, CollectionNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationMapComponent implements OnChanges, OnDestroy {
  @ViewChild(LajiMapComponent) lajiMap: LajiMapComponent;

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
  @Input() set initWithWorldMap(world: boolean) {
    this._mapOptions = {
      ...this._mapOptions,
      tileLayerName: world
        ? LajiMapTileLayerName.openStreetMap
        : LajiMapTileLayerName.taustakartta
    };
  }
  @Input() lastPage = 0; // 0 = no page limit
  @Input() set draw(draw: any) {
    this._mapOptions = {...this._mapOptions, draw};
  }
  @Input() set center(center: [number, number]) {
    this._mapOptions = {...this._mapOptions, center};
  }
  @Input() set showControls(show: boolean) {
    this._mapOptions = {...this._mapOptions, controls: show ? { draw: false } : false};
  }
  @Input() set clickBeforeZoomAndPan(clickBeforeZoomAndPan: boolean) {
    this._mapOptions = {...this._mapOptions, clickBeforeZoomAndPan};
  }
  @Input() ready = true;
  @Input() unitCount: number;
  /**
   * height < 0: fill remaining height in window
   * height > 0: set absolute height
   * else: height: 100%
   */
  @Input() height;
  @Input() selectColor = '#00aa00';
  @Input() color: any;
  @Input() showLoadMore = true;
  @Input() settingsKey = 'observationMap';
  @Input() legend = false;
  @Input() colorThresholds = [10, 100, 1000, 10000]; // 0-10 color[0], 11-100 color[1] etc and 1001+ color[4]
  @Output() create = new EventEmitter();
  @Input() showItemsWhenLessThan = 0;
  @Input() itemFields: string[] = [
    'unit.linkings.taxon',
    'unit.taxonVerbatim',
    'gathering.team',
    'gathering.eventDate',
    'document.documentId',
    'unit.unitId',
    'unit.interpretations.recordQuality',
    'document.linkings.collectionQuality'
  ];
  limitResults = false;

  mapData;
  drawData: any = {featureCollection: {type: 'featureCollection', features: []}};
  loading = false;
  reloading = false;
  topMargin = '0';
  legendList: {color: string, range: string}[] = [];

  _mapOptions: LajiMapOptions = {
    controls: {
      draw: false
    },
    zoom: 1.5,
    draw: false,
    tileLayerName: LajiMapTileLayerName.openStreetMap
  };

  private prev = '';
  private subDataFetch: Subscription;
  private style: (count: number) => string;
  private viewBound: any;
  private activeLevel = 0;
  private activeBounds: any;
  private reset = true;
  private showingItems = false;
  private dataCache: any;
  private init = false;


  private static getValue(row: any, propertyName: string): string {
    let val = '';
    const first = propertyName.split(',')[0];
    try {
      val = first.split('.').reduce((prev: any, curr: any) => prev[curr], row);
    } catch (e) {
    }
    return val;
  }

  constructor(
    private warehouseService: WarehouseApi,
    private platformService: PlatformService,
    public translate: TranslateService,
    private decorator: ValueDecoratorService,
    private coordinateService: CoordinateService,
    private logger: Logger,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.platformService.isBrowser) {
      return;
    }
    if (!this.init) {
      this.init = true;

      this.viewBound = LlatLngBounds;
      this.activeBounds = LlatLngBounds;
      if (!this.color) {
        this.color = ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'];
      }
      this.initColorScale();
    }
    this.decorator.lang = this.translate.currentLang;
    // First update is triggered by tile layer update event from the laji-map
    if (changes['query'] || changes['unitCount'] || changes['ready']) {
      this.updateMapData();
    }
    this.initLegendTopMargin();
    this.initLegend();
  }

  ngOnDestroy() {
    if (this.subDataFetch) {
      this.subDataFetch.unsubscribe();
    }
  }

  onCreate(e) {
    this.create.emit(e);
  }

  clearDrawData() {
    if (this.lajiMap && this.lajiMap.map) {
      this.lajiMap.map.clearDrawData();
    }
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
    if (this.activeBounds && !this.activeBounds.contains) {
      this.activeBounds = e.bounds.pad(1);
    }
    if (
      e.type === 'moveend' && (
        curActive !== this.activeLevel ||
        (this.activeLevel >= this.onlyViewPortThreshold && !this.activeBounds.contains(e.bounds))
      )
    ) {
      this.activeBounds = e.bounds.pad(1);
      if (!this.showingItems) {
        this.updateMapData();
      }
    }
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

  onTileLayersChange(layerOptions: TileLayersOptions) {
    const shouldLimit = layerOptions.active === 'finnish';
    if (this.limitResults !== shouldLimit) {
      this.limitResults = shouldLimit;
    }
    this.updateMapData();
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
      return;
    }
    const features = [];
    this.query.coordinates.map(coord => {
      features.push(
        this.coordinateService.getFeatureFromGeometry(
          this.coordinateService.convertLajiEtlCoordinatesToGeometry(coord)
        )
      );
    });
    if (features.length) {
      this.drawData.featureCollection.features = features;
    }
  }

  private updateMapData() {
    if (!this.ready || (typeof this.unitCount !== 'undefined' && (this.unitCount === 0 || this.unitCount === null))) {
      if (this.unitCount === 0) {
        this.prev = '';
        this.emptyMap();
      }
      return;
    }
    const cacheKey = this.getCacheKey(this.query);
    if (this.prev === cacheKey) {
      return;
    }
    this.prev = cacheKey;
    if (this.subDataFetch) {
      this.subDataFetch.unsubscribe();
    }
    this.drawData.featureCollection.features = [];
    if (this.query.coordinates) {
      this.initDrawData();
    }
    this.reset = true;
    this.loading = true;
    this.showingItems = false;
    this.addToMap(this.query);
  }

  private addToMap(query: WarehouseQueryInterface, page = 1) {
    if (this.limitResults && !query.coordinates) {
      query = {...query, coordinates: ['51.692882:72.887912:-6.610917:60.892721:WGS84']};
    }
    const items$ = this.warehouseService.warehouseQueryListGet(query, [
      'gathering.conversions.wgs84CenterPoint.lon',
      'gathering.conversions.wgs84CenterPoint.lat',
      ...this.itemFields
    ], undefined, this.showItemsWhenLessThan).pipe(map(data => {
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
          const properties = {count: 1};
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
    })).pipe(tap(() => {
      if (this.activeLevel < this.onlyViewPortThreshold) {
        this.showingItems = true;
      }
    }));

    const countRemote$ = this.warehouseService.warehouseQueryCountGet(query).pipe(
      map(result => result.total)
    );

    const count$ = (typeof this.unitCount === 'undefined' ? countRemote$ : of(this.unitCount)).pipe(
      switchMap(cnt => {
        if (!cnt) {
          return of({
            lastPage: 1,
            featureCollection: {
              'type': 'FeatureCollection',
              'features': []
            }
          });
        } else if (cnt < this.showItemsWhenLessThan) {
          return items$;
        } else {
          return (this.warehouseService.warehouseQueryAggregateGet(
            this.addViewPortCoordinates(query), [this.lat[this.activeLevel] + ',' + this.lon[this.activeLevel]],
            undefined, this.size, page, true
          ));
        }
      }));

    this.subDataFetch = ObservableOf(this.showItemsWhenLessThan).pipe(
      switchMap((less) => {
        return less > 0 ? count$ : this.warehouseService.warehouseQueryAggregateGet(
          this.addViewPortCoordinates(query), [this.lat[this.activeLevel] + ',' + this.lon[this.activeLevel]],
          undefined, this.size, page, true
        );
      })).pipe(
        timeout(WarehouseApi.longTimeout * 3),
        delay(100),
        retryWhen(errors => errors.pipe(delay(1000), take(3), concat(observableThrowError(errors)))),
      ).subscribe((data: any) => {
          this.clearDrawData();
          if (this.reset) {
            this.reset = false;
            this.dataCache = data.featureCollection || data;
          } else {
            this.dataCache.features =
              this.dataCache.features.concat((data.featureCollection || data).features);
          }
          if (data.lastPage > page && (this.lastPage === 0 || page <= this.lastPage)) {
            page++;
            this.addToMap(query, page);
          } else {
            this.mapData = [{
              featureCollection: this.dataCache,
              getFeatureStyle: this.getStyle.bind(this),
              getClusterStyle: this.getClusterStyle.bind(this),
              getPopup: this.getPopup.bind(this),
              cluster: data.cluster || false
            }, this.drawData];
            this.loading = false;
            this.changeDetector.markForCheck();
          }
        },
        (err) => {
          this.loading = false;
          this.changeDetector.markForCheck();
          this.logger.warn('Could not getList list for the map!', err);
        }
      );
  }

  private addViewPortCoordinates(query: WarehouseQueryInterface) {
    if (!query.coordinates && this.activeBounds && this.activeLevel >= this.onlyViewPortThreshold) {
      return {
        ...query,
        coordinates: [
          Math.max(this.activeBounds.getSouthWest().lat, -90) + ':' + Math.min(this.activeBounds.getNorthEast().lat, 90) + ':' +
          Math.max(this.activeBounds.getSouthWest().lng, -180) + ':' + Math.min(this.activeBounds.getNorthEast().lng, 180) + ':WGS84'
        ]
      };
    }
    return query;
  }

  private getCacheKey(query: WarehouseQueryInterface) {
    const cache = [JSON.stringify(query), this.limitResults, this.unitCount].join(':');
    if (!(this.activeBounds && this.activeBounds.toBBoxString)) {
      return cache + this.activeLevel;
    }
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
    if (data.feature && data.feature.properties && data.feature.properties.count) {
      currentColor = this.style(+data.feature.properties.count);
    }
    return {
      weight: 1,
      opacity: 1,
      fillOpacity: this.opacity,
      color: currentColor
    };
  }


  private getPopup({featureIdx}, cb: Function) {
    const lang = this.translate.currentLang;
    this.translate.get('more')
      .subscribe((moreInfo) => {
        try {
          const properties = this.mapData[0].featureCollection.features[featureIdx].properties;
          const cnt = properties.count;
          let description = '';
          this.itemFields.map(field => {
            const name = field.split('.').pop();
            if (properties[name] && name !== 'documentId' && name !== 'unitId') {
              if (field === 'unit.taxonVerbatim' && properties['taxon']) {
                return;
              }
              description += this.decorator.decorate(field, properties[name], {}) + '<br>';
            }
          });
          if (properties['documentId'] && properties['unitId']) {
            description += '<a target="_blank" href="' +
              (lang !== 'fi' ? '/' + lang : '') +
              '/view?uri=' +
              properties['documentId'] +
              '&highlight=' +
              properties['unitId'].replace('#', '%23') + '">' +
              moreInfo + '</a>';
          }
          if (description) {
            cb(description);
          } else if (cnt) {
            return;
            // this.translate.getList('result.allObservation')
            //  .subscribe(translation => cb(`${cnt} ${translation}`));
          }
        } catch (e) {
          this.logger.log('Failed to display popup for the map', e);
        }
      });
  }

  private emptyMap() {
    const mapData = [];
    this.clearDrawData();

    if (this.query.coordinates) {
      this.initDrawData();
      mapData.push(this.drawData);
    }
    this.mapData = mapData;
  }
}

interface StyleParam {
  dataIdx: number;
  feature: any;
  featureIdx: number;
}
