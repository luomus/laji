import { catchError, concat, debounceTime, delay, filter, map, retryWhen, switchMap, take, tap, timeout } from 'rxjs/operators';
import { of, of as ObservableOf, Subscription, throwError as observableThrowError, Observable, forkJoin, Subject } from 'rxjs';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
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
import { LajiMapComponent } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.component';
import { PlatformService } from '../../../root/platform.service';
import type { DataOptions, Options, DataWrappedLeafletEventData, GetFeatureStyleOptions, TileLayersOptions } from '@luomus/laji-map';
import { TileLayerName } from '@luomus/laji-map/lib/defs';
import { combineColors } from '@luomus/laji-map/lib/utils';
import { environment } from '../../../../environments/environment';
import { convertLajiEtlCoordinatesToGeometry, convertWgs84ToYkj, getFeatureFromGeometry } from '../../../root/coordinate-utils';
import {
  colorClassNameMap,
  lajiMapObservationVisualization,
  ObservationVisualizationMode
} from 'projects/laji/src/app/shared-modules/observation-map/observation-map/observation-visualization';
import type { DivIcon, LeafletEvent, MarkerCluster, PathOptions } from 'leaflet';
import { Feature, GeoJsonProperties, Geometry, FeatureCollection, Polygon } from 'geojson';
import { Coordinates } from './observation-map-table/observation-map-table.component';
import { BoxCache } from './box-cache';

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
// Returns features visualizing that set of coordinates
const getFeaturesFromQueryCoordinates$ = (coordinates: string[]): Observable<Feature<Polygon>[]> => (
  ObservableOf(coordinates
    ? coordinates.map(
      (coord: string) => getFeatureFromGeometry(convertLajiEtlCoordinatesToGeometry(coord))
    ) : []
  )
);

const classNamesAsArr = (c?: string) => c?.split(' ') || [];
const opacityAsHexCode = (opacity: number) => opacity < 1 ? opacity
  .toString(16) // Convert to hex.
  .padEnd(4, '0') // Pad with zeros to fix length.
  .substr(2, 2) : ''; // Leave whole number our, pick the two first decimals.

const BOX_QUERY_AGGREGATE_LEVELS = [
  ['gathering.conversions.wgs84Grid05.lat', 'gathering.conversions.wgs84Grid1.lon'],
  ['gathering.conversions.wgs84Grid005.lat', 'gathering.conversions.wgs84Grid01.lon']
];

const ACTIVE_COLOR = '#6ca31d';

