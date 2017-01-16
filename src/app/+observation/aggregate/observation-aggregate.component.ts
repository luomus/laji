import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { SearchQuery } from '../search-query.model';
import { Util } from '../../shared/service/util.service';
import { Logger } from '../../shared/logger/logger.service';

@Component({
  selector: 'laji-observation-aggregate',
  templateUrl: './observation-aggregate.component.html'
})
export class ObservationAggregateComponent implements OnInit, OnDestroy, OnChanges {

  @Input() lang: string = 'fi';
  @Input() title: string = '';
  @Input() field: string|{'en': string, 'sv': string, 'fi': string};
  @Input() limit: number = 10;
  @Input() hideOnEmpty: boolean = false;
  @Input() updateOnLangChange: boolean = false;
  @Input() queryOverride: any;
  @Input() valuePicker: any;
  @Input() showPager: boolean = false;
  @Input() linkPicker: (item: any) => {
    local: string,
    content: string
  };

  public page: number = 1;
  public total: number = 1;
  public loading: boolean = false;

  public items: Array<{
    count: number,
    value: string,
    link?: {
      local: string,
      content: string
    },
    linkContent?: string
  }> = [];

  private subQueryUpdate: Subscription;
  private subCount: Subscription;
  private lastCache: string;

  constructor(private warehouseService: WarehouseApi,
              private searchQuery: SearchQuery,
              private logger: Logger
  ) {
  }

  ngOnInit() {
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(query => {
      this.page = 1;
      this.updateList();
    });
    this.updateList();
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
  }

  ngOnChanges(changes) {
    if (changes.lang) {
      this.updateList();
    }
  }

  pageChanged(page) {
    this.page = page.page;
    this.items = [];
    this.updateList();
  }

  updateList() {
    let query = Util.clone(this.searchQuery.query);
    let cache = JSON.stringify(query) + this.page + this.lang;
    if (this.lastCache === cache) {
      return;
    }
    this.lastCache = cache;
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
    if (this.queryOverride) {
      query = Object.assign(query, this.queryOverride);
    }
    this.loading = true;
    let fields: any = '';
    if (typeof this.field === 'string') {
      fields = this.field;
    } else if (this.field[this.lang]) {
      fields = this.field[this.lang];
    }
    this.subCount = this.warehouseService
      .warehouseQueryAggregateGet(query, [fields], undefined, this.limit, this.page)
      .subscribe(
        result => {
          if (result.results) {
            this.total = result.total;
            this.items = result.results
              .map(item => {
                let link = undefined;
                let value = this.valuePicker ?
                  this.valuePicker(item.aggregateBy, this.lang) :
                  (item.aggregateBy[fields] || '');
                if (this.linkPicker) {
                  link = this.linkPicker(item.aggregateBy);
                }
                return {count: item.count, value: value, link: link};
              });
          }
        },
        err => this.logger.warn('Observation aggregation fetching failed', err),
        () => this.loading = false
      );
  }
}
