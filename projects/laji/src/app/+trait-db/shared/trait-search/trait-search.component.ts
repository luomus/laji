import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components, paths } from 'projects/laji-api-client-b/generated/api';
import { map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { Sort } from 'projects/laji-ui/src/lib/datatable/datatable.component';
import { filterDefaultValues, Filters, HIGHER_TAXA } from './trait-search-filters/trait-search-filters.component';
import { ActivatedRoute, Router } from '@angular/router';
import { isObject } from '@luomus/laji-map/lib/utils';
import { AdditionalFilterValues } from './trait-search-filters/additional-filters.component';

type SearchResponse = paths['/trait/search']['get']['responses']['200']['content']['application/json'];

type QueryParams = Partial<Filters & {
  page: number;
}>;

interface SearchResult {
  res: SearchResponse;
  sorts: Sort[];
}

const PAGE_SIZE = 20;

const addFiltersToApiQuery = (query: any, filters: Partial<Filters>) => {
  if (filters['dataset']) { query['dataset.id'] = filters['dataset']; }
  if (filters['trait']) { query['trait.id'] = filters['trait']; }

  if (filters['additionalFilters']) {
    Object.entries(filters['additionalFilters']).forEach(([k, v]) => {
      query[k] = v;
    });
  }

  const taxonField = filters['searchByTaxon'] === 'GBIF' ? 'subjectGBIFTaxon' : 'subjectFinBIFTaxon';
  HIGHER_TAXA.forEach(taxon => {
    if (filters[taxon]) {
      query[taxonField + '.higherTaxa.domain'] = filters[taxon];
    }
  });
  return query;
};

const getSearchApiQuery = (pageIdx: number, sorts: Sort[], filters: Partial<Filters>) => {
  const o: any = {
    pageSize: PAGE_SIZE,
    page: pageIdx + 1
  };

  addFiltersToApiQuery(o, filters);

  return o;
};

@Component({
  selector: 'laji-trait-search',
  templateUrl: './trait-search.component.html',
  styleUrls: ['./trait-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitSearchComponent implements OnInit, OnDestroy {
  initialFilters: Partial<Filters> | undefined;
  searchResult: SearchResult | undefined;
  pageSize = PAGE_SIZE;
  currentPageIdx = 0;
  loading = false;

  private searchResult$: Observable<{ res: SearchResponse; sorts: Sort[] }>;
  private pageIdxSubject = new Subject<number>();
  private sortSubject = new Subject<Sort[]>();
  private filterChangeSubject = new BehaviorSubject<Partial<Filters>>({});
  private subscription = new Subscription();

  constructor(
    private api: LajiApiClientBService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.searchResult$ = combineLatest([this.pageIdxSubject, this.sortSubject]).pipe(
      withLatestFrom(this.filterChangeSubject),
      tap(([[pageIdx, sorts], filters]) => {
        this.loading = true;
        this.setQueryParams(pageIdx, sorts, filters);
        this.cdr.markForCheck();
      }),
      switchMap(([[pageIdx, sorts], filters]) =>
        this.api.fetch('/trait/search', 'get', {
          query: getSearchApiQuery(pageIdx, sorts, filters)
        }).pipe(
          map(res => ({res, sorts}))
        )
      ),
      tap(res => {
        this.loading = false;
        this.searchResult = res;
        this.cdr.markForCheck();
      })
    );
  }

  ngOnInit(): void {
    this.subscription.add(
      this.searchResult$.subscribe()
    );

    this.route.queryParams.pipe(
      take(1),
      tap(params => {
        this.handleInitialQueryParams(params);
        this.filterChangeSubject.next(this.initialFilters!);
        this.pageIdxSubject.next(0);
        this.sortSubject.next([]);
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onFilterChange(filters: Partial<Filters>) {
    this.filterChangeSubject.next(filters);
  }

  onFilterSearchClicked() {
    this.pageIdxSubject.next(0);
  }

  onChangePageIdx(newPageIdx: number) {
    this.currentPageIdx = newPageIdx;
    this.pageIdxSubject.next(newPageIdx);
  }

  onSort(sorts: Sort[]) {
    this.sortSubject.next(sorts);
  }

  getDownloadUrl(): string {
    const queryParams = addFiltersToApiQuery({}, this.filterChangeSubject.getValue());
    const queryParamString = Object.entries(queryParams)
      .map(([k, v]) => k + '=' + v).join('&');
    return this.api.baseUrl + '/trait/search/download?' + queryParamString;
  }

  private handleInitialQueryParams(queryParams: QueryParams) {
    const filters = { ...queryParams };
    if (filters['page']) {
      this.currentPageIdx = filters['page'] - 1;
      delete filters['page'];
    }

    // parse prefixed additionalFilters
    const toRemove: (keyof typeof filters)[] = [];
    filters.additionalFilters = {} as AdditionalFilterValues;
    Object.entries(queryParams).filter(([k, v]) => k.includes('additionalFilters:')).forEach(([k, v]) => {
      const key = k.substring('additionalFilters:'.length) as unknown as keyof NonNullable<QueryParams['additionalFilters']>;
      filters.additionalFilters![key] = v as any;
      toRemove.push(k as keyof typeof filters);
    });
    toRemove.forEach(k => delete filters[k]);

    this.initialFilters = filters;
  }

  private setQueryParams(pageIdx: number, sorts: Sort[], filters: Partial<Filters>) {
    const q: QueryParams = { };
    if (pageIdx > 0) { q.page = pageIdx + 1; }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== filterDefaultValues[key as keyof typeof filters]) {
        if (isObject(value)) {
          // prefix nested values with the parents key
          Object.entries(value).forEach(([subKey, subValue]) => {
            q[key + ':' + subKey as unknown as keyof typeof filters] = subValue as any;
          });
        } else {
          q[key as keyof typeof filters] = value as any;
        }
      }
    });

    this.router.navigate([], { queryParams: q });
  }
}
