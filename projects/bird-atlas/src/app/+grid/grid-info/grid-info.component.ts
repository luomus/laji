import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TableColumn } from '@swimlane/ngx-datatable';
import { TileLayerName, LajiMap } from 'laji-map';
import { datatableClasses } from 'projects/bird-atlas/src/styles/datatable-classes';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AtlasApiService, AtlasGridSquare } from '../../core/atlas-api.service';
import { BreadcrumbId, BreadcrumbService } from '../../core/breadcrumb.service';
import { convertYkjToGeoJsonFeature } from '../../../../../laji/src/app/root/coordinate-utils';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from 'projects/laji/src/app/shared/service/header.service';

const getGeoJSONFeature = (ykj: string) => {
  const latLngStr = ykj.split(':');
  return convertYkjToGeoJsonFeature(latLngStr[0], latLngStr[1]);
};

const getMapData = (ykj: string) => ({
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
});

const getAdjacentSqLink = (coords: string, latDelta: number, lngDelta: number): string[] => {
  const c = coords.split(':');
  const lat = parseInt(c[0], 10);
  const lng = parseInt(c[1], 10);
  return ['..', `${lat + latDelta}:${lng + lngDelta}`];
};

interface DatatableRow {
  idx: number;
  species: string;
  code: string;
  class: string;
}

interface GridInfoData {
  elem: AtlasGridSquare;
  rows: DatatableRow[];
  status: number;
}

@Component({
  templateUrl: './grid-info.component.html',
  styleUrls: ['./grid-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridInfoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('lajiMap', { static: false }) lajiMapElem: ElementRef;

  private unsubscribe$ = new Subject<void>();
  private loadMap$ = new BehaviorSubject<string>(undefined);
  private map: any;

  data$: Observable<GridInfoData>;
  cols: TableColumn[];
  loading = true;
  datatableClasses = datatableClasses;
  getAdjacentSqLink = getAdjacentSqLink;

  constructor(
    private zone: NgZone,
    private atlasApi: AtlasApiService,
    private route: ActivatedRoute,
    private breadcrumbs: BreadcrumbService,
    private translate: TranslateService,
    private headerService: HeaderService,
    private cdr: ChangeDetectorRef
  ) {
    this.data$ = this.route.paramMap.pipe(
      tap(() => {
        this.breadcrumbs.setBreadcrumbName(BreadcrumbId.GridInfo, undefined);
        this.loading = true;
        this.cdr.markForCheck();
      }),
      switchMap(params => this.atlasApi.getGridSquare(params.get('id'))),
      map(elem => ({
        elem,
        rows: elem.data.map((d, idx) => ({
          idx: idx + 1,
          species: d.speciesName,
          code: (<string>d.atlasCode.key).match(/[0-9]+/)?.[0] || null,
          class: d.atlasClass.value
        })),
        status: 200
      })),
      tap(d => {
        this.breadcrumbs.setBreadcrumbName(
          BreadcrumbId.GridInfo,
          d.elem.coordinates
        );
        this.headerService.setHeaders({
          title: `${d.elem.name} ${d.elem.coordinates} | ${this.translate.instant('ba.header.title')}`
        });
        this.loadMap$.next(d.elem.coordinates);
      }),
      catchError(() => of({
        elem: undefined,
        rows: [],
        status: 404
      })),
      tap(() => { this.loading = false; this.cdr.detectChanges(); })
    );

    this.cols = [
      {
        prop: 'idx',
        name: '#',
        resizeable: false,
        sortable: true,
        width: 75
      },
      {
        prop: 'species',
        name: 'Laji',
        resizeable: false,
        sortable: true,
        width: 125
      },
      {
        prop: 'code',
        name: 'Indeksi',
        resizeable: false,
        sortable: true,
        width: 75
      },
      {
        prop: 'class',
        name: 'Luokka',
        resizeable: false,
        sortable: true,
        width: 225
      }
    ];
    this.zone.runOutsideAngular(() => {
      this.map = new LajiMap({
        tileLayerName: TileLayerName.maastokartta,
      });
    });
  }

  ngAfterViewInit(): void {
    this.loadMap$.pipe(
      takeUntil(this.unsubscribe$),
      filter(d => d !== undefined)
    ).subscribe(ykj => {
      setTimeout(() => { // yield control to renderer before accessing lajiMapElem
        this.map.setRootElem(this.lajiMapElem.nativeElement);
        this.map.setData(getMapData(ykj));
        this.map.zoomToData();
      });
    });
  }

  ngOnDestroy(): void {
    if (this.map) { this.map.destroy(); }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
