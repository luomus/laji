import {Component, Input, OnInit} from '@angular/core';
import {TAB_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {Location} from '@angular/common';

import { SearchResultListComponent } from "../result-list/search-result-list.component";
import { SearchQueryService } from "../query.service";


@Component({
  selector: 'laji-search-result',
  templateUrl: 'search-result.component.html',
  directives: [ TAB_DIRECTIVES, SearchResultListComponent ]
})
export class SearchResultComponent implements OnInit {

  @Input() active:string = 'list';

  public activated = {
    list: false,
    images: false,
    stats: false
  };

  constructor(private location: Location, private searchQuery: SearchQueryService) {}

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
