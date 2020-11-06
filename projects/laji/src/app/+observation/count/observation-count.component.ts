import { catchError, concat, delay, map, retryWhen, take, tap } from 'rxjs/operators';
import { Observable, of, throwError as observableThrowError } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Logger } from '../../shared/logger/logger.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';


@Component({
  selector: 'laji-observation-count',
  templateUrl: './observation-count.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationCountComponent implements OnChanges {

  @Input() value: null | number | string; // If this is set this will be always used (null means that the value is loading)
  @Input() field: string;
  @Input() pick: any;
  @Input() query: any;
  @Input() overrideInQuery: WarehouseQueryInterface;
  @Input() lightLoader = false;
  @Input() loading = false;

  public count$: Observable<string>;

  private pageSize = 1000;

  constructor(
    private warehouseService: WarehouseApi,
    private logger: Logger,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['query'] || changes['field'] || changes['pick'] || changes['overrideInQuery'] || changes['value']) {
      this.update();
    }
  }

  update() {
    if (typeof this.value !== 'undefined' || !this.query) {
      this.count$ = of('' + (this.value || 0));
      this.loading = this.value === null;
      return;
    }

    const query = this.overrideInQuery ? {...this.query, ...this.overrideInQuery} : this.query;
    this.loading = true;
    this.count$ = (this.field ? this.aggregatedCount(query) : this.normalCount(query)).pipe(
      map(val => '' + val),
      catchError(err => {
        this.logger.warn('Failed to update count', err);
        return of('');
      }),
      tap(() => this.loading = false),
      tap(() => this.cdr.detectChanges())
    );
  }

  private normalCount(query: WarehouseQueryInterface): Observable<number> {
    return this.warehouseService.warehouseQueryCountGet(query).pipe(
      retryWhen(errors => errors.pipe(delay(1000), take(2), concat(observableThrowError(errors)))),
      map(result => result.total)
    );
  }

  private aggregatedCount(query: WarehouseQueryInterface): Observable<number> {
    let pageSize = 1;
    if (this.pick) {
      pageSize = this.pageSize;
      this.pick = Array.isArray(this.pick) ? this.pick : [this.pick];
    }

    return this.warehouseService.warehouseQueryAggregateGet(query, [this.field], undefined, pageSize).pipe(
      retryWhen(errors => errors.pipe(delay(1000), take(2), concat(observableThrowError(errors)))),
      map(result => {
        if (this.pick && result.results) {
          return result.results
            .filter(value => this.pick.indexOf(value.aggregateBy[this.field]) > -1)
            .reduce((pre, cur) => pre + cur['count'], 0);
        }
        return result.total || 0;
      })
    );
  }
}
