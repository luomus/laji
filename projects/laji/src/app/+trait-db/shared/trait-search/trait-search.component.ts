import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { paths } from 'projects/laji-api-client-b/generated/api';
import { map, switchMap, tap } from 'rxjs/operators';
import { Sort } from 'projects/laji-ui/src/lib/datatable/datatable.component';

type SearchResponse = paths['/trait/search']['get']['responses']['200']['content']['application/json'];

interface SearchResult {
  res: SearchResponse;
  sorts: Sort[];
}

@Component({
  selector: 'laji-trait-search',
  templateUrl: './trait-search.component.html',
  styleUrls: ['./trait-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitSearchComponent implements OnInit, OnDestroy {
  searchResult: SearchResult | undefined;
  currentPageIdx = 0;
  loading = false;
  pageSize = 20;

  private searchResult$: Observable<{ res: SearchResponse; sorts: Sort[] }>;
  private loadPageSubject = new Subject<number>();
  private sortSubject = new Subject<Sort[]>();
  private subscription = new Subscription();

  constructor(private api: LajiApiClientBService, private cdr: ChangeDetectorRef) {
    this.searchResult$ = combineLatest([this.loadPageSubject, this.sortSubject]).pipe(
      tap(_ => {
        this.loading = true;
        this.cdr.markForCheck();
      }),
      switchMap(([pageIdx, sorts]) =>
        this.api.fetch('/trait/search', 'get', {
          query: {
            page: pageIdx + 1,
            pageSize: this.pageSize,
            // TODO filters
          }
        }).pipe(
          map(res => ({res, sorts}))
        )
      )
    );
  }

  ngOnInit(): void {
    this.subscription.add(
      this.searchResult$.subscribe(res => {
        this.loading = false;
        this.searchResult = res;
        this.cdr.markForCheck();
      })
    );
    this.onSort([]);
    this.onLoadPage(this.currentPageIdx);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onLoadPage(pageIdx: number) {
    this.currentPageIdx = pageIdx;
    this.loadPageSubject.next(this.currentPageIdx);
  }

  onSort(sorts: Sort[]) {
    this.sortSubject.next(sorts);
  }
}

