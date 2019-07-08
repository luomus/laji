import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchQueryService } from '../../+observation/search-query.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Util } from '../../shared/service/util.service';
import { FooterService } from '../../shared/service/footer.service';
import { geoJSONToISO6709, ISO6709ToGeoJSON } from 'laji-map/lib/utils';
import { LajiMapComponent } from '@laji-map/laji-map.component';
import { LajiMapOptions, LajiMapTileLayerName, LajiMapLang } from '@laji-map/laji-map.interface';

@Component({
  selector: 'laji-map-front',
  templateUrl: './front.component.html',
  styleUrls: ['./front.component.css']
})
export class FrontComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(LajiMapComponent) lajiMap: LajiMapComponent;
  mapOptions: LajiMapOptions = {
    center: [64.209802, 24.912872],
    zoom: 3,
    tileLayerName: LajiMapTileLayerName.maastokartta,
    availableTileLayerNamesBlacklist: [LajiMapTileLayerName.pohjakartta],
    draw: {
      marker: true,
      polygon: true,
      polyline: true
    },
    controls: {
      draw: {
        marker: true,
        polygon: true,
        polyline: true,
        copy: true,
        upload: true,
        clear: true
      },
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
    getTooltip: ({feature: {geometry}}) => {
      switch (geometry.type) {
          case 'LineString': {
            let prevLatLng;
            let length = geometry.coordinates.slice(0).reduce((cumulative, coords) => {
              const latLng = L.latLng(coords.reverse());
              cumulative += prevLatLng ? L.latLng(latLng).distanceTo(prevLatLng) : 0;
              prevLatLng = latLng;
              return cumulative;
            }, 0);

            let suffix = 'm';
            if (length > 1000) {
              length = length / 1000;
              length = +parseFloat(length).toFixed(2);
              suffix = 'km';
            } else {
              length = parseInt(length, 10);
            }

            return `${length}${suffix}`;
          }
          case 'Polygon': {
            const latLngs = geometry.coordinates[0].slice(1).map(c => L.latLng(c.reverse()));
            return L.GeometryUtil.readableArea(L.GeometryUtil.geodesicArea(latLngs), true);
          }
          case 'Point': {
            if (geometry.radius === undefined) { return; }
            const {radius} = geometry;
            const area = (Math.PI) * (radius * radius);
            return L.GeometryUtil.readableArea(area, true);
          }
      }
    },
    tooltipOptions: {
      permanent: true
    }
  };

  hasQuery = false;
  showControls = false;
  color = undefined;
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
    const params = this.route.snapshot.queryParams;
    let len = Object.keys(params).length;
    if (params['overlayNames']) {
      options = {...options, overlayNames: params['overlayNames'].split(',')};
      len--;
    }
    if (typeof params['coordinates'] !== 'undefined') {
      this.drawData = {...this.drawData, featureCollection: ISO6709ToGeoJSON(params['coordinates'])};
      len--;
    }
    this.hasQuery = len > 0;
    if (params['color']) {
      this.color = '#' + params['color'];
    }
    if (params['showControls'] && params['showControls'] !== 'false') {
      this.showControls = true;
    }
    if (params['target']) {
      this.searchQuery.query.target = [params['target']];
    }
    this.mapOptions = {...this.mapOptions, ...options, draw: this.drawData};
    this.searchQuery.getQueryFromUrlQueryParams(params);
    this.query = Util.clone(this.searchQuery.query);
  }

  ngAfterViewInit() {
    const params = this.route.snapshot.queryParams;
    if (params['coordinates']) {
      this.lajiMap.map.zoomToData();
    }
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
  }

  onCreate(e) {
    this.router.navigate([], {
      queryParams: {coordinates: geoJSONToISO6709(this.lajiMap.map.getDraw().featureCollection.features)},
      relativeTo: this.route
    });
  }

}
