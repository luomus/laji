import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, OnChanges } from '@angular/core';
import { Location } from '@angular/common';
import { SearchQuery } from '../search-query.model';
import { IdService } from '../../shared/service/id.service';
import { UserService } from '../../shared/service/user.service';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Subscription } from 'rxjs';
import { ObservationFilterInterface } from '../filter/observation-filter.interface';
import { TranslateService } from 'ng2-translate';


@Component({
  selector: 'laji-observation-result',
  templateUrl: 'observation-result.component.html'
})
export class ObservationResultComponent implements OnInit, OnDestroy, OnChanges {

  @Input() loadLimit = 200000;
  @Input() filters: {[name: string]: ObservationFilterInterface};
  @Input() active: string = 'list';
  @Output() activeChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onFilterSelect: EventEmitter<ObservationFilterInterface> = new EventEmitter<ObservationFilterInterface>();

  public lang = 'fi';
  public itemCount = 0;

  public activated = {
    list: false,
    images: false,
    stats: false
  };

  public requests: any = {};
  private queryCache: string;
  private subQueryUpdate: Subscription;

  constructor(public searchQuery: SearchQuery,
              public userService: UserService,
              public translate: TranslateService,
              private location: Location,
              private warehouseService: WarehouseApi) {
  }

  ngOnInit() {
    this.activated[this.active] = true;
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      _ => {
        if (this.queryCache !== JSON.stringify(this.searchQuery.query)) {
          this.requests = {};
          this.updateCount();
        }
      }
    );
    this.updateCount();
  }

  ngOnChanges() {
    this.activated[this.active] = true;
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
  }

  updateCount() {
    this.warehouseService.warehouseQueryCountGet(this.searchQuery.query)
      .subscribe(res => this.itemCount = res.total)
  }

  pickValue(aggr, lang) {
    let vernacular = '';
    let scientific = aggr['unit.linkings.taxon.scientificName'] || '';
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
    if (
      e.type === 'Polygon' &&
      e.coordinates && e.coordinates.length === 1 && e.coordinates[0].length === 5
    ) {
      this.searchQuery.query.coordinates = [
        e.coordinates[0][0][1] + ':' + e.coordinates[0][2][1] + ':' +
        e.coordinates[0][0][0] + ':' + e.coordinates[0][2][0] + ':WGS84'
      ];
    }
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  activate(tab: string) {
    if (this.active === tab) {
      return;
    }
    this.active = tab;
    this.activated[tab] = true;
    this.activeChange.emit(this.active);
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

  makeRequest(type: string) {
    this.queryCache = JSON.stringify(this.searchQuery.query);
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
