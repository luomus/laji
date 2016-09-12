import {Component, OnInit, Input, OnDestroy, OnChanges, Optional} from '@angular/core';
import {Subscription} from "rxjs";

import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {WarehouseQueryInterface} from "../../shared/model/WarehouseQueryInterface";
import {Util} from "../../shared/service/util.service";


@Component({
  selector: 'laji-observation-count',
  templateUrl: 'observation-count.component.html',
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
    let query = Util.clone(this.query);
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
    let pageSize = 1;
    if (this.pick) {
      pageSize = this.pageSize;
      this.pick = Array.isArray(this.pick) ? this.pick : [this.pick];
    }

    this.subCount = this.warehouseService
      .warehouseQueryAggregateGet(query, [this.field], undefined, pageSize)
      .subscribe(
        result => {
          if (this.pick) {
            if (result.results) {
              this.count = '' + result.results
                  .filter(value => this.pick.indexOf(value.aggregateBy[this.field]) > -1)
                  .reduce((pre, cur) =>  pre + cur['count'], 0);
            }
          } else {
            this.count = '' + (result.total || 0);
          }
          this.loading = false;
        },
        err => console.log(err)
      );
  }
}
