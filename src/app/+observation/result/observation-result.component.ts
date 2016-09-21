import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {Location} from '@angular/common';

import { SearchQuery } from "../search-query.model";
import {IdService} from "../../shared/service/id.service";
import {CoordinateService} from "../../shared/service/coordinate.service";
import {UserService} from "../../shared/service/user.service";
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {Observable, Subscription} from "rxjs";


@Component({
  selector: 'laji-observation-result',
  templateUrl: 'observation-result.component.html'
})
export class ObservationResultComponent implements OnInit, OnDestroy {

  @Input() active:string = 'list';

  public lang = 'fi';
  public selectColor = '#009900';

  public activated = {
    list: false,
    images: false,
    stats: false
  };

  public requests:any = {};
  private queryCache:string;
  private subQueryUpdate: Subscription;

  constructor(
    public searchQuery: SearchQuery,
    public userService:UserService,
    private location: Location,
    private warehouseService:WarehouseApi
  ) {}

  ngOnInit() {
    this.activated[this.active] = true;
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      _ => {
        if (this.queryCache !== JSON.stringify(this.searchQuery.query)) {
          this.requests = {}
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
  }

  pickValue(aggr, lang) {
    let vernacular = '';
    let scientific = aggr['unit.linkings.taxon.scientificName'] || '';
    switch (lang) {
      case 'fi':
        vernacular = aggr['unit.linkings.taxon.nameFinnish'] || '';
        break;
      case 'en':
        vernacular = aggr['unit.linkings.taxon.nameEnglish'] || '';
        break;
      case 'sv':
        vernacular = aggr['unit.linkings.taxon.nameSwedish'] || '';
    }

    if (vernacular) {
      return vernacular + ' (<i>' + scientific + '</i>)';
    }
    return scientific;
  }

  pickLink(aggr) {
    if (!aggr['unit.linkings.taxon.id']) {
      return undefined;
    }
    return {
      local: '/taxon/' + IdService.getId(aggr['unit.linkings.taxon.id']),
      content: '<i class="glyphicon glyphicon-modal-window"></i>'
    }

  }

  pickLocation(e) {
    if (e.layer.feature.properties.selected) {
      e.layer.setStyle({ color: e.layer.options.origColor });
      e.layer.feature.properties.selected = false;
      this.searchQuery.query.coordinates = undefined;
    } else {
      this.searchQuery.query.coordinates = [];
      e.target.eachLayer((layer) => {
        if (layer.feature.properties.selected) {
          layer.feature.properties.selected = false;
          layer.setStyle({ color: layer.options.origColor })
        }
      });
      e.layer.setStyle({ color: this.selectColor });
      e.layer.feature.properties.selected = true;
      if (
        e.layer.feature &&
        e.layer.feature.geometry &&
        e.layer.feature.geometry.coordinates
      ) {
        this.searchQuery.query.coordinates.push(CoordinateService.getWarehouseQuery(e.layer.feature.geometry.coordinates));
      }
    }
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  activate(tab:string) {
    if (this.active === tab) {
      return;
    }
    this.active = tab;
    this.activated[tab] = true;
    this.searchQuery.updateUrl(this.location, '/observation/' + tab, [
      'selected',
      'pageSize',
      'includeNonValidTaxa'
    ]);
  }

  makePrivateRequest() {
    this.makeRequest('downloadApprovalRequest');
  }

  makePublicRequest() {
    this.makeRequest('download');
  }

  makeRequest(type:string) {
    this.queryCache = JSON.stringify(this.searchQuery.query);
    console.log(this.requests);
    if (this.requests[type] == this.queryCache) {
      return;
    }
    this.requests[type] = this.queryCache;
    this.userService.getToken();
    this.warehouseService[type](
      this.userService.getToken(),
      'CSV_FLAT',
      'UNIT_FACTS',
      this.searchQuery.query
    ).subscribe(
      _ => {
        this.requests[type] = 'sent';
      },
      err => {
        this.requests[type] = 'error';
        console.log(err);
      }
    )
  }

}
