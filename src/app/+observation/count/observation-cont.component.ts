import {Component, OnInit, Input, OnDestroy, OnChanges, Optional} from '@angular/core';
import {Subscription} from "rxjs";
import {isArray} from "@angular/core/src/facade/lang";

import {FormattedNumber, SpinnerComponent} from "../../shared";
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {WarehouseQueryInterface} from "../../shared/model/WarehouseQueryInterface";


@Component({
  moduleId: module.id,
  selector: 'laji-observation-count',
  templateUrl: 'observation-cont.component.html',
  directives: [ SpinnerComponent ],
  pipes: [ FormattedNumber ]
})
export class ObservationCountComponent implements OnInit, OnDestroy, OnChanges {

  @Input() field: string;
  @Input() pick: any;
  @Input() query: WarehouseQueryInterface;
  @Input() overrideInQuery:any;

  public count: string = '';
  public loading:boolean = true;

  private lastQuery:WarehouseQueryInterface;

  private subQueryUpdate: Subscription;
  private subCount: Subscription;

  constructor(
    private searchQuery:SearchQuery,
    private warehouseService: WarehouseApi
  ) {
  }

  ngOnInit() {
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(query => this.update());
    this.update();
  }

  ngOnChanges() {
    this.update();
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
  }

  update() {
    let query = this.query ?
      Object.assign({}, this.query) :
      Object.assign({}, this.searchQuery.query);
    if (this.overrideInQuery) {
      query = Object.assign(query, this.overrideInQuery);
    }
    let cacheKey = JSON.stringify(query);
    if (this.lastQuery == cacheKey) {
      return;
    }
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
    this.lastQuery = cacheKey;
    this.loading = true;
    if (this.field) {
      this.updateAggregated(query);
    } else {
      this.updateCount(query);
    }
  }

  private updateCount(query) {
    this.subCount = this.warehouseService
      .warehouseQueryCountGet(query)
      .subscribe(
        result => {
          this.loading = false;
          this.count = '' + (result.total || 0);
        },
        err => console.log(err)
      )
  }

  private updateAggregated(query) {
    let pageSize = 1;
    if (this.pick) {
      pageSize = 100;
      this.pick = isArray(this.pick) ? this.pick : [this.pick];
    }

    this.subCount = this.warehouseService
      .warehouseQueryAggregateGet(query, [this.field], undefined, pageSize)
      .subscribe(
        result => {
          let total = result.total || 0;
          if (result.results && this.pick) {
            this.count = '' + result.results
                .filter(value => this.pick.indexOf(value.aggregateBy[this.field]) > -1)
                .reduce((pre, cur) =>  pre + cur['count'], 0);
          } else {
            this.count = '' + total;
          }
          this.loading = false;
        },
        err => console.log(err)
      );
  }
}
