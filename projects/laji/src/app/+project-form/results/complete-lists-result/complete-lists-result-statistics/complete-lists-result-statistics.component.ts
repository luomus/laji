import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CollectionApi } from 'projects/laji/src/app/shared/api/CollectionApi';
import { WarehouseApi } from 'projects/laji/src/app/shared/api/WarehouseApi';
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
  selector: 'laji-complete-lists-result-statistics',
  templateUrl: './complete-lists-result-statistics.component.html',
  styleUrls: ['./complete-lists-result-statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompleteListsResultStatisticsComponent implements OnInit {
  readonly collection$ = new BehaviorSubject<string>('');
  @Input() set collection(v: string) { this.collection$.next(v); };

  @Output() collectionChange = new EventEmitter<string>();

  collectionOptions$: Observable<Array<any>>;
  rows$: Observable<Row[]>;
  loading$ = new BehaviorSubject(true);

  columns = [
    { name: 'observer', label: 'completeLists.stats.statistics.table.cols.observer' },
    { name: 'gatherings', label: 'completeLists.stats.statistics.table.cols.gatherings' },
  ];
  parentCollectionID = 'HR.5615';
  defaultCollection: string;

  constructor(
    private warehouseApi: WarehouseApi,
    private collectionApi: CollectionApi,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.defaultCollection = this.collection$.getValue();

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

    this.collectionOptions$ = this.collectionApi.findChildren(
      this.parentCollectionID,
      this.translate.currentLang,
      undefined,
      '10000'
    ).pipe(
      map(res => res.results),
      map(collections => collections.map(c => ({ label: c.collectionName, value: c.id })))
    );
  }

  onCollectionChange(collection: string) {
    this.collectionChange.emit(collection);
    this.collection$.next(collection);
  }
}
