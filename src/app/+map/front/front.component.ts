import { AfterViewInit, OnDestroy, Component, ViewChild, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core/src/translate.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchQuery } from '../../+observation/search-query.model';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Util } from '../../shared/service/util.service';
import { MapComponent } from '../../shared/map/map.component';
import { FooterService } from '../../shared/service/footer.service';
import { geoJSONToISO6709, ISO6709ToGeoJSON } from 'laji-map/lib/utils';

@Component({
  selector: 'laji-map-front',
  templateUrl: './front.component.html',
  styleUrls: ['./front.component.css']
})
export class FrontComponent implements OnInit, OnDestroy {
  @ViewChild(MapComponent) lajiMap: MapComponent;
  drawData = {
    featureCollection: {
      type: 'FeatureCollection',
      features: []
    },
    getFeatureStyle: function () {
      return {color: '#000000', fillColor: '#000000', weight: 2};
    },
    getTooltip: (i, geometry) => {
      switch (geometry.type) {
          case 'LineString': {
            let prevLatLng = undefined;
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

  draw = {
    editable: true,
    marker: true,
    polygon: true,
    polyline: true,
    hasActive: true
  };
  hasQuery = false;
  showControls = false;
  overlayNames: string[];
  color = undefined;
  query: WarehouseQueryInterface;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public searchQuery: SearchQuery,
    public translate: TranslateService,
    private footerService: FooterService
  ) {
  }

  ngOnInit() {
    this.footerService.footerVisible = false;
    const params = this.route.snapshot.queryParams;
    let len = Object.keys(params).length;
    if (params['overlayNames']) {
      this.overlayNames = params['overlayNames'].split(',');
      len--;
    }
    if (params['coordinates']) {
      this.drawData.featureCollection = ISO6709ToGeoJSON(params['coordinates']);
      this.lajiMap.initDrawData();
      this.lajiMap.map.focusToLayer(0);
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
    this.searchQuery.setQueryFromQueryObject(params);
    this.query = Util.clone(this.searchQuery.query);
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
  }

  onCreate(e) {
    if (e.coordinates) {
      this.router.navigate([], {
        queryParams: {coordinates: geoJSONToISO6709({features: [{
          type: 'Feature',
          properties: {},
          geometry: e
        }]})},
        relativeTo: this.route
      });
    }
  }

}
