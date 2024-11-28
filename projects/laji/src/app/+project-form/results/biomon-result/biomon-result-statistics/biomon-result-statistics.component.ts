import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { WarehouseApi } from 'projects/laji/src/app/shared/api/WarehouseApi';
import { toHtmlSelectElement } from 'projects/laji/src/app/shared/service/html-element.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

interface Row {
  observer: string;
  gatherings: number;
}

interface QueryResult {
  results: {
    aggregateBy: {
      'gathering.team.memberName': string;
    };
    count: number;
  }[];
}

@Component({
  selector: 'laji-biomon-result-statistics',
  templateUrl: './biomon-result-statistics.component.html',
  styleUrls: ['./biomon-result-statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BiomonResultStatisticsComponent implements OnInit {
  readonly collection$ = new BehaviorSubject<string>('');
  @Input() set collection(v: string) { this.collection$.next(v); };

  toHtmlSelectElement = toHtmlSelectElement;

  rows$!: Observable<Row[]>;
  loading$ = new BehaviorSubject(true);

  columns = [
    { name: 'observer', label: 'biomon.stats.statistics.table.cols.observer' },
    { name: 'gatherings', label: 'biomon.stats.statistics.table.cols.gatherings' },
  ];

  constructor(
    private warehouseApi: WarehouseApi
  ) { }

  ngOnInit(): void {
    const query$ = this.collection$.pipe(
      tap(() => { this.loading$.next(true); }),
      switchMap((collection) => this.warehouseApi.warehouseQueryGatheringAggregateGet(
        {
          collectionId: [collection], completeListType: ['MY.completeListTypeCompleteWithBreedingStatus,MY.completeListTypeComplete'],
          cache: true, countryId: ['ML.206']
        },
        ['gathering.team.memberName'],
        undefined,
        10000
      ))
    );

    this.rows$ = query$.pipe(
      map((response: QueryResult) => response.results
        .map(r => ({ observer: r.aggregateBy['gathering.team.memberName'], gatherings: r.count }))
        .sort((a, b) => b.gatherings - a.gatherings)
        .slice(0, 20)
      ),
      tap(() => { this.loading$.next(false); })
    );
  }
}
