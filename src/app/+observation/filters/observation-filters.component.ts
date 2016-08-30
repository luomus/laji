import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {ObservationFilterInterface, FilterDataInterface} from "./observation-filters.interface";
import {Subscription} from "rxjs";

@Component({
  selector: 'laji-observation-filters',
  templateUrl: 'observation-filters.component.html',
  styleUrls: ['observation-filters.component.css']
})
export class ObservationFilterComponent implements OnInit {
  @Input() filters:ObservationFilterInterface;
  @Output() filtersChanged:EventEmitter<ObservationFilterInterface> = new EventEmitter<ObservationFilterInterface>();
  @Output() onSelect:EventEmitter<any> = new EventEmitter();

  public loading:boolean = false;

  private subData: Subscription;
  private selected:any;

  constructor(
    private warehouseService:WarehouseApi,
    private searchQuery:SearchQuery
  ) {
  }

  ngOnInit() {
    this.update();
    this.searchQuery.queryUpdated$.subscribe(() => {
      let query = this.searchQuery.query;
      if (typeof query[this.filters.filter] !== 'undefined') {
        this.selected = query[this.filters.filter];
      } else {
        this.selected = undefined;
      }
      this.update();
    });
  }

  update() {
    if (!this.filters) {
      return;
    }
    if (this.subData) {
      this.subData.unsubscribe();
    }
    this.subData = this.warehouseService.warehouseQueryAggregateGet(
      this.searchQuery.query,
      [this.filters.field],
      undefined,
      this.filters.size || 20
    ).subscribe(
      data => {
        this.filters.data = (data.results || [])
          .filter((result) => {
            if (this.filters.pick) {
              return this.filters.pick.indexOf(result.aggregateBy[this.filters['field']]) > -1
            }
            return true;
          })
          .map((result) => {
            let sel = false;
            let val = result.aggregateBy[this.filters['field']];
            if (this.filters.valueMap && typeof this.filters.valueMap[val] !== 'undefined') {
              val = this.filters.valueMap[val];
            }
            sel = this.filters.selected.filter((filter) => {
              return filter.value !== val;
            }).length > 0;
            return {
              value: val,
              count: result['count'] || 0,
              selected: sel
            };
          });
        this.filters.total = data.total;
      }
    );
  }

  toggle(item:any) {
    let value = item.value;
    item.selected = !item.selected;

    switch (this.filters.type) {
      case 'array':
        value = [value];
            break;
      case 'boolean':
        if (this.filters.booleanMap) {
          value = this.filters.booleanMap[value];
        } else {
          value = value && value !== 'false' ? true : false;
        }
    }
    if (item.selected) {
      this.filters.selected.push(item);
    } else {
      this.filters.selected = this.filters.selected.filter(filter => {
        return filter.value !== item.value;
      });
    }
    this.filtersChanged.emit(this.filters);
    this.onSelect.emit(item);
  }

  isSelected(value):boolean {
    switch (this.filters.type) {
      case 'array':
        return this.selected.indexOf(value) > -1;
      case 'boolean':
        if (this.filters.booleanMap) {
          value = this.filters.booleanMap[value];
        } else {
          value = value && value !== 'false' ? true : false;
        }
        return this.selected === value;
    }
    return false;
  }

}
