import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { SearchQuery } from '../search-query.model';
import { IdService } from '../../shared/service/id.service';
import { UserService } from '../../shared/service/user.service';
import { ObservationFilterInterface } from '../filter/observation-filter.interface';
import { TranslateService } from '@ngx-translate/core';
import { ObservationMapComponent } from '../map/observation-map.component';
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'laji-observation-result',
  templateUrl: './observation-result.component.html',
  styleUrls: ['./observation-result.component.css']
})
export class ObservationResultComponent implements OnInit, OnChanges, OnDestroy {

  @Input() filters: {[name: string]: ObservationFilterInterface};
  @Input() active = 'list';
  @Output() activeChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onFilterSelect: EventEmitter<ObservationFilterInterface> = new EventEmitter<ObservationFilterInterface>();

  @ViewChild(ObservationMapComponent) observationMap: ObservationMapComponent;

  public activated = {};
  public queryParams = {};

  private subQueryUpdate: Subscription;

  constructor(public searchQuery: SearchQuery,
              public userService: UserService,
              public translate: TranslateService,
              private location: Location) {
  }

  ngOnInit() {
    this.updateQueryParams();
    this.activated[this.active] = true;
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(() => {
      this.updateQueryParams();
    });
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
  }

  ngOnChanges(changes) {
    if (changes.active) {
      this.activate(this.active, true);
    }
  }

  pickValue(aggr, lang) {
    let vernacular = '';
    const scientific = aggr['unit.linkings.taxon.speciesScientificName'] || '';
    switch (lang) {
      case 'fi':
        vernacular = aggr['unit.linkings.taxon.speciesNameFinnish'] || '';
        break;
      case 'en':
        vernacular = aggr['unit.linkings.taxon.speciesNameEnglish'] || '';
        break;
      case 'sv':
        vernacular = aggr['unit.linkings.taxon.speciesNameSwedish'] || '';
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
    if (!aggr['unit.linkings.taxon.speciesId']) {
      return undefined;
    }
    return {
      local: '/taxon/' + IdService.getId(aggr['unit.linkings.taxon.speciesId']),
      content: '<i class="glyphicon glyphicon-modal-window"></i>'
    };
  }

  pickLocation(e) {
    if (e.coordinateVerbatim) {
      this.searchQuery.query.coordinates = [e.coordinateVerbatim + ':YKJ'];
    } else if (
      e &&
      e.type === 'Polygon' &&
      e.coordinates && e.coordinates.length === 1 && e.coordinates[0].length === 5
    ) {
      this.searchQuery.query.coordinates = [
        e.coordinates[0][0][1] + ':' + e.coordinates[0][2][1] + ':' +
        e.coordinates[0][0][0] + ':' + e.coordinates[0][2][0] + ':WGS84'
      ];
    } else {
      this.searchQuery.query.coordinates = undefined;
    }
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  activate(tab: string, forceUpdate = false) {
    if (!forceUpdate && this.active === tab) {
      return;
    }
    this.active = tab;
    this.activated[tab] = true;
    this.activeChange.emit(this.active);
    this.searchQuery.updateUrl(this.location, '/observation/' + tab, [
      'selected',
      'pageSize',
      'page'
    ]);
  }

  private updateQueryParams() {
    this.queryParams = this.searchQuery.getQueryObject([
      'selected',
      'pageSize',
      'page'
    ]);
  }
}