@Component({
  selector: 'laji-observation-map',
  templateUrl: './observation-map.component.html',
  styleUrls: ['./observation-map.component.scss'],
  providers: [ValueDecoratorService, LabelPipe, ToQNamePipe, CollectionNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationMapComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(LajiMapComponent) lajiMap!: LajiMapComponent;
  @ViewChild('mapContainer', { static: false }) mapContainerElem!: ElementRef;

  @Input() visible = false;
  @Input() query: any;
  // Zoom levels from lowest to highest when to move to more accurate grid.
  @Input() zoomThresholds: number[] = [4, 8, 10, 12, 14];
  // When active zoom threshold level (index in 'zoomThresholds') is below this, the viewport coordinates are added to the query.
  @Input() onlyViewportThresholdLevel = 1;
  @Input() set initWithWorldMap(world: boolean) {
    this.mapOptions = {
      ...this.mapOptions,
      tileLayerName: world
        ? TileLayerName.openStreetMap
        : TileLayerName.taustakartta
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
  @Input() set viewLocked(viewLocked: boolean) {
    this.mapOptions = {...this.mapOptions, viewLocked};
  }
  @Input() ready = true;
  /**
   * height < 0: fill remaining height in window
   * height > 0: set absolute height
   * else: height: 100%
   */
  @Input() height!: number;
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
  @Input() noClick = false;
  @Input() pointModeBreakpoint = 5000;
  @Input() showPrintControl = false;
  @Input() printMode = false;

  @Output() create = new EventEmitter();
  @Output() printModeChange = new EventEmitter<boolean>();

  visualization = lajiMapObservationVisualization;
  visualizationMode: ObservationVisualizationMode = 'obsCount';
  mapData: any[] = [];
  loading = false;
  showingIndividualPoints = false;
  mapOptions: Options;

  tableViewHeightOverride: number | undefined = -1;
  selectedObservationCoordinates: Coordinates | undefined;

  private useFinnishMap = false;
  private drawData: DataOptions = {
    featureCollection: {type: 'FeatureCollection', features: []},
    getFeatureStyle: () => ({
      weight: 2,
      color: this.selectColor
    }),
    maxFillOpacity: 0
  };

  private opacity = 0.627;
  private dataVisible = true;

  private previousQueryHash = '';
  private boxFeatureCollectionCache = new BoxCache<FeatureCollection>();
  private previousFeatureCollection!: FeatureCollection;
  private mapMoveEventSubject = new Subject<any>();

  private boxGeometryPageSize = 10000;
  private pointGeometryPageSize = 10000;
  private activeZoomThresholdLevel = 0;
  private activeZoomThresholdBounds?: any;
  private mapMoveSubscription!: Subscription;
  private mapDataSubscription?: Subscription;
  private activeGeometryHash!: string;

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
      tileLayerName: TileLayerName.openStreetMap,
      clickBeforeZoomAndPan: true
    };
    if ((environment as any).observationMapOptions) {
      Object.assign(this.mapOptions, (environment as any).observationMapOptions);
    }
  }

  ngOnInit(): void {
    this.mapMoveSubscription = this.mapMoveEventSubject.pipe(
      debounceTime(100)
    ).subscribe(e => this._onMapPanOrZoom(e));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.platformService.isBrowser) {
      return;
    }
    this.decorator.lang = this.translate.currentLang;
    if (changes['query'] || changes['ready']) {
      this.boxFeatureCollectionCache.reset();
      this.updateMap();
    }
  }

  ngOnDestroy() {
    this.mapMoveSubscription?.unsubscribe();
    this.mapDataSubscription?.unsubscribe();
  }

  onCreate(e: any) {
    this.create.emit(e);
  }

  clearDrawData() {
    this.lajiMap?.map?.clearDrawData();
  }

  drawToMap(type: any) {
    this.lajiMap.drawToMap(type);
  }

  // mapMoveEventSubject is debounced such that certain double events from leaflet are eliminated
  _onMapPanOrZoom(e: any) {
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

  onMapPanOrZoom(e: any) {
    this.mapMoveEventSubject.next(e);
  }

  onTileLayersChange(layerOptions: TileLayersOptions) {
    const temp = layerOptions.active === 'finnish';
    if (temp !== this.useFinnishMap) {
      this.useFinnishMap = temp;
      this.boxFeatureCollectionCache.reset();
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
      this.boxFeatureCollectionCache.reset();
      this.updateMap();
    } else {
      const dataIdx = 1;
      const dataOptions = this.lajiMap.map.getData()[dataIdx];
      if (!dataOptions) { return; }
      // Force LajiMap to redraw the occurrence data with the updated this.getFeatureStyle(), which uses the updated this.visualizationMode.
      this.lajiMap.map.redrawDataItem(dataIdx);
      this.lajiMap.map.getData()[dataIdx].groupContainer.refreshClusters();
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
    if (!query.coordinates || !this.platformService.isBrowser)  {
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

  private getPoints$(query: WarehouseQueryInterface): Observable<FeatureCollection> {
    return this.warehouseService.warehouseQueryAggregateGet(
      { ...query, featureType: 'CENTER_POINT' },
      [ 'gathering.interpretations.coordinateAccuracy' ],
      undefined,
      this.pointGeometryPageSize,
      undefined,
      true,
      query.onlyCount
    ).pipe(
      map(data => ({
        type: 'FeatureCollection' as const,
        features: data.features
      }))
    );
  }

  private onAggregateDataClick(e: LeafletEvent, data: DataWrappedLeafletEventData) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const coords = (data.feature!.geometry as any).coordinates[0];
    const lats: number[] = []; const lons: number[] = [];
    coords.forEach((c: any) => { lats.push(c[1]); lons.push(c[0]); });
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

  private getAllBoxes$(query: WarehouseQueryInterface, aggregateBy: string[]): Observable<FeatureCollection> {
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
          type: 'FeatureCollection',
          features: allPages.reduce((p, c) => { p.push(...c.features); return p; }, [] as Feature<Geometry, GeoJsonProperties>[])
      }))
    );
  }

  private getBoxQueryAggregateLevel(): number {
    return Math.min(BOX_QUERY_AGGREGATE_LEVELS.length - 1, this.activeZoomThresholdLevel);
  }

  private getBoxes$(query: WarehouseQueryInterface, bounds?: any): Observable<FeatureCollection | null> {
    const aggregateLevel = this.getBoxQueryAggregateLevel();
    const match = this.boxFeatureCollectionCache.match(bounds, aggregateLevel, this.useFinnishMap);
    if (match) {
      // return null if we are already displaying the cached result
      if (match === this.previousFeatureCollection) {
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
        this.boxFeatureCollectionCache.update(aggregateLevel, bounds, data);
      })
    );
  }

  private updateMap() {
    const bounds = this.activeZoomThresholdBounds;
    const query = this.prepareQuery(bounds);

    const hash = JSON.stringify(query) + this.useFinnishMap;
    if (hash === this.previousQueryHash) { return; }
    this.previousQueryHash = hash;

    this.mapDataSubscription?.unsubscribe();

    this.mapDataSubscription = forkJoin({
      drawData: this.getDrawData$(query),
      dataOptions: this.getDataOptions$(query, bounds)
    }).subscribe(({drawData, dataOptions}) => {
      this.mapData = [drawData, dataOptions];
      this.cdr.markForCheck();
    });
  }

  private prepareQuery(bounds?: any): WarehouseQueryInterface {
    const query = { ...this.query };

    this.addVisualizationParams(query);
    this.addViewPortCoordinatesParams(query, bounds);

    return query;
  }

  private getFeaturesFromQueryPolygonId(polygonId: string): Observable<Feature[]>{
    return polygonId
      ? this.warehouseService.getPolygonFeatureCollection(polygonId.split(':')[0]).pipe(
          map(featureCollection => (featureCollection as any).features)
      )
      : ObservableOf([]);
  }

  private getDrawData$(query: WarehouseQueryInterface): Observable<DataOptions> {
    return forkJoin([
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      getFeaturesFromQueryCoordinates$(query.coordinates!),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.getFeaturesFromQueryPolygonId(query.polygonId!)
    ]).pipe(
      map(([f1, f2]) => ({
        type: 'FeatureCollection' as const,
        features: [...f1, ...f2]
      })),
      tap(featureCollection => {
        this.drawData = {...this.drawData, featureCollection};
      }),
      map(() => this.drawData)
    );
  }

  getFeatureStyle(params: GetFeatureStyleOptions) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const style = this.visualization[this.visualizationMode].getFeatureStyle!(params);

    const {active, hovered} = params;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const isActiveBox = params.feature!.geometry.type !== 'Point' && active;
    // Active point is styled with classname, boxes receive color in the style object.
    // This is because the Leaflet Path objects don't support updating the class name.
    const baseColor = isActiveBox
      ? ACTIVE_COLOR
      : style.color;
    const maxColorChangeDecimal = 100;
    const color = combineColors(baseColor, ...(hovered ? ['#fff'] : []), maxColorChangeDecimal); // Highlight hovered item.
    const className = [
      style.className,
      colorClassNameMap[style.color!],
      active && !isActiveBox ? 'laji-map-active-pointer' : undefined
    ].filter(s => s).join(' ');
    const _style = {...style, color, className};
    if (isActiveBox) {
      _style.weight = 3;
      _style.fillColor = combineColors(style.color, ACTIVE_COLOR, maxColorChangeDecimal); // Slide color towards active color.
    }
    return _style;
  }

  private featureCollectionToDataOptions(featureCollection: FeatureCollection): DataOptions {
    const hash = (f: Feature) => JSON.stringify((f.geometry as any).coordinates);
    const existingActiveIdx = this.activeGeometryHash
      ? featureCollection.features.findIndex(f => hash(f) === this.activeGeometryHash)
      : undefined;
    const activeIdx = existingActiveIdx !== -1 ? existingActiveIdx : undefined;
    return {
      featureCollection,
      getFeatureStyle: this.getFeatureStyle.bind(this),
      activeIdx,
      onChange: (events) => {
        const [event] = events;
        if (event.type === 'active') {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.activeGeometryHash = hash(event.layer!.feature!);
        }
      },
      on: {
        click: this.onFeatureClick.bind(this)
      },
      cluster: {
        singleMarkerMode: true,
        maxClusterRadius: 15,
        iconCreateFunction: this.getClusterIcon.bind(this),
        showCoverageOnHover: false
      },
      label: this.translate.instant('observation.map.dataOpacityControl.label'),
      visible: this.dataVisible,
      opacity: this.opacity,
      maxFillOpacity: 0.8,
      controlFillOpacity: true,
      onOpacityChange: this.onOpacityChange.bind(this),
      onVisibleChange: this.onDataVisibleChange.bind(this),
      tabbable: false
    };
  }

  private onOpacityChange(opacity: number) {
    this.opacity = opacity;
  }

  private onDataVisibleChange(visible: boolean) {
    this.dataVisible = visible;
  }

  private onFeatureClick(e: any, d: any) {
    if (this.noClick) {
      return;
    }
    if (d.feature.geometry.type === 'Point') {
      this.onDataClick({
        type: 'wgs84',
        coordinates: (d.feature.geometry as any).coordinates
      });
    } else {
      this.onAggregateDataClick(e, d);
    }
  }

  private getDataOptions$(query: WarehouseQueryInterface, bounds?: any): Observable<DataOptions | null> {
    this.loading = true;
    this.cdr.markForCheck();

    return this.warehouseService.warehouseQueryCountGet(query).pipe(
      switchMap(res => {
        if (!res.total) {
          return of({
            type: 'FeatureCollection' as const,
            features: []
          } as FeatureCollection<Geometry, GeoJsonProperties>);
        } else if (res.total <= this.pointModeBreakpoint) {
          return this.getPoints$(query).pipe(tap(() => this.showingIndividualPoints = true));
        } else {
          return this.getBoxes$(query, bounds).pipe(tap(() => this.showingIndividualPoints = false));
        }
      }),
      // null is returned when we get a valid result, but don't have to do anything
      filter(d => d !== null),
      tap(d => this.previousFeatureCollection = <FeatureCollection<Geometry, GeoJsonProperties>>d),
      // retry on timeout
      timeout(WarehouseApi.longTimeout * 3),
      delay(100),
      retryWhen(errors => errors.pipe(delay(1000), take(3), concat(observableThrowError(errors)))),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      map(d => this.featureCollectionToDataOptions(d!)),
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

  private getClusterIcon(cluster: MarkerCluster): L.DivIcon {
    let classNames = ['coordinate-accuracy-cluster'];
    const childMarkers = cluster.getAllChildMarkers();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const count = childMarkers.reduce((prev, marker) => prev + marker.feature!.properties.count, 0);
    const icon: DivIcon = (window.L).divIcon({
      className: classNames.join(' '),
      html: `<span>${count}</span>`
    });

    // monkey patch the create icon function
    const oldCreateFn = icon.createIcon;
    icon.createIcon = (oldIcon: any) => {
      const iconDomElem = oldCreateFn.bind(icon)(oldIcon);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const clusterColor = this.visualization[this.visualizationMode].getClusterColor!(childMarkers);
      (iconDomElem.style as any)['background-color'] = clusterColor + opacityAsHexCode(this.opacity);
      iconDomElem.classList.add(colorClassNameMap[clusterColor]);
      return iconDomElem;
    };

    // setStyle is only called for point markers (not clusters of multiple markers)
    // therefore the clusters get the original styles described above,
    // and the point markers get the updated styles described below
    (<any>icon).setStyle = (iconDomElem: HTMLElement, po: PathOptions) => {
      iconDomElem.classList.remove('coordinate-accuracy-cluster');
      (iconDomElem.style as any)['background-color'] = po.color + opacityAsHexCode(this.opacity);
      const newClassNames = classNamesAsArr(po.className);
      classNames.forEach(c => iconDomElem.classList.remove(c));
      newClassNames.forEach(c => iconDomElem.classList.add(c));
      classNames = newClassNames;
    };
    return icon;
  }
}
