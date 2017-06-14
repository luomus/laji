import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { SearchQuery } from '../search-query.model';
import { ObservationFilterInterface } from './observation-filter.interface';
import { Subscription } from 'rxjs/Subscription';
import { Logger } from '../../shared/logger/logger.service';
import { Util } from '../../shared/service/util.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'laji-observation-filter',
  templateUrl: './observation-filter.component.html',
  styleUrls: ['./observation-filter.component.css']
})
export class ObservationFilterComponent implements OnInit, OnChanges, OnDestroy {
  @Input() lang: string;
  @Input() filter: ObservationFilterInterface;
  @Input() override: WarehouseQueryInterface;
  @Output() filterChange: EventEmitter<ObservationFilterInterface> = new EventEmitter<ObservationFilterInterface>();
  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  public loading = false;
  public page = 1;
  public total = 0;

  private queryUpdate: Subscription;
  private langChange: Subscription;
  private subData: Subscription;
  private lastQuery: string;

  constructor(private warehouseService: WarehouseApi,
              private searchQuery: SearchQuery,
              private logger: Logger,
              private traslate: TranslateService
  ) {
  }

  ngOnInit() {
    this.init();
    this.queryUpdate = this.searchQuery.queryUpdated$.subscribe(() => this.init());
    this.langChange = this.traslate.onLangChange.subscribe(() => {
      this.lastQuery = '';
      this.update();
    });
  }

  ngOnChanges() {
    this.update();
  }

  ngOnDestroy() {
    if (this.subData) {
      this.subData.unsubscribe();
    }
    if (this.queryUpdate) {
      this.queryUpdate.unsubscribe();
    }
    if (this.langChange) {
      this.langChange.unsubscribe();
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
    const query = Util.clone(this.searchQuery.query);
    if (WarehouseApi.isEmptyQuery(query)) {
      query.cache = true;
    }
    if (this.override) {
      Object.keys(this.override).map(key => {
        query[key] = this.override[key];
      });
    }
    const cacheKey = JSON.stringify(query) + this.page;
    if (this.lastQuery === cacheKey) {
      return;
    }
    this.lastQuery = cacheKey;
    if (this.subData) {
      this.subData.unsubscribe();
    }
    this.loading = true;
    this.subData = this.warehouseService.warehouseQueryAggregateGet(
      query,
      [this.filter.field],
      undefined,
      this.filter.size,
      this.page
    ).subscribe(
      data => {
        this.total = data.total || 0;
        const filtersData = (data.results || [])
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
            return {
              value: val,
              count: result['count'] || 0,
              selected: this.filter.selected.filter(value => value === val ).length > 0
            };
          });
        if (this.filter.map) {
          this.filter.map(filtersData).subscribe(res => this.filter.data = res);
        } else {
          this.filter.data = filtersData;
        }
        this.filter.total = data.total;
      },
      err => this.logger.warn('Observation filter was not able to fetch data from the warehouse', err),
      () => this.loading = false
    );
  }

  toggle(item: any) {
    const selected = this.isActive(item);
    const value = this.getQueryValue(item);
    const query = this.searchQuery.query;
    const filter = this.filter['filter'];
    if (selected) {
      switch (this.filter.type) {
        case'array':
          if (!query[filter]) {
            break;
          }
          const idx = query[filter].indexOf(value);
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
    this.onSelect.emit(item);
  }

  isActive(item: FilterItem) {
    const filter = this.searchQuery.query[this.filter['filter']];
    const type = typeof filter;
    if (type === 'undefined') {
      return false;
    }
    const value = this.getQueryValue(item);
    if (Array.isArray(filter)) {
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
