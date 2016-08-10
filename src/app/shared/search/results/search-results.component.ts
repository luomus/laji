import {Component, OnInit, Input} from '@angular/core';
import {TAB_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import { WarehouseApi, WarehouseQueryInterface } from '../../../shared';
import { SearchResultListComponent } from "../result-list/search-result-list.component";

@Component({
  selector: 'laji-search-result',
  templateUrl: 'search-result.component.html',
  directives: [ TAB_DIRECTIVES, SearchResultListComponent ],
  providers: [ WarehouseApi ]
})
export class SearchResultComponent implements OnInit {

  @Input() query:WarehouseQueryInterface;

  constructor(private warehouseService:WarehouseApi) {

  }

  ngOnInit() {

  }

  loadStats() {
  }

  loadImages(e) {
  }

}
