import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { forkJoin as ObservableForkJoin, Observable, of } from 'rxjs';
import { InformalTaxonGroup } from '../../shared/model/InformalTaxonGroup';
import { InformalTaxonGroupApi } from '../../shared/api/InformalTaxonGroupApi';
import { IdService } from '../../shared/service/id.service';
import { PagedResult } from '../../shared/model/PagedResult';
import { Logger } from '../../shared/logger/logger.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';

interface IPieData {
  id: string;
  name: string;
  value: number;
}

@Component({
  selector: 'laji-observation-chart',
  templateUrl: './observation-char.component.html',
  styleUrls: ['./observation-char.component.css'],
  providers: [InformalTaxonGroupApi],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationChartComponent implements OnChanges {

  @Input() query: WarehouseQueryInterface;
  @Input() height = 150;
  @Input() showLegend = false;
  @Input() legendPosition = 'top';
  @Input() visible = true;
  @Input() lang: string;

  @Output() queryChange = new EventEmitter<WarehouseQueryInterface>();


  informalGroups: InformalTaxonGroup[] = [];
  data$: Observable<IPieData[]>;
  loading = false;

  constructor(private warehouseService: WarehouseApi,
              private informalGroupService: InformalTaxonGroupApi,
              private logger: Logger
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['query']) {
      this.updateData();
    }
  }

  onPieClick(group: IPieData) {
    this.queryChange.emit({...this.query, informalTaxonGroupId: [group.id]});
  }

  private getInformalGroupName(id: string, groups: InformalTaxonGroup[]) {
    if (!id || id === 'null') {
      return '(empty)';
    }
    return groups.reduce((pre, cur) => {
      return cur.id === id ? cur.name : pre;
    }, '');
  }

  private getInformalTaxonGroups(): Observable<InformalTaxonGroup[]> {
    const lang = this.lang;
    const group = (
      this.query &&
      this.query.informalTaxonGroupId &&
      this.query.informalTaxonGroupId.length === 1
    ) ?
      this.query.informalTaxonGroupId[0] : '';
    return group === '' ?
      this.informalGroupService.informalTaxonGroupFindRoots(lang).pipe(map(result => result.results)) :
      this.informalGroupService.informalTaxonGroupGetChildren(group, lang).pipe(
        switchMap(result => result.total === 0 && group !== '' ?
          this.informalGroupService.informalTaxonGroupFindById(group, this.lang).pipe(map(informalTaxonGroup => [informalTaxonGroup])) :
          of(result.results)
        )
      );
  }

  private updateData() {
    this.loading = true;
    this.data$ = ObservableForkJoin([
      this.getInformalTaxonGroups(),
      this.warehouseService.warehouseQueryAggregateGet(
        this.query,
        ['unit.linkings.taxon.informalTaxonGroups'],
        undefined,
        1000
      )
    ]).pipe(
      map((data: [InformalTaxonGroup[], PagedResult<any>]) => ({informalGroups: data[0], results: data[1].results || []})),
      map(data => {
        const groups = (data.informalGroups || []).map(group => group.id);
        return data.results.reduce((cumulative, item) => {
          const informalGroupId = IdService.getId(item.aggregateBy['unit.linkings.taxon.informalTaxonGroups']);
          if (groups.indexOf(informalGroupId) !== -1) {
            cumulative.push({
              id: informalGroupId,
              value: item.count,
              name: this.getInformalGroupName(informalGroupId, data.informalGroups)
            });
          }
          return cumulative;
        }, []);
      }),
      catchError(err => {
        this.logger.warn('Failed to build informal taxon pie', err);
        return of([]);
      }),
      tap(() => this.loading = false)
    );
  }

}
