import {Component, OnInit, Input, OnDestroy, OnChanges, Optional} from '@angular/core';
import {Subscription} from "rxjs";
import {isArray} from "@angular/core/src/facade/lang";

import {FormattedNumber, SpinnerComponent} from "../../shared";
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {WarehouseQueryInterface} from "../../shared/model/WarehouseQueryInterface";


@Component({
  moduleId: module.id,
  selector: 'laji-observation-count',
  templateUrl: 'observation-count.component.html',
  directives: [ SpinnerComponent ],
  pipes: [ FormattedNumber ]
})
export class ObservationCountComponent implements OnDestroy {

  @Input() field: string;
  @Input() pick: any;
  @Input() query: WarehouseQueryInterface;
  @Input() overrideInQuery:any;
  @Input() pageSize:number = 20;

  public count: string = '';
  public loading:boolean = true;

  private lastQuery:WarehouseQueryInterface;

  private subQueryUpdate: Subscription;
  private subCount: Subscription;

  constructor(
    private warehouseService: WarehouseApi
  ) {
  }

  ngDoCheck() {
    let cacheKey = JSON.stringify(this.query);
    if (this.lastQuery == cacheKey) {
      return;
    }
    this.lastQuery = cacheKey;
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
    let query = Object.assign({}, this.query);
    if (this.overrideInQuery) {
      query = Object.assign(query, this.overrideInQuery);
    }
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
    this.loading = true;
    this.field ? this.updateAggregated(query) : this.updateCount(query);
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
    let pageSize = 1; // if no pick present we're only interested of the total
    if (this.pick) {
      pageSize = this.pageSize;
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
