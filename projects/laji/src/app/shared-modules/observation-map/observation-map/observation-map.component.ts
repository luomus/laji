import { concat, delay, map, retryWhen, switchMap, take, tap, timeout } from 'rxjs/operators';
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
import { DataOptions, TileLayersOptions } from 'laji-map';
import { environment } from '../../../../environments/environment';
import { convertLajiEtlCoordinatesToGeometry, convertYkjToWgs, getFeatureFromGeometry } from '../../../root/coordinate-utils';
import {
  lajiMapObservationVisualization,
  ObservationVisualizationMode
} from 'projects/laji/src/app/shared-modules/observation-map/observation-map/observation-visualization';
import L, { PathOptions } from 'leaflet';
import { Feature } from 'geojson';

interface ObservationDataOptions extends DataOptions {
  lastPage: number;
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

const FINNISH_MAP_BOUNDS = ['51.692882:72.887912:-6.610917:60.892721:WGS84'];

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
  @Input() zoomThresholdAggregateByLatLevels: string[] = ['gathering.conversions.wgs84Grid05.lat', 'gathering.conversions.wgs84Grid005.lat'];
  @Input() zoomThresholdAggregateByLonLevels: string[] = ['gathering.conversions.wgs84Grid1.lon', 'gathering.conversions.wgs84Grid01.lon'];
  // Zoom levels from lowest to highest when to move to more accurate grid.
  @Input() zoomThresholds: number[] = [4, 8, 10, 12, 14];
  // When active zoom threshold level (index in 'zoomThresholds') is below this, the viewport coordinates are added to the query.
  @Input() onlyViewportThresholdLevel = 1;
  @Input() size = 10000;
  @Input() set initWithWorldMap(world: boolean) {
    this.mapOptions = {
      ...this.mapOptions,
      tileLayerName: world
        ? LajiMapTileLayerName.openStreetMap
        : LajiMapTileLayerName.taustakartta
    };
  }
  @Input() lastPage = 0; // 0 = no page limit
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
  @Input() showIndividualPointsWhenLessThan = 10000;
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
  mapData;
  loading = false;
  reloading = false;
  showingIndividualPoints = false;
  mapOptions: LajiMapOptions;

  tableViewHeightOverride = -1;
  selectedObservationCoordinates: [number, number];

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
  private previousQueryResponse;
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
    // First update is triggered by tile layer update event from the laji-map
    if (changes['query'] || changes['ready']) {
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

    const outOfActiveBounds = this.activeZoomThresholdBounds && !this.activeZoomThresholdBounds.contains(e.bounds);
    const zoomedInAndNotShowingPoints = this.activeZoomThresholdLevel > curActiveZoomThresholdLevel && !this.showingIndividualPoints;
    const zoomedOut = this.activeZoomThresholdLevel < curActiveZoomThresholdLevel;

    if (outOfActiveBounds
      || zoomedInAndNotShowingPoints
      || zoomedOut
    ) {
      this.activeZoomThresholdBounds = e.bounds.pad(1);
      this.updateMap();
    }
  }

  onTileLayersChange(layerOptions: TileLayersOptions) {
    this.useFinnishMap = layerOptions.active === 'finnish';
    this.updateMap();
  }

  onVisualizationModeChange(mode: string) {
    this.visualizationMode = <ObservationVisualizationMode>mode;
    this.updateMap(true);
  }

  private resetTable() {
    this.selectedObservationCoordinates = undefined;
    this.tableViewHeightOverride = undefined;
    this.cdr.markForCheck();
  }

