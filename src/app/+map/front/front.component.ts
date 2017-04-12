import { Component, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '../../../../node_modules/@ngx-translate/core/src/translate.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchQuery } from '../../+observation/search-query.model';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Util } from '../../shared/service/util.service';
import { CoordinateService } from '../../shared/service/coordinate.service';
import { MapComponent } from '../../shared/map/map.component';

@Component({
  selector: 'laji-map-front',
  templateUrl: './front.component.html',
  styleUrls: ['./front.component.css']
})
export class FrontComponent implements AfterViewInit {
  @ViewChild(MapComponent) lajiMap: MapComponent;
  drawData = {
    featureCollection: {
      type: 'FeatureCollection',
      features: []
    },
    getFeatureStyle: function () {
      return {color: '#000000', fillColor: '#000000', weight: 2};
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
  color = undefined;
  query: WarehouseQueryInterface;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public searchQuery: SearchQuery,
    public translate: TranslateService,
    private coordinateService: CoordinateService
  ) {
  }

  ngAfterViewInit() {
    const params = this.route.snapshot.queryParams;
    let len = Object.keys(params).length;
    if (params['ykj']) {
      const parts = params['ykj'].split(':');
      this.drawData.featureCollection.features.push(
        this.coordinateService.convertYkjToGeoJsonFeature(parts[0], parts[1])
      );
      this.lajiMap.addData(this.drawData);
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

  onCreate(e) {
    if (e && e.coordinateVerbatim) {
      this.router.navigate([], {
        queryParams: {ykj: e.coordinateVerbatim},
        relativeTo: this.route
      });
    }
  }

}
