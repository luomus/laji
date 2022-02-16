import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchQueryService } from '../../+observation/search-query.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { FooterService } from '../../shared/service/footer.service';
import { geoJSONToISO6709, ISO6709ToGeoJSON } from 'laji-map/lib/utils';
import { LajiMapComponent } from '@laji-map/laji-map.component';
import { LajiMapLang, LajiMapOptions, LajiMapOverlayName, LajiMapTileLayerName, LajiMapTileLayersOptions } from '@laji-map/laji-map.interface';

@Component({
  selector: 'laji-map-front',
  templateUrl: './front.component.html',
  styleUrls: ['./front.component.css']
})
export class FrontComponent implements OnInit, OnDestroy {
  @ViewChild(LajiMapComponent) lajiMap: LajiMapComponent;
  mapOptions: LajiMapOptions = {
    center: [64.209802, 24.912872],
    zoom: 3,
    tileLayerName: LajiMapTileLayerName.maastokartta,
    availableOverlayNameBlacklist: [LajiMapOverlayName.kiinteistojaotus, LajiMapOverlayName.kiinteistotunnukset],
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
  };

  readonly instructions = {
    fi: '/about/1785',
    sv: '/about/1809',
    en: '/about/1807'
  };

  drawData: any = {
    editable: true,
    featureCollection: {
      type: 'FeatureCollection',
      features: []
    },
    showMeasurements: true
  };

  hasQuery = false;
  query: WarehouseQueryInterface;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public searchQuery: SearchQueryService,
    public translate: TranslateService,
    private footerService: FooterService
  ) {
  }

  ngOnInit() {
    this.footerService.footerVisible = false;
    let options: LajiMapOptions = {lang: <LajiMapLang> this.translate.currentLang};
    const {layers = '', overlayNames = '', world, coordinates} = this.route.snapshot.queryParams;
    const _layers = (`${layers},${overlayNames}`.split(',') as string[])
      .filter(s => s)
      .reduce<LajiMapTileLayersOptions['layers']>(
        (lrs, layerName) => ({...lrs, [layerName]: true}),
        {maastokartta: true} as LajiMapTileLayersOptions['layers']
      );
    if (typeof coordinates !== 'undefined') {
      this.drawData = {...this.drawData, featureCollection: ISO6709ToGeoJSON(coordinates)};
    }
    const projection = world === 'true'
      ? 'world'
      : 'finnish';
    options = {...options, tileLayers: {layers: _layers, active: projection}};
    this.mapOptions = {...this.mapOptions, ...options, draw: this.drawData};
  }

  onMapLoad() {
    const params = this.route.snapshot.queryParams;
    if (params['coordinates']) {
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

}
