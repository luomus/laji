
import { concat, take, delay, retryWhen } from 'rxjs/operators';
import { Subscription, throwError as observableThrowError } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Util } from '../../shared/service/util.service';
import { Logger } from '../../shared/logger/logger.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';


@Component({
  selector: 'laji-observation-count',
  templateUrl: './observation-count.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationCountComponent implements OnDestroy, OnChanges {

  @Input() field: string;
  @Input() pick: any;
  @Input() query: any;
  @Input() overrideInQuery: WarehouseQueryInterface;
  @Input() lightLoader = false;

  public count = '';
  public loading = true;


  private pageSize = 1000;
  private subCount: Subscription;
  private cache: string;

  constructor(
    private warehouseService: WarehouseApi,
    private logger: Logger,
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['query']) {
      const key = JSON.stringify(WarehouseApi.prepareCountQuery(this.query));
      if (this.cache === key) {
        return;
      }
      this.cache = key;
    }
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
      query = {...query, ...this.overrideInQuery};
    }
    if (WarehouseApi.isEmptyQuery(query)) {
      query.cache = true;
    }
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
    this.loading = true;
    this.field ? this.updateAggregated(query) : this.updateCount(query);
  }

  private updateCount(query) {
    this.subCount = this.warehouseService.warehouseQueryCountGet(query).pipe(
        retryWhen(errors => errors.pipe(delay(1000), take(3), concat(observableThrowError(errors)), ))
      ).subscribe(result => {
          this.loading = false;
          this.count = '' + (result.total || 0);
          this.changeDetectorRef.markForCheck();
        },
        err => {
          this.logger.warn('Failed to update count', err);
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        }
      );
  }

  private updateAggregated(query) {
    let pageSize = 1;
    if (this.pick) {
      pageSize = this.pageSize;
      this.pick = Array.isArray(this.pick) ? this.pick : [this.pick];
    }

    this.subCount = this.warehouseService.warehouseQueryAggregateGet(query, [this.field], undefined, pageSize).pipe(
        retryWhen(errors => errors.pipe(delay(1000), take(3), concat(observableThrowError(errors)), ))
      ).subscribe(
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
          this.changeDetectorRef.markForCheck();
        },
        err => {
          this.logger.warn('Failed to update aggregated count', err);
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        }
      );
  }
}
