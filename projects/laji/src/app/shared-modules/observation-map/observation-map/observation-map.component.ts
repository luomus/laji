import { concat, delay, map, retryWhen, switchMap, take, tap, timeout } from 'rxjs/operators';
import { of, of as ObservableOf, Subscription, throwError as observableThrowError, Observable, forkJoin, from } from 'rxjs';
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
import { LajiMapComponent } from '@laji-map/laji-map.component';
import { LajiMapDataOptions, LajiMapOptions, LajiMapTileLayerName } from '@laji-map/laji-map.interface';
import { PlatformService } from '../../../root/platform.service';
import { DataOptions, TileLayersOptions } from 'laji-map';
import { environment } from '../../../../environments/environment';
import { convertLajiEtlCoordinatesToGeometry, getFeatureFromGeometry } from '../../../root/coordinate-utils';
import {
  lajiMapObservationVisualization,
  lajiMapObservationVisualizationContext,
  ObservationVisualizationMode
} from 'projects/laji/src/app/shared-modules/observation-map/observation-map/observation-visualization';
import { FeatureCollection } from 'geojson';

interface ObservationDataOptions extends DataOptions {
  lastPage: number;
}

// given a string of delimited by , and .
// take the first portion delimited by ,
// then each part of the resulting string delimited by .
// then attempt to find nested value of row that matches the sequence of properties
// eg. for nestedProperty = 'gathering.conversions.wgs84CenterPoint.lon,gathering.conversions.wgs84CenterPoint.lat'
//     get the value of 'obj.gathering.conversions.wgs84CenterPoint.lon'
const getNestedPropertyFromObj = (nestedProperty: string, obj: any): string => {
  let val = '';
  const first = nestedProperty.split(',')[0];
  try {
    val = first.split('.').reduce((prev: any, curr: any) => prev[curr], obj);
  } catch (e) {}
  return val;
};

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

