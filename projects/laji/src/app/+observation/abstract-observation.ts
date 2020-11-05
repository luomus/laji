import { HostListener, Directive } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SearchQueryService } from './search-query.service';
import { ObservationFacade } from './observation.facade';
import { tap } from 'rxjs/operators';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class AbstractObservation {
  public activeTab$: Observable<string>;

  private subParam: Subscription;
  private subQuery: Subscription;

  protected observationFacade: ObservationFacade;
  protected route: ActivatedRoute;
  protected searchQuery: SearchQueryService;
  public skipUrlParams: string[] = [
    'selected',
    'pageSize',
    'page'
  ];

  init() {
    this.activeTab$ = this.observationFacade.activeTab$;
    this.subParam = this.route.params.subscribe(value => {
      this.observationFacade.activeTab(value['tab'] || 'map');
    });
    this.subQuery = this.observationFacade.query$.pipe(
      tap(query => {
        this.onQueryChange(query);
        this.updateUrlQueryParamsFromQuery(query);
      })
    ).subscribe();
    this.updateQueryFromQueryParams(this.route.snapshot.queryParams);
  }

  destroy() {
    if (this.subParam) {
      this.subParam.unsubscribe();
    }
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
  }

  @HostListener('window:popstate')
  onPopState() {
    // Route snapshot is not populated with the latest info when this event is triggered. So we need to delay the execution little.
    setTimeout(() => {
      this.updateQueryFromQueryParams(this.route.snapshot.queryParams);
    }, 1);
  }

  private updateUrlQueryParamsFromQuery(query: WarehouseQueryInterface) {
    this.searchQuery.updateUrl(query, this.skipUrlParams);
  }

  private updateQueryFromQueryParams(queryParams) {
    const query = this.searchQuery.getQueryFromUrlQueryParams(queryParams);
    if (queryParams['target']) {
      query.target = [queryParams['target']];
    }
    this.observationFacade.updateQuery(query);
  }

  protected onQueryChange(query: WarehouseQueryInterface) { }
}
