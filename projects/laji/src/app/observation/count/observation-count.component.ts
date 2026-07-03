import { catchError, concat, concatWith, delay, map, retryWhen, take, tap, throwError } from 'rxjs';
import { Observable, of, throwError as observableThrowError } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Logger } from '../../shared/logger/logger.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { paths } from 'projects/laji-api-client/generated/api';
import { DataFetchMode } from '../observation-data.service';

type NormalCountQueryParams = paths['/warehouse/query/unit/count']['get']['parameters']['query'];
type AggregateQueryParams = paths['/warehouse/query/unit/aggregate']['get']['parameters']['query'];

@Component({
    selector: 'laji-observation-count',
    templateUrl: './observation-count.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ObservationCountComponent implements OnChanges {
  @Input() dataMode: DataFetchMode = 'unit';
  @Input() value?: null | number | string; // If this is set this will be always used (null means that the value is loading)
  @Input() field!: string;
  @Input() pick: any;
  @Input() query: any;
  @Input() overrideInQuery!: WarehouseQueryInterface;
  @Input() lightLoader = false;
  @Input() loading = false;

  public count$!: Observable<string>;

  private pageSize = 1000;

  constructor(
    private api: LajiApiClientService,
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

  private normalCount(query: NormalCountQueryParams): Observable<number | undefined> {
    const endpoint = this.dataMode === 'unit' ? '/warehouse/query/unit/count' : '/warehouse/query/sample/count';
    return this.api.get(endpoint, { query }).pipe(
      retryWhen(errors => errors.pipe(delay(1000), take(2), concatWith(throwError(() => errors)))),
      map((result: any) => result.total)
    );
  }

  private aggregatedCount(query: AggregateQueryParams): Observable<number> {
    let pageSize = 1;
    if (this.pick) {
      pageSize = this.pageSize;
      this.pick = Array.isArray(this.pick) ? this.pick : [this.pick];
    }

    const endpoint = this.dataMode === 'unit' ? '/warehouse/query/unit/aggregate' : '/warehouse/query/sample/aggregate';
    return this.api.get(endpoint, { query: { ...query, aggregateBy: [this.field as any], pageSize } }).pipe(
      retryWhen(errors => errors.pipe(delay(1000), take(2), concatWith(throwError(() => errors)))),
      map((result: any) => {
        if (this.pick && result.results) {
          return result.results
            .filter((value: any) => this.pick.indexOf(value.aggregateBy[this.field]) > -1)
            .reduce((pre: any, cur: any) => pre + cur['count'], 0);
        }
        return result.total || 0;
      })
    );
  }
}
