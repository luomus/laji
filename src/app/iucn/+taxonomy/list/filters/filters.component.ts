import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ListType } from '../list.component';
import { FilterQuery } from '../../../iucn-shared/service/result.service';

@Component({
  selector: 'laji-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {

  @Input() type: ListType;
  @Input() query: FilterQuery;
  @Output() queryChange = new EventEmitter<FilterQuery>();

  constructor() { }

  ngOnInit() {
  }

  change(param, value) {
    console.log(param, value);
    const newQuery = {...this.query, [param]: value};
    this.queryChange.emit(newQuery);
  }

}
