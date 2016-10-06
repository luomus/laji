import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges } from '@angular/core';
import { isArray } from 'underscore';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { SearchQuery } from '../search-query.model';
import { ObservationFilterInterface } from './observation-filter.interface';
import { Subscription } from 'rxjs';


@Component({
  selector: 'laji-observation-filter',
  templateUrl: 'observation-filter.component.html',
  styleUrls: ['observation-filter.component.css']
})
export class ObservationFilterComponent implements OnInit, OnChanges, OnDestroy {
  @Input() lang: string;
  @Input() filter: ObservationFilterInterface;
  @Output() filterChange: EventEmitter<ObservationFilterInterface> = new EventEmitter<ObservationFilterInterface>();
  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  public loading: boolean = false;
  public page: number = 1;
  public total: number = 0;

  private subData: Subscription;
  private lastQuery: string;

  constructor(private warehouseService: WarehouseApi,
              private searchQuery: SearchQuery) {
  }

  ngOnInit() {
    this.init();
    this.searchQuery.queryUpdated$.subscribe(() => this.init());
  }

  ngOnChanges() {
    this.update();
  }

  ngOnDestroy() {
    if (this.subData) {
      this.subData.unsubscribe();
    }
  }

  init() {
    this.page = 1;
    this.total = 0;
    this.update();
  }

  update() {
    if (!this.filter) {
      return;
    }
    let cacheKey = JSON.stringify(this.searchQuery.query) + this.page;
    if (this.lastQuery === cacheKey) {
      return;
    }
    this.lastQuery = cacheKey;
    if (this.subData) {
      this.subData.unsubscribe();
    }
    this.loading = true;
    this.subData = this.warehouseService.warehouseQueryAggregateGet(
      this.searchQuery.query,
      [this.filter.field],
      undefined,
      this.filter.size,
      this.page
    ).subscribe(
      data => {
        this.total = data.total || 0;
        let filtersData = (data.results || [])
          .filter((result) => {
            if (this.filter.pick) {
              return this.filter.pick.indexOf(result.aggregateBy[this.filter['field']]) > -1;
            }
            return true;
          })
          .map((result) => {
            let val = result.aggregateBy[this.filter['field']];
            if (this.filter.valueMap && typeof this.filter.valueMap[val] !== 'undefined') {
              val = this.filter.valueMap[val];
            }
            let sel = this.filter.selected.filter((value) => {
                return value === val;
              }).length > 0;
            return {
              value: val,
              count: result['count'] || 0,
              selected: sel
            };
          });
        if (this.filter.map) {
          this.filter.map(filtersData).subscribe(
            res => this.filter.data = res
          );
        } else {
          this.filter.data = filtersData;
        }
        this.filter.total = data.total;
      },
      err => console.log(err),
      () => this.loading = false
    );
  }

  toggle(item: any) {
    let selected = this.isActive(item);
    let value = this.getQueryValue(item);
    let query = this.searchQuery.query;
    let filter = this.filter['filter'];
    if (selected) {
      switch (this.filter.type) {
        case'array':
          if (!query[filter]) {
            break;
          }
          let idx = query[filter].indexOf(value);
          if (idx > -1) {
            query[filter].splice(idx, 1);
          }
          if (query[filter].length === 0) {
            query[filter] = undefined;
          }
          break;
        case 'boolean':
          query[filter] = undefined;
          break;
        default:
      }
    } else {
      switch (this.filter.type) {
        case'array':
          if (!query[filter]) {
            query[filter] = [];
          }
          if (query[filter].indexOf(value) === -1) {
            query[filter].push(value);
          }
          break;
        case 'boolean':
          query[filter] = value;
          break;
        default:
      }
    }
    console.log(this.searchQuery.query);
    this.onSelect.emit(item);
  }

  isActive(item: FilterItem) {
    let filter = this.searchQuery.query[this.filter['filter']];
    let type = typeof filter;
    if (type === 'undefined') {
      return false;
    }
    let value = this.getQueryValue(item);
    if (isArray(filter)) {
      return filter.indexOf(value) > -1;
    }
    return filter === value;
  }


  showPager(): boolean {
    return this.filter.pager && (this.total > this.filter.size);
  }

  pageChanged(page) {
    this.page = page.page;
    this.update();
  }

  private getQueryValue(item: FilterItem) {
    let value = item.value;
    if (this.filter['booleanMap']) {
      if (typeof this.filter['booleanMap'] === 'function') {
        value = this.filter['booleanMap'](value);
      } else if (this.filter['booleanMap'][String(value)]) {
        value = this.filter['booleanMap'][String(value)];
      }
    }
    return value;
  }
}

export interface FilterItem {
  value: string|number|boolean;
  count: number;
}
