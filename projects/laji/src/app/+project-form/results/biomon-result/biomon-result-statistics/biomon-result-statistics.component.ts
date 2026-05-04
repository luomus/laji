import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { toHtmlSelectElement } from 'projects/laji/src/app/shared/service/html-element.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs';

type AggregateResponse = components['schemas']['WarehouseDwQuery_AggregateResponse'];

interface Row {
  observer: string;
  gatherings: number;
}

@Component({
    selector: 'laji-biomon-result-statistics',
    templateUrl: './biomon-result-statistics.component.html',
    styleUrls: ['./biomon-result-statistics.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
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
    private api: LajiApiClientBService
  ) { }

  ngOnInit(): void {
    const query$ = this.collection$.pipe(
      tap(() => { this.loading$.next(true); }),
      switchMap((collection) => this.api.get('/warehouse/query/gathering/aggregate',
        {
          query: {
            aggregateBy: ['gathering.team.memberName'],
            collectionId: collection,
            completeListType: 'MY.completeListTypeCompleteWithBreedingStatus,MY.completeListTypeComplete',
            cache: true,
            countryId: 'ML.206',
            pageSize: 10000
        }
        }
      ))
    );

    this.rows$ = query$.pipe(
      map((response) => response.results
        .map(r => ({ observer: r.aggregateBy['gathering.team.memberName'], gatherings: r.count }))
        .sort((a, b) => b.gatherings - a.gatherings)
        .slice(0, 20)
      ),
      tap(() => { this.loading$.next(false); })
    );
  }
}
