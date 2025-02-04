import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchQueryService } from '../../+observation/search-query.service';
import { FooterService } from '../../shared/service/footer.service';
import { geoJSONToISO6709, ISO6709ToGeoJSON } from '@luomus/laji-map/lib/utils';
import { LajiMapComponent } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.component';
import { Lang, Options, OverlayName, TileLayerName, TileLayersOptions } from '@luomus/laji-map/lib/defs';
import { latLngGridToGeoJSON } from '@luomus/laji-map/lib/utils';
import { PlatformService } from '../../root/platform.service';

@Component({
  selector: 'laji-map-front',
  templateUrl: './front.component.html',
  styleUrls: ['./front.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FrontComponent implements OnInit, OnDestroy {
  @ViewChild(LajiMapComponent) lajiMap!: LajiMapComponent;
  @ViewChild('printControlWell') printControlsWell!: {nativeElement: HTMLDivElement};
  @ViewChild('printControl') printControls!: {nativeElement: HTMLDivElement};

  mapOptions: Options = {
    center: [64.209802, 24.912872],
    zoom: 3,
    tileLayerName: TileLayerName.maastokartta,
    availableOverlayNameBlacklist: [OverlayName.kiinteistojaotus, OverlayName.kiinteistotunnukset, OverlayName.barentsRegion],
    controls: {
      draw: {
        marker: true,
        polygon: true,
        polyline: true,
        copy: true,
        upload: true,
        clear: true
      } as any,
      coordinates: true
    },
    customControls: [{
      fn: this.togglePrintMode.bind(this) as (() => void),
      iconCls: 'glyphicon glyphicon-print',
      text: this.translate.instant('map.front.print.tooltip')
    }]
  };

<<<<<<< HEAD
=======
  readonly instructions: {[key: string]: string} = {
    fi: '/about/1785',
    sv: '/about/1809',
    en: '/about/1807'
  };

>>>>>>> development
  drawData: any = {
    editable: true,
    featureCollection: {
      type: 'FeatureCollection',
      features: []
    },
    showMeasurements: true
  };

  printMode = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public searchQuery: SearchQueryService,
    public translate: TranslateService,
    private footerService: FooterService,
    private cdr: ChangeDetectorRef,
    private platformService: PlatformService
  ) {
  }

  ngOnInit() {
    this.footerService.footerVisible = false;
    let options: Options = {lang: <Lang> this.translate.currentLang};
    const {layers = '', overlayNames = '', world, coordinates, print} = this.route.snapshot.queryParams;
    const _layers = (`${layers},${overlayNames}`.split(',') as string[])
      .filter(s => s)
      .reduce<TileLayersOptions['layers']>(
        (lrs, layerName) => ({...lrs, [layerName]: true}),
        {maastokartta: true} as TileLayersOptions['layers']
      );
    if (typeof coordinates !== 'undefined') {
      this.drawData = {...this.drawData, featureCollection: ISO6709ToGeoJSON(coordinates)};
    }
    const projection = world === 'true'
      ? 'world'
      : 'finnish';
    options = {...options, tileLayers: {layers: _layers, active: projection}};
    this.mapOptions = {...this.mapOptions, ...options, draw: this.drawData};
    this.printMode = print === 'true' ? true : false;
  }

  onMapLoad() {
    if (this.printMode) {
      this.printModeSideEffects();
    }

    const {coordinates, gridsquare} = this.route.snapshot.queryParams;
    if (gridsquare) {
      this.zoomToGrid(gridsquare);
    } else if (coordinates) {
      this.lajiMap.map.zoomToData();
    }
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
  }

  onCreate() {
    this.router.navigate([], {
      queryParams: {coordinates: geoJSONToISO6709(this.lajiMap.map.getDraw().featureCollection.features)},
      relativeTo: this.route
    });
  }

  togglePrintMode(e: MouseEvent) {
    if (!this.platformService.isBrowser) {
      return;
    }

    e.stopPropagation();
    this.printMode = !this.printMode;
    this.printModeSideEffects();
  }

  private printModeSideEffects() {
    this.cdr.detectChanges();
    this.lajiMap.map.map.invalidateSize();

    const printControlsElem = this.printControls.nativeElement;
    const lajiMapPrintControl = document.querySelector('.laji-map .glyphicon-print')?.parentElement;
    if (this.printMode) {
      lajiMapPrintControl?.appendChild(printControlsElem);
    } else {
      this.printControlsWell.nativeElement.appendChild(printControlsElem);
    }
  }


  private zoomToGrid(grid: string) {
    if (!this.platformService.isBrowser) {
      return;
    }

    const geometry = latLngGridToGeoJSON(grid.split(':') as [string, string]);
    this.lajiMap.map.fitBounds((window.L as any).geoJSON(geometry).getBounds(), {paddingInMeters: 2000});
  }
}
