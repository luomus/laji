import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TableColumn } from '@swimlane/ngx-datatable';
import LajiMap, { TileLayerName } from 'laji-map';
import * as MapUtil from 'laji-map/lib/utils';
import { datatableClasses } from 'projects/bird-atlas/src/styles/datatable-classes';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AtlasApiService } from '../../core/atlas-api.service';
import { BreadcrumbId, BreadcrumbService } from '../../core/breadcrumb.service';

function convertYkjLatLngToWgsLngLat(latLng: [any, any]): [number, number] {
  return MapUtil.convertLatLng(latLng, 'EPSG:2393', 'WGS84').reverse();
}

function pad(value) {
  value = '' + value;
  return value + '0000000'.slice(value.length);
}

function getGeoJSONFeature(ykj: string): GeoJSON.Feature | null {
  const langLngStr = ykj.split(':');
  const lat = parseInt(langLngStr[0], 10);
  const lng = parseInt(langLngStr[1], 10);
  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }
  const latStart = pad(lat);
  const latEnd = pad(lat + 1);
  const lonStart = pad(lng);
  const lonEnd = pad(lng + 1);
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [([
        [latStart, lonStart],
        [latStart, lonEnd],
        [latEnd, lonEnd],
        [latEnd, lonStart],
        [latStart, lonStart],
      ] as [string, string][]).map(convertYkjLatLngToWgsLngLat)]
    }
  };
}

@Component({
  selector: 'ba-grid-info',
  templateUrl: './grid-info.component.html',
  styleUrls: ['./grid-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridInfoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('lajiMap', { static: false }) lajiMapElem: ElementRef;

  private unsubscribe$ = new Subject<void>();
  private loadMap$ = new BehaviorSubject<string>(undefined);

  data$ = this.route.paramMap.pipe(
    tap(() => this.breadcrumbs.setBreadcrumbName(BreadcrumbId.GridInfo, undefined)),
    switchMap(params => this.atlasApi.getGridElement(params.get('id'))),
    catchError(err => {
      console.error(err);
      return of({id: 'test'});
    }),
    map(elem => ({
      elem,
      rows: elem.data.map((d, idx) => ({
        idx: idx + 1,
        species: d.speciesId,
        code: d.atlasCode,
        class: d.atlasClass
      }))
    })),
    tap(d => {
      this.breadcrumbs.setBreadcrumbName(
        BreadcrumbId.GridInfo,
        d.elem.coordinates
      );
    }),
    tap(d => {
      this.loadMap$.next(d.elem.coordinates);
    })
  );

  cols: TableColumn[] = [
    {
      prop: 'idx',
      name: '#',
      resizeable: false,
      sortable: true
    },
    {
      prop: 'species',
      name: 'Laji',
      resizeable: false,
      sortable: true
    },
    {
      prop: 'code',
      name: 'Indeksi',
      resizeable: false,
      sortable: true
    },
    {
      prop: 'class',
      name: 'Luokka',
      resizeable: false,
      sortable: true
    }
  ];

  datatableClasses = datatableClasses;
  map: any;

  constructor(
    private zone: NgZone,
    private atlasApi: AtlasApiService,
    private route: ActivatedRoute,
    private breadcrumbs: BreadcrumbService
  ) {}

  ngAfterViewInit(): void {
    this.loadMap$.pipe(
      takeUntil(this.unsubscribe$),
      filter(d => d !== undefined)
    ).subscribe(ykj => {
      setTimeout(() => { // yield control to renderer before accessing lajiMapElem
        this.zone.runOutsideAngular(() => {
          this.map = new LajiMap({
            rootElem: this.lajiMapElem.nativeElement,
            tileLayerName: TileLayerName.maastokartta,
            data:   {
              featureCollection: {
                features: [
                  getGeoJSONFeature(ykj),
                ],
                type: 'FeatureCollection'
              },
              getFeatureStyle: () => ({
                weight: 5,
                opacity: 1,
                fillOpacity: 0.3,
                color: '#00aa00'
              })
            },
            zoomToData: true
          });
        });
      });
    });
  }

  ngOnDestroy(): void {
    if (this.map) { this.map.destroy(); }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