@Component({
  selector: 'laji-observation-map',
  templateUrl: './observation-map.component.html',
  styleUrls: ['./observation-map.component.scss'],
  providers: [ValueDecoratorService, LabelPipe, ToQNamePipe, CollectionNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationMapComponent implements OnChanges, OnDestroy {
  @ViewChild(LajiMapComponent) lajiMap: LajiMapComponent<ObservationVisualizationMode>;

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

  private limitResults = false;
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
  private activeZoomThresholdLevel = 0;
  private activeZoomThresholdBounds?: any;
  private dataFetchSubscription: Subscription;

  constructor(
    private warehouseService: WarehouseApi,
    private platformService: PlatformService,
    public translate: TranslateService,
    private decorator: ValueDecoratorService,
    private logger: Logger,
    private changeDetector: ChangeDetectorRef
  ) {
    this.mapOptions = {
      controls: {
        draw: false
      },
      zoom: 1.5,
      draw: false,
      tileLayerName: LajiMapTileLayerName.openStreetMap
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
    const insideActiveBounds = this.activeZoomThresholdBounds && this.activeZoomThresholdBounds.contains(e.bounds);
    const outOfViewport = this.activeZoomThresholdLevel >= this.onlyViewportThresholdLevel && !insideActiveBounds;
    const showingIndividualPointsAlreadyAndZoomedIn = this.activeZoomThresholdLevel >= curActiveZoomThresholdLevel && this.showingIndividualPoints;
    const tresholdLevelChanged = curActiveZoomThresholdLevel !== this.activeZoomThresholdLevel;
    if (
      e.type === 'moveend' && (
        (tresholdLevelChanged && !showingIndividualPointsAlreadyAndZoomedIn)
        || outOfViewport
      )
    ) {
      this.activeZoomThresholdBounds = e.bounds.pad(1);
      this.updateMap();
    }
  }

  onTileLayersChange(layerOptions: TileLayersOptions) {
    const shouldLimit = layerOptions.active === 'finnish';
    if (this.limitResults !== shouldLimit) {
      this.limitResults = shouldLimit;
    }
    this.updateMap();
  }

  onVisualizationModeChange(mode: ObservationVisualizationMode) {
    this.visualizationMode = mode;
    this.updateMap();
  }

  addVisualizationParams(query: WarehouseQueryInterface) {
    switch (this.visualizationMode) {
      case 'individualCount':
      case 'recordQuality':
      case 'recordAge':
      case 'obsCount':
        query.featureType = 'CENTER_POINT';
        query.onlyCount = false;
        query.pessimisticDateRangeHandling = true;
        break;
      case 'redlistStatus':
        query.featureType = 'CENTER_POINT';
        query.onlyCount = false;
        query.taxonCounts = true;
        break;
    }
  }

  private addViewPortCoordinatesParams(query: WarehouseQueryInterface) {
    if (!query.coordinates && this.activeZoomThresholdBounds && this.activeZoomThresholdLevel >= this.onlyViewportThresholdLevel) {
      query.coordinates = [
        Math.max(this.activeZoomThresholdBounds.getSouthWest().lat, -90) + ':' + Math.min(this.activeZoomThresholdBounds.getNorthEast().lat, 90) + ':' +
        Math.max(this.activeZoomThresholdBounds.getSouthWest().lng, -180) + ':' + Math.min(this.activeZoomThresholdBounds.getNorthEast().lng, 180) + ':WGS84'
      ];
    }
  }

  private getPointsDataOptions$(query: WarehouseQueryInterface): Observable<ObservationDataOptions> {
    return this.warehouseService.warehouseQueryListGet(
      query, [
        'gathering.conversions.wgs84CenterPoint.lon',
        'gathering.conversions.wgs84CenterPoint.lat',
        ...this.itemFields
      ],
      undefined,
      this.showIndividualPointsWhenLessThan
    ).pipe(
      map(data => {
        const features = [];
        if (data.results) {
          data.results.map(row => {
            const coordinates = [
              getNestedPropertyFromObj('gathering.conversions.wgs84CenterPoint.lon', row),
              getNestedPropertyFromObj('gathering.conversions.wgs84CenterPoint.lat', row)
            ];
            if (!coordinates[0] || !coordinates[1]) {
              return;
            }
            const properties = {count: 1};
            this.itemFields.map(field => {
              const name = field.split('.').pop();
              properties[name] = getNestedPropertyFromObj(field, row);
            });
            features.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates
              },
              properties
            });
          });
        }
        return {
          lastPage: 1,
          featureCollection: {
            type: 'FeatureCollection' as const,
            features
          },
          cluster: {
            spiderfyOnMaxZoom: false,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: false,
            singleMarkerMode: true,
            maxClusterRadius: 20
          }
        };
      }),
      tap(() => {
        this.showingIndividualPoints = true;
      })
    );
  }

  private getAggregateDataOptions$(query: WarehouseQueryInterface, page: number): Observable<ObservationDataOptions> {
    return this.warehouseService.warehouseQueryAggregateGet(
      query, this.getActiveZoomThresholdLevelToAggregateBy(),
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

  private updateMap() {
    if (!this.ready) {
      return;
    }

    const query: WarehouseQueryInterface = {...this.query};
    if (this.limitResults && !query.coordinates) {
      query.coordinates = ['51.692882:72.887912:-6.610917:60.892721:WGS84'];
    }
    this.addViewPortCoordinatesParams(query);
    this.addVisualizationParams(query);

    const queryHash = this.getQueryHash(this.query);
    if (this.previousQueryHash === queryHash) {
      return;
    }
    this.previousQueryHash = queryHash;

    this.loading = true;
    this.drawData.featureCollection.features = [];
    this.showingIndividualPoints = false; // TODO: why are we resetting here?

    this.dataFetchSubscription = getFeatureCollectionFromQueryCoordinates$(this.query.coordinates).pipe(
      // update drawData
      tap(featureCollection => {
        this.drawData = {...this.drawData, featureCollection};
      }),
      // get observation count
      switchMap(() => this.warehouseService.warehouseQueryCountGet(query)),
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
          return this.getPointsDataOptions$(query);
        } else {
          return this.getAllAggregatePages$(query);
        }
      }),
      // retry on timeout
      timeout(WarehouseApi.longTimeout * 3),
      delay(100),
      retryWhen(errors => errors.pipe(delay(1000), take(3), concat(observableThrowError(errors)))),
    ).subscribe(dataOptions => {
      // update map data
      this.clearDrawData(); // TODO: why are we clearing draw data??
      this.mapData = [{
        featureCollection: dataOptions.featureCollection,
        getPopup: this.getPopup.bind(this),
        cluster: dataOptions.cluster || false
      }, this.drawData];
      lajiMapObservationVisualizationContext.features = dataOptions.featureCollection.features;
      this.loading = false;
      this.changeDetector.markForCheck();
    }, (err) => {
      this.loading = false;
      this.changeDetector.markForCheck();
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

  // TODO: check everything below this ...
  private getQueryHash(query: WarehouseQueryInterface) {
    const cache = [JSON.stringify(query), this.limitResults].join(':');
    if (!this.activeZoomThresholdBounds) {
      return cache + this.activeZoomThresholdLevel;
    }
    if ((!this.activeZoomThresholdBounds || this.activeZoomThresholdLevel < this.onlyViewportThresholdLevel) || query.coordinates) {
      return cache + this.activeZoomThresholdLevel;
    }
    return cache + this.activeZoomThresholdBounds.toBBoxString() + this.activeZoomThresholdLevel;
  }

  private getPopup({featureIdx}, cb: (description: string) => void) {
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
}
