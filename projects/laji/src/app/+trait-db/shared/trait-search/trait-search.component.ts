import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components, paths } from 'projects/laji-api-client-b/generated/api.d';
import { filter, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { Sort } from 'projects/laji-ui/src/lib/datatable/datatable.component';
import { FormValue } from './trait-search-filters/trait-search-filters.component';
import { ActivatedRoute, Router } from '@angular/router';
import { isObject } from '@luomus/laji-map/lib/utils';
import { AdditionalFilterValues, propIsArray } from './trait-search-filters/additional-filters.component';
import { environment } from 'projects/laji/src/environments/environment';
import { cols } from './trait-search-table-columns';
import { RankFilterValue } from './trait-search-filters/rank-filter/rank-filter.component';
import { Location } from '@angular/common';

type ApiQueryParams = paths['/trait/search']['get']['parameters']['query'];
type SearchResponse = paths['/trait/search']['get']['responses']['200']['content']['application/json'];
interface SearchParams { [key: string]: string };

type QueryParams = SearchParams & {
  page?: number;
};

interface SearchResult {
  res: SearchResponse;
  sorts: Sort[];
}

const PAGE_SIZE = 20;

const formValueToSearchParams = (form: Partial<FormValue>): SearchParams => {
  const searchParams: SearchParams = {};
  if (form['dataset']) { searchParams['dataset.id'] = form['dataset']; }
  if (form['trait']) { searchParams['trait.id'] = form['trait']; }

  if (form['rank']) {
    searchParams[
      `${
        form.rank.source === 'GBIF' ? 'subjectGBIFTaxon' : 'subjectFinBIFTaxon'
      }.higherTaxa.${form.rank.rank}`
    ] = form.rank.search;
  }

  if (form['additionalFilters']) {
    Object.entries(form['additionalFilters']).forEach(([k, v]) => {
      if (v) {
        searchParams[k] = v.toString();
      }
    });
  }

  return searchParams;
};

const getSearchApiQueryParams = (pageIdx: number, sorts: Sort[], filters: Partial<FormValue>): ApiQueryParams => ({
  // TODO sorts
  pageSize: PAGE_SIZE,
  page: pageIdx + 1,
  ...formValueToSearchParams(filters)
});

const queryParamsToFormValue = (queryParams: QueryParams): FormValue => {
  const form: FormValue = {
    dataset: queryParams['dataset.id'],
    trait: queryParams['trait.id'],
    additionalFilters: null,
    rank: null
  };

  const additionalFilters = {} as any;

  Object.entries(queryParams).forEach(([k, v]) => {
    if (k === 'dataset.id' || k === 'trait.id' || k === 'page') {
      return;
    }
    const higherTaxa = /subject(GBIF|FinBIF)Taxon\.higherTaxa\.(.*)/.exec(k);
    if (higherTaxa) {
      const [ _, source, rank ] = higherTaxa;
      form.rank = {
        search: v,
        rank: rank as any,
        source: source as any,
      };
      return;
    }

    let val = v as any;
    if (propIsArray(k as string)) {
      val = (val + '').split(',');
    }
    additionalFilters[k] = val;
  });
  form.additionalFilters = additionalFilters;

  return form;
};


@Component({
  selector: 'laji-trait-search',
  templateUrl: './trait-search.component.html',
  styleUrls: ['./trait-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitSearchComponent implements OnInit, OnDestroy {
  columns = cols.map(([prop, _]) => ({ title: prop as string, prop: prop as string, sortable: false }));
  initialFilters: FormValue | undefined;
  searchResult: SearchResult | undefined;
  pageSize = PAGE_SIZE;
  currentPageIdx = 0;
  loading = false;

  private searchResult$: Observable<{ res: SearchResponse; sorts: Sort[] }>;
  private pageIdxSubject = new Subject<number>();
  private sortSubject = new Subject<Sort[]>();
  private filterChangeSubject = new BehaviorSubject<Partial<FormValue>>({});
  private subscription = new Subscription();
  private queryParamChangeId = 0;

  constructor(
    private api: LajiApiClientBService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
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
          query: getSearchApiQueryParams(pageIdx, sorts, filters)
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
      this.searchResult$.subscribe(),
    );

    this.subscription.add(
      this.route.queryParams.pipe(
        filter(_ => {
          // ignore internal query param updates
          const state = this.location.getState() as any;
          return !(state['trait-search-ignore'] === this.queryParamChangeId);
        }),
        tap(queryParams => {
          this.initialFilters = queryParamsToFormValue(queryParams);
          this.filterChangeSubject.next(this.initialFilters!);
          this.currentPageIdx = (queryParams.page ?? 1) - 1;
          this.pageIdxSubject.next(this.currentPageIdx);
          this.sortSubject.next([]);
        })
      ).subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onFilterChange(filters: FormValue) {
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
    const queryParams = formValueToSearchParams(this.filterChangeSubject.getValue());
    const queryParamString = Object.entries(queryParams)
      .map(([k, v]) => k + '=' + v).join('&');
    return environment.apiBase + '/trait/search/download?' + queryParamString;
  }

  private setQueryParams(pageIdx: number, sorts: Sort[], form: Partial<FormValue>) {
    // TODO sorts
    const q: QueryParams = formValueToSearchParams(form);
    if (pageIdx > 0) { q.page = pageIdx + 1; }

    this.queryParamChangeId = Math.random() * Number.MAX_SAFE_INTEGER;
    this.router.navigate([], { queryParams: q, state: { 'trait-search-ignore': this.queryParamChangeId } });
  }
}
