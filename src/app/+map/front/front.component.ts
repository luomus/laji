import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '../../../../node_modules/@ngx-translate/core/src/translate.service';
import { ActivatedRoute } from '@angular/router';
import { SearchQuery } from '../../+observation/search-query.model';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Util } from '../../shared/service/util.service';

@Component({
  selector: 'laji-front',
  templateUrl: './front.component.html',
  styleUrls: ['./front.component.css']
})
export class FrontComponent implements OnInit, OnDestroy {

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

  private subQuery: Subscription;

  constructor(
    private route: ActivatedRoute,
    public searchQuery: SearchQuery,
    public translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.subQuery = this.route.queryParams.subscribe(params => {
      this.hasQuery = Object.keys(params).length > 0;
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
    });
  }

  ngOnDestroy() {
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
  }

}
