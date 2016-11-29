import { Component, Input, OnInit, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { SearchQuery } from '../search-query.model';
import { IdService } from '../../shared/service/id.service';
import { UserService } from '../../shared/service/user.service';
import { ObservationFilterInterface } from '../filter/observation-filter.interface';
import { TranslateService } from 'ng2-translate';


@Component({
  selector: 'laji-observation-result',
  templateUrl: 'observation-result.component.html'
})
export class ObservationResultComponent implements OnInit, OnChanges {

  @Input() filters: {[name: string]: ObservationFilterInterface};
  @Input() active: string = 'list';
  @Output() activeChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onFilterSelect: EventEmitter<ObservationFilterInterface> = new EventEmitter<ObservationFilterInterface>();

  public activated = {};
  public queryParams = {};

  constructor(public searchQuery: SearchQuery,
              public userService: UserService,
              public translate: TranslateService,
              private location: Location) {
  }

  ngOnInit() {
    this.updateQueryParams();
    this.activated[this.active] = true;
    this.searchQuery.queryUpdated$.subscribe(data => {
      if (data['formSubmit']) {
        this.updateQueryParams();
        this.activated = {};
        this.activated[this.active] = true;
      }
    });
  }

  ngOnChanges(changes) {
    if (changes.active) {
      this.activate(this.active, true);
    }
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
        break;
      default:
        vernacular = '';
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
    };
  }

  pickLocation(e) {
    if (
      e &&
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

  activate(tab: string, forceUpdate: boolean = false) {
    if (!forceUpdate && this.active === tab) {
      return;
    }
    this.active = tab;
    this.activated[tab] = true;
    this.activeChange.emit(this.active);
    this.searchQuery.updateUrl(this.location, '/observation/' + tab, [
      'selected',
      'pageSize'
    ]);
  }

  private updateQueryParams() {
    this.queryParams = this.searchQuery.getQueryObject([
      'selected',
      'pageSize'
    ]);
  }
}
