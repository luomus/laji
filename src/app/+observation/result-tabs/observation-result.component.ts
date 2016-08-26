import {Component, Input, OnInit} from '@angular/core';
import {TAB_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {Location} from '@angular/common';

import { ObservationResultListComponent } from "../result-list/observation-result-list.component";
import { SearchQuery } from "../search-query.model";
import {ObservationCountComponent} from "../count/observation-cont.component";
import {ObservationAggregateComponent} from "../aggregate/observation-aggregate.component";
import {ObservationChartComponent} from "../chart/observation-chart.component";
import {TranslateService} from "ng2-translate";


@Component({
  selector: 'laji-observation-result',
  templateUrl: 'observation-result.component.html',
  directives: [
    TAB_DIRECTIVES,
    ObservationResultListComponent,
    ObservationCountComponent,
    ObservationAggregateComponent,
    ObservationChartComponent
  ]
})
export class ObservationResultComponent implements OnInit {

  @Input() active:string = 'list';

  lang = 'fi';

  public activated = {
    list: false,
    images: false,
    stats: false
  };

  constructor(
    private location: Location,
    private searchQuery: SearchQuery
  ) {}

  ngOnInit() {
    this.activated[this.active] = true;
  }

  pickValue(aggr, lang) {
    switch (lang) {
      case 'fi':
        return aggr['unit.linkings.taxon.nameFinnish'] || aggr['unit.linkings.taxon.scientificName'] || '';
      case 'en':
        return aggr['unit.linkings.taxon.nameEnglish'] || aggr['unit.linkings.taxon.scientificName'] || '';
      case 'sv':
        return aggr['unit.linkings.taxon.nameSwedish'] || aggr['unit.linkings.taxon.scientificName'] || '';
    }
    return aggr['unit.linkings.taxon.scientificName'] || '';
  }

  pickLink(aggr) {
    return aggr['unit.linkings.taxon.id'] ?
      '/taxon/' + aggr['unit.linkings.taxon.id'].replace('http://tun.fi/','') : '';
  }

  activate(tab:string) {
    if (this.active === tab) {
      return;
    }
    this.active = tab;
    this.activated[tab] = true;
    this.searchQuery.updateUrl(this.location, '/observation/' + tab);
  }
}
