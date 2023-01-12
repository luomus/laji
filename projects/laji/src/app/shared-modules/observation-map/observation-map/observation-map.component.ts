import { catchError, concat, delay, filter, map, retryWhen, switchMap, take, tap, timeout } from 'rxjs/operators';
import { of, of as ObservableOf, Subscription, throwError as observableThrowError, Observable, forkJoin, from } from 'rxjs';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
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
import { LajiMapComponent } from '@laji-map/laji-map.component';
import { LajiMapDataOptions, LajiMapOptions, LajiMapTileLayerName } from '@laji-map/laji-map.interface';
import { PlatformService } from '../../../root/platform.service';
import { DataOptions, DataWrappedLeafletEventData, TileLayersOptions } from 'laji-map';
import { environment } from '../../../../environments/environment';
import { convertLajiEtlCoordinatesToGeometry, convertWgs84ToYkj, convertYkjToWgs, getFeatureFromGeometry } from '../../../root/coordinate-utils';
import {
  lajiMapObservationVisualization,
  ObservationVisualizationMode
} from 'projects/laji/src/app/shared-modules/observation-map/observation-map/observation-visualization';
import L, { LeafletEvent, PathOptions } from 'leaflet';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { Coordinates } from './observation-map-table/observation-map-table.component';
import { BoxDataOptionsCache } from './box-dataoptions-cache';

interface AggregateQueryResponse {
  cacheTimestamp: number;
  currentPage: number;
  features: Array<Feature<Geometry, GeoJsonProperties>>;
  lastPage: number;
  pageSize: number;
  total: number;
  type: 'FeatureCollection';
}

// Given coordinates in warehouse query format
// Returns a featureCollection visualizing that set of coordinates
const getFeatureCollectionFromQueryCoordinates$ = (coordinates: any): Observable<any> => (
  ObservableOf(coordinates
    ? coordinates.map(
      (coord: any) => getFeatureFromGeometry(convertLajiEtlCoordinatesToGeometry(coord))
    ) : []
  ).pipe(
    map(
      features => ({
        type: 'FeatureCollection',
        features
      })
    )
  )
);

const getPointIcon = (po: PathOptions, feature: Feature): L.DivIcon => {
  const icon: any = L.divIcon({
    className: po.className,
    html: `<span>${feature.properties.count}</span>`
  });
  icon.setStyle = (iconDomElem: HTMLElement, po2: PathOptions) => {
    iconDomElem.style['background-color'] = po2.color + 'A0';
    iconDomElem.style['height'] = '30px';
    iconDomElem.style['width'] = '30px';
    iconDomElem.style['border-radius'] = '100%';
    if (po2.className) {
      iconDomElem.classList.add(po2.className);
    }
  };
  return icon;
};

const BOX_QUERY_AGGREGATE_LEVELS = [
  ['gathering.conversions.wgs84Grid05.lat', 'gathering.conversions.wgs84Grid1.lon'],
  ['gathering.conversions.wgs84Grid005.lat', 'gathering.conversions.wgs84Grid01.lon']
];

