import { Component, Input, OnDestroy, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Util } from '../../shared/service/util.service';
import { Logger } from '../../shared/logger/logger.service';


@Component({
  selector: 'laji-observation-count',
  templateUrl: 'observation-count.component.html',
})
export class ObservationCountComponent implements OnDestroy, OnChanges {

  @Input() field: string;
  @Input() pick: any;
  @Input() query: any;
  @Input() overrideInQuery: any;
  @Input() pageSize: number = 20;
  @Input() tick: number;
  @Input() lightLoader: boolean = false;

  public count: string = '';
  public loading: boolean = true;

  private subCount: Subscription;
  private cache: string;

  constructor(private warehouseService: WarehouseApi, private logger: Logger) {
  }

  ngOnChanges() {
    let key = JSON.stringify(this.query);
    if (this.cache === key) {
      return;
    }
    this.cache = key;
    this.update();
  }

  ngOnDestroy() {
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
      .delay(100)
      .subscribe(result => {
          this.loading = false;
          this.count = '' + (result.total || 0);
        },
        err => this.logger.warn('Failed to update count', err)
      );
  }

  private updateAggregated(query) {
    let pageSize = 1;
    if (this.pick) {
      pageSize = this.pageSize;
      this.pick = Array.isArray(this.pick) ? this.pick : [this.pick];
    }

    this.subCount = this.warehouseService
      .warehouseQueryAggregateGet(query, [this.field], undefined, pageSize)
      .delay(100)
      .subscribe(
        result => {
          if (this.pick) {
            if (result.results) {
              this.count = '' + result.results
                  .filter(value => this.pick.indexOf(value.aggregateBy[this.field]) > -1)
                  .reduce((pre, cur) => pre + cur['count'], 0);
            }
          } else {
            this.count = '' + (result.total || 0);
          }
          this.loading = false;
        },
        err => this.logger.warn('Failed to update aggregated count', err)
      );
  }
}
