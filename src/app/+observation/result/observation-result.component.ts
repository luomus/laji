import {Component, Input, OnInit} from '@angular/core';
import {TAB_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {Location} from '@angular/common';

import { ObservationResultListComponent } from "../result-list/observation-result-list.component";
import { SearchQuery } from "../search-query.model";
import {ObservationCountComponent} from "../count/obesrvation-cont.component";
import {ObservationAggregateComponent} from "../aggregate/observation-aggregate.component";


@Component({
  selector: 'laji-observation-result',
  templateUrl: 'observation-result.component.html',
  directives: [
    TAB_DIRECTIVES,
    ObservationResultListComponent,
    ObservationCountComponent,
    ObservationAggregateComponent
  ]
})
export class ObservationResultComponent implements OnInit {

  @Input() active:string = 'list';

  public activated = {
    list: false,
    images: false,
    stats: false
  };

  constructor(private location: Location, private searchQuery: SearchQuery) {}

  ngOnInit() {
    this.activated[this.active] = true;
  }

  activate(tab:string) {
    if (this.active === tab) {
      return;
    }
    this.active = tab;
    this.activated[tab] = true;
    let query = this.searchQuery.getQueryString().toString().replace(/&/g,';');
    query = query.length > 0 ? ';' + query : '';
    this.location.go('/observation/' + tab + query);
  }
}