@Component({
  selector: 'laji-observation-map',
  templateUrl: './observation-map.component.html',
  styleUrls: ['./observation-map.component.scss'],
  providers: [ValueDecoratorService, LabelPipe, ToQNamePipe, CollectionNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationMapComponent implements OnChanges, OnDestroy {
  @ViewChild(LajiMapComponent) lajiMap: LajiMapComponent;
  @ViewChild('mapContainer', { static: false }) mapContainerElem: ElementRef;

  @Input() visible = false;
  @Input() query: any;
  @Input() opacity = .5;
  // Zoom levels from lowest to highest when to move to more accurate grid.
  @Input() zoomThresholds: number[] = [4, 8, 10, 12, 14];
  // When active zoom threshold level (index in 'zoomThresholds') is below this, the viewport coordinates are added to the query.
  @Input() onlyViewportThresholdLevel = 1;
  @Input() set initWithWorldMap(world: boolean) {
    this.mapOptions = {
      ...this.mapOptions,
      tileLayerName: world
        ? LajiMapTileLayerName.openStreetMap
        : LajiMapTileLayerName.taustakartta
    };
  }
  @Input() set draw(draw: any) {
    this.mapOptions = {...this.mapOptions, draw};
  }
  @Input() set center(center: [number, number]) {
    this.mapOptions = {...this.mapOptions, center};
  }
  @Input() set showControls(show: boolean) {
    this.mapOptions = {...this.mapOptions, controls: show ? { draw: false } : false};
  }
  @Input() set clickBeforeZoomAndPan(clickBeforeZoomAndPan: boolean) {
    this.mapOptions = {...this.mapOptions, clickBeforeZoomAndPan};
  }
  @Input() ready = true;
  /**
   * height < 0: fill remaining height in window
   * height > 0: set absolute height
   * else: height: 100%
   */
  @Input() height;
  @Input() selectColor = '#00aa00';
  @Input() showLoadMore = true;
  @Input() settingsKey = 'observationMap';
  @Input() hideLegend = false;
  @Input() itemFields: string[] = [
    'unit.linkings.taxon',
    'unit.taxonVerbatim',
    'gathering.team',
    'gathering.eventDate',
    'document.documentId',
    'unit.unitId',
    'unit.interpretations.recordQuality',
    'document.linkings.collectionQuality',
    'gathering.interpretations.coordinateAccuracy'
  ];

  @Output() create = new EventEmitter();

  visualization = lajiMapObservationVisualization;
  visualizationMode: ObservationVisualizationMode = 'obsCount';
  mapData: any[] = [];
  loading = false;
  reloading = false;
  showingIndividualPoints = false;
  mapOptions: LajiMapOptions;

  tableViewHeightOverride = -1;
  selectedObservationCoordinates: Coordinates;

  private useFinnishMap = false;
  private drawData: LajiMapDataOptions = {
    featureCollection: {type: 'FeatureCollection', features: []},
    getFeatureStyle: () => ({
      weight: 2,
      opacity: 1,
      fillOpacity: 0,
      color: this.selectColor
    })
  };

  private previousQueryHash = '';
  private boxDataOptionsCache = new BoxDataOptionsCache();
  private previousDataOptions: DataOptions;

  private boxGeometryPageSize = 10000;
  private pointGeometryPageSize = 10000;
  private pointModeBreakpoint = 5000;
  private activeZoomThresholdLevel = 0;
  private activeZoomThresholdBounds?: any;
  private dataFetchSubscription: Subscription;

  constructor(
    private warehouseService: WarehouseApi,
    private platformService: PlatformService,
    public translate: TranslateService,
    private decorator: ValueDecoratorService,
    private logger: Logger,
    private cdr: ChangeDetectorRef
  ) {
    this.mapOptions = {
      controls: {
        draw: false
      },
      zoom: 1.5,
      draw: false,
      tileLayerName: LajiMapTileLayerName.openStreetMap,
      clickBeforeZoomAndPan: true
    };
    if ((environment as any).observationMapOptions) {
      Object.assign(this.mapOptions, ...(environment as any).observationMapOptions);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.platformService.isBrowser) {
      return;
    }
    this.decorator.lang = this.translate.currentLang;
    if (changes['query'] || changes['ready']) {
      this.boxDataOptionsCache.reset();
      this.updateMap();
    }
  }

  ngOnDestroy() {
    this.dataFetchSubscription?.unsubscribe();
  }

  onCreate(e) {
    this.create.emit(e);
  }

  clearDrawData() {
    this.lajiMap?.map?.clearDrawData();
  }

  drawToMap(type) {
    this.lajiMap.drawToMap(type);
  }

  onMapPanOrZoom(e) {
    const curActiveZoomThresholdLevel = this.activeZoomThresholdLevel;
    const len = this.zoomThresholds.length;
    this.activeZoomThresholdLevel = 0;
    for (let i = 0; i < len; i++) {
      if (this.zoomThresholds[i] < e.zoom) {
        this.activeZoomThresholdLevel = i + 1;
      }
    }

    const activeBoundsContainViewport = this.activeZoomThresholdBounds && this.activeZoomThresholdBounds.contains(e.bounds);
    const zoomChange = this.activeZoomThresholdLevel !== curActiveZoomThresholdLevel;

    if (
      !(this.showingIndividualPoints && activeBoundsContainViewport)
      && (
            zoomChange
        || !activeBoundsContainViewport // Moved
      )
    ) {
      this.activeZoomThresholdBounds = e.bounds.pad(1);
      this.updateMap();
    }
  }

  onTileLayersChange(layerOptions: TileLayersOptions) {
    const temp = layerOptions.active === 'finnish';
    if (temp !== this.useFinnishMap) {
      this.useFinnishMap = temp;
      this.boxDataOptionsCache.reset();
      this.updateMap();
    }
  }

  onVisualizationModeChange(mode: string) {
    const fetchRequired = mode !== this.visualizationMode && (
      mode === 'redlistStatus'
      || this.visualizationMode === 'redlistStatus'
    );
    this.visualizationMode = <ObservationVisualizationMode>mode;

    if (fetchRequired) {
      this.boxDataOptionsCache.reset();
      this.updateMap();
    } else {
      const dataOptions = this.mapData[0];
      if (!dataOptions) { return; }
      const vis = this.visualization?.[this.visualizationMode];
      if (vis?.getFeatureStyle) { dataOptions.getFeatureStyle = vis.getFeatureStyle; }
      // changing mapData object reference so that laji-map recognizes that it has changed
      this.mapData = [...this.mapData];
    }
  }

  resetTable() {
    this.selectedObservationCoordinates = undefined;
    this.cdr.detectChanges();
    // Wait until next cycle so that height has time to adjust to the removal of the table
    setTimeout(() => {
      this.tableViewHeightOverride = undefined;
      this.cdr.detectChanges();
    });
  }

  private addVisualizationParams(query: WarehouseQueryInterface) {
    switch (this.visualizationMode) {
      case 'individualCount':
      case 'recordQuality':
      case 'recordAge':
      case 'obsCount':
      default:
        query.onlyCount = false;
        break;
      case 'redlistStatus':
        query.onlyCount = false;
        query.taxonCounts = true;
        break;
    }
  }

  private queryIsInsideViewport(query: WarehouseQueryInterface): boolean {
    if (!query.coordinates)  {
      return false;
    }

    const bounds = (window.L as any).geoJSON(convertLajiEtlCoordinatesToGeometry(query.coordinates)).getBounds();
    return this.lajiMap?.map.map.getBounds().contains(bounds);
  }

  private addViewPortCoordinatesParams(query: WarehouseQueryInterface, bounds?: any) {
    if (!this.queryIsInsideViewport(query) && bounds && this.activeZoomThresholdLevel >= this.onlyViewportThresholdLevel) {
      query.wgs84CenterPoint =
        Math.max(bounds.getSouthWest().lat, -90)
        + ':' + Math.min(bounds.getNorthEast().lat, 90)
        + ':' + Math.max(bounds.getSouthWest().lng, -180)
        + ':' + Math.min(bounds.getNorthEast().lng, 180)
        + ':WGS84';
    }
  }

  private onDataClick(coordinates: Coordinates) {
    this.selectedObservationCoordinates = coordinates;
    this.tableViewHeightOverride = (window.innerHeight - this.mapContainerElem.nativeElement.getBoundingClientRect().top) *.8;
    this.cdr.detectChanges();
    this.cdr.markForCheck();
  }

  private getPointsDataOptions$(query: WarehouseQueryInterface): Observable<DataOptions> {
    return this.warehouseService.warehouseQueryAggregateGet(
      { ...query, featureType: 'CENTER_POINT' },
      [ 'gathering.interpretations.coordinateAccuracy' ],
      undefined,
      this.pointGeometryPageSize,
      undefined,
      true,
      query.onlyCount
    ).pipe(
      map(data => (<DataOptions>{
        featureCollection: {
          type: 'FeatureCollection' as const,
          features: data.features
        },
        on: {
          click: (e, d) => this.onDataClick({
            type: 'wgs84',
            coordinates: (d.feature.geometry as any).coordinates
          })
        },
        marker: {
          icon: getPointIcon
        }
      }))
    );
  }

  private onAggregateDataClick(e: LeafletEvent, data: DataWrappedLeafletEventData) {
    const coords = (data.feature.geometry as any).coordinates[0];
    const lats = []; const lons = [];
    coords.forEach(c => { lats.push(c[1]); lons.push(c[0]); });
    const latMin = Math.min(...lats); const lonMin = Math.min(...lons);

    let coordinates: Coordinates | undefined;
    if (this.useFinnishMap) {
      const ykj = convertWgs84ToYkj(latMin, lonMin);
      coordinates = {
        type: 'ykj',
        coordinates: [Math.round(ykj[0] / 10000), Math.round(ykj[1] / 10000)]
      };
      this.onDataClick(coordinates);
    } else {
      const latMax = Math.max(...lats); const lonMax = Math.max(...lons);
      coordinates = {
        type: 'wgs84',
        square: { latMin, latMax, lonMin, lonMax }
      };
    }

    this.onDataClick(coordinates);
  }

  private getBoxQuery$(query: WarehouseQueryInterface, aggregateBy: string[], page: number): Observable<AggregateQueryResponse> {
    return this.warehouseService.warehouseQueryAggregateGet(query, aggregateBy, undefined, this.boxGeometryPageSize, page, true);
  }

  private getAllBoxes$(query: WarehouseQueryInterface, aggregateBy: string[]): Observable<DataOptions> {
    // do the first query
    return this.getBoxQuery$(query, aggregateBy, 1).pipe(
      switchMap(firstPage => (
        forkJoin([
          of(firstPage),
          // get remaining pages
          ...Array.from(new Array(firstPage.lastPage - 1).keys(), (_, i) => i + 2).map(i => this.getBoxQuery$(query, aggregateBy, i))
        ])
      )),
      map(allPages => ({
        featureCollection: {
          type: allPages[0].type,
          features: allPages.reduce((p, c) => { p.push(...c.features); return p; }, [])
        },
        on: {
          click: (e, data) => this.onAggregateDataClick(e, data)
        }
      }))
    );
  }

  private getBoxQueryAggregateLevel(): number {
    return Math.min(BOX_QUERY_AGGREGATE_LEVELS.length - 1, this.activeZoomThresholdLevel);
  }

  private getBoxDataOptions$(query: WarehouseQueryInterface, bounds?: any): Observable<DataOptions | null> {
    const aggregateLevel = this.getBoxQueryAggregateLevel();
    const match = this.boxDataOptionsCache.match(bounds, aggregateLevel, this.useFinnishMap);
    if (match) {
      // return null if we are already displaying the cached result
      if (match === this.previousDataOptions) {
        this.loading = false;
        this.cdr.markForCheck();
        return of(null);
      }
      // return cached result
      return of(match);
    }
    const aggregateBy = this.useFinnishMap
      ? ['gathering.conversions.ykj10kmCenter.lat', 'gathering.conversions.ykj10kmCenter.lon']
      : BOX_QUERY_AGGREGATE_LEVELS[aggregateLevel];

    return this.getAllBoxes$(query, aggregateBy).pipe(
      tap(data => {
        this.boxDataOptionsCache.update(aggregateLevel, bounds, data);
      })
    );
  }

  private updateMap() {
    const bounds = this.activeZoomThresholdBounds;
    const query = this.prepareQuery(bounds);
    const hash = JSON.stringify(query);
    if (hash === this.previousQueryHash) { return; }
    this.previousQueryHash = hash;
    forkJoin({
      drawData: this.getDrawData$(query),
      dataOptions: this.getDataOptions$(query, bounds)
    }).subscribe(({drawData, dataOptions}) => {
      this.lajiMap?.map?.clearDrawData();
      this.mapData = [drawData, dataOptions];
    });
  }

  private prepareQuery(bounds?: any): WarehouseQueryInterface {
    const query = { ...this.query };

    this.addVisualizationParams(query);
    this.addViewPortCoordinatesParams(query, bounds);

    return query;
  }

  private getDrawData$(query: WarehouseQueryInterface): Observable<LajiMapDataOptions> {
    return getFeatureCollectionFromQueryCoordinates$(
      query.coordinates
    ).pipe(
      tap(featureCollection => {
        this.drawData = {...this.drawData, featureCollection};
      }),
      map(() => this.drawData)
    );
  }

  private getDataOptions$(query: WarehouseQueryInterface, bounds?): Observable<LajiMapDataOptions> {
    this.loading = true;
    this.cdr.markForCheck();

    return this.warehouseService.warehouseQueryCountGet(query).pipe(
      switchMap(res => {
        if (!res.total) {
          return of(<DataOptions>{
            lastPage: 1,
            featureCollection: {
              type: 'FeatureCollection' as const,
              features: []
            }
          });
        } else if (res.total <= this.pointModeBreakpoint) {
          return this.getPointsDataOptions$(query).pipe(tap(() => this.showingIndividualPoints = true));
        } else {
          return this.getBoxDataOptions$(query, bounds).pipe(tap(() => this.showingIndividualPoints = false));
        }
      }),
      // null is returned when we get a valid result, but don't have to do anything
      filter(d => d !== null),
      tap(d => this.previousDataOptions = d),
      // retry on timeout
      timeout(WarehouseApi.longTimeout * 3),
      delay(100),
      retryWhen(errors => errors.pipe(delay(1000), take(3), concat(observableThrowError(errors)))),
      // add visualization
      map(dataOptions => {
        const vis = this.visualization?.[this.visualizationMode];
        if (vis?.getFeatureStyle) { dataOptions.getFeatureStyle = vis.getFeatureStyle; }
        return dataOptions;
      }),
      // update the map
      tap(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }),
      catchError(e => {
        this.logger.warn('Failed to load observation map data!', e);
        return of(null);
      })
    );
  }
}