  private addVisualizationParams(query: WarehouseQueryInterface) {
    switch (this.visualizationMode) {
      case 'individualCount':
      case 'recordQuality':
      case 'recordAge':
      case 'obsCount':
        query.onlyCount = false;
        query.pessimisticDateRangeHandling = true;
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

  private addViewPortCoordinatesParams(query: WarehouseQueryInterface) {
    if (!this.queryIsInsideViewport(query) && this.activeZoomThresholdBounds && this.activeZoomThresholdLevel >= this.onlyViewportThresholdLevel) {
      query.coordinates = [
        Math.max(this.activeZoomThresholdBounds.getSouthWest().lat, -90) + ':' + Math.min(this.activeZoomThresholdBounds.getNorthEast().lat, 90) + ':' +
        Math.max(this.activeZoomThresholdBounds.getSouthWest().lng, -180) + ':' + Math.min(this.activeZoomThresholdBounds.getNorthEast().lng, 180) + ':WGS84'
      ];
    }
  }

  private getPointsDataOptions$(query: WarehouseQueryInterface): Observable<ObservationDataOptions> {
    return this.warehouseService.warehouseQueryAggregateGet(
      { ...query, featureType: 'CENTER_POINT' },
      [ 'gathering.interpretations.coordinateAccuracy' ],
      undefined,
      this.showIndividualPointsWhenLessThan,
      undefined,
      true,
      query.onlyCount
    ).pipe(
      map(data => (<ObservationDataOptions>{
        featureCollection: {
          type: 'FeatureCollection' as const,
          features: data.features
        },
        lastPage: 1,
        on: {
          click: (...args) => {
            this.selectedObservationCoordinates = (args[1].feature.geometry as any).coordinates;
            this.tableViewHeightOverride = (window.innerHeight - this.mapContainerElem.nativeElement.getBoundingClientRect().top) *.8;
            this.cdr.detectChanges();
            this.cdr.markForCheck();
          }
        },
        marker: {
          icon: (po: PathOptions, feature: Feature) => {
            const icon: any = L.divIcon({
              className: po.className,
              html: `<span>${feature.properties.count}</span>`
            });
            icon.setStyle = (iconDomElem: HTMLElement, po2: PathOptions) => {
              iconDomElem.style['background-color'] = po2.color + 'A0';
              //iconDomElem.style['opacity'] = ''+po2.fillOpacity;
              iconDomElem.style['height'] = '30px';
              iconDomElem.style['width'] = '30px';
              iconDomElem.style['border-radius'] = '100%';
              if (po2.className) {
                iconDomElem.classList.add(po2.className);
              }
            };
            return icon;
          }
        }
      })),
      tap(() => {
        this.showingIndividualPoints = true;
      })
    );
  }

  private getAggregateDataOptions$(query: WarehouseQueryInterface, page: number): Observable<ObservationDataOptions> {
    return this.warehouseService.warehouseQueryAggregateGet(
      query,
      this.useFinnishMap
        ? ['gathering.conversions.ykj10kmCenter.lat', 'gathering.conversions.ykj10kmCenter.lon']
        : this.getActiveZoomThresholdLevelToAggregateBy(),
      undefined, this.size, page, true
    ).pipe(
      map(res => (<ObservationDataOptions>{
        featureCollection: { type: res.type, features: res.features },
        lastPage: res.lastPage
      })),
      tap(() => {
        this.showingIndividualPoints = false;
      })
    );
  }

  private getAllAggregatePages$(query: WarehouseQueryInterface): Observable<ObservationDataOptions> {
    // do the first query
    return this.getAggregateDataOptions$(query, 1).pipe(
      switchMap(firstPage => (
        forkJoin([
          of(firstPage),
          // get remaining pages
          ...Array.from(new Array(firstPage.lastPage - 1).keys(), (_, i) => i + 2).map(i => this.getAggregateDataOptions$(query, i))
        ])
      )),
      map(allPages => {
        const firstPage = allPages[0];
        for (let i = 1; i < allPages.length; i++) {
          // join features of all pages to the first page
          firstPage.featureCollection.features.push(...(<ObservationDataOptions>allPages[i]).featureCollection.features);
        }
        // return the modified first page
        return firstPage;
      })
    );
  }

  private updateMap(forceMapRefresh = false) {
    if (!this.ready) { return; }

    const modifiedQuery: WarehouseQueryInterface = {...this.query};
    if (this.useFinnishMap && !modifiedQuery.coordinates) {
      modifiedQuery.coordinates = FINNISH_MAP_BOUNDS;
    }
    this.addViewPortCoordinatesParams(modifiedQuery);
    this.addVisualizationParams(modifiedQuery);

    const queryHash = this.getQueryHash(modifiedQuery);
    const hashMatch = this.previousQueryHash === queryHash;
    if (hashMatch && !forceMapRefresh) { return; }
    this.previousQueryHash = queryHash;

    this.loading = true;
    this.dataFetchSubscription = getFeatureCollectionFromQueryCoordinates$(this.query.coordinates).pipe(
      // update drawData
      tap(featureCollection => {
        this.drawData = {...this.drawData, featureCollection};
      }),
      switchMap(() => hashMatch ? of(this.previousQueryResponse) : this.warehouseService.warehouseQueryCountGet(modifiedQuery).pipe(
        // get observation count
        map(result => result.total),
        // get observations as points or aggregate
        switchMap(count => {
          if (!count) {
            return of(<ObservationDataOptions>{
              lastPage: 1,
              featureCollection: {
                type: 'FeatureCollection' as const,
                features: []
              }
            });
          }
          if (count < this.showIndividualPointsWhenLessThan) {
            return this.getPointsDataOptions$(modifiedQuery);
          } else {
            return this.getAllAggregatePages$(modifiedQuery);
          }
        }),
        // retry on timeout
        timeout(WarehouseApi.longTimeout * 3),
        delay(100),
        retryWhen(errors => errors.pipe(delay(1000), take(3), concat(observableThrowError(errors)))),
        tap(data => this.previousQueryResponse = data)
      )),
      map(dataOptions => {
        const vis = this.visualization?.[this.visualizationMode];
        if (vis?.getFeatureStyle) { dataOptions.getFeatureStyle = vis.getFeatureStyle; }
        return dataOptions;
      })
    ).subscribe(dataOptions => {
      // update map data
      this.clearDrawData();
      this.mapData = [dataOptions, this.drawData];
      this.loading = false;
      this.resetTable();
    }, (err) => {
      this.loading = false;
      this.resetTable();
      this.logger.warn('Failed to add observations to the map!', err);
    });
  }

  private getActiveZoomThresholdLevelToAggregateBy(): string[] {
    return ['zoomThresholdAggregateByLatLevels', 'zoomThresholdAggregateByLonLevels'].map(latOrLon => {
      let level = this.activeZoomThresholdLevel;
      let aggregateBy = this[latOrLon][level];
      while (!aggregateBy) {
        level--;
        aggregateBy = this[latOrLon][level];
      }
      return aggregateBy;
    });
  }

  private getQueryHash(query: WarehouseQueryInterface) {
    const cache = [JSON.stringify(query), this.useFinnishMap].join(':');
    if (!this.activeZoomThresholdBounds) {
      return cache + this.activeZoomThresholdLevel;
    }
    if ((!this.activeZoomThresholdBounds || this.activeZoomThresholdLevel < this.onlyViewportThresholdLevel) || query.coordinates) {
      return cache + this.activeZoomThresholdLevel;
    }
    return cache + this.activeZoomThresholdBounds.toBBoxString() + this.activeZoomThresholdLevel;
  }
}
