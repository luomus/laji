import { HostListener, Directive } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SearchQueryService } from './search-query.service';
import { ObservationFacade } from './observation.facade';
import { switchMap, take, tap } from 'rxjs/operators';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';

@Directive()
export abstract class AbstractObservation {
  public activeTab$: Observable<string>;

  private subscription = new Subscription();
  private qpUpdate = new Subject<void>();

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
    this.subscription.add(
      this.route.params.subscribe(value => {
        this.observationFacade.activeTab(value['tab'] || 'map');
      })
    );
    this.qpUpdate.pipe(take(1)).subscribe(() => { // avoid query params being overwritten
      this.subscription.add(
        this.observationFacade.query$.subscribe(query => {
          this.onQueryChange(query);
          this.updateUrlQueryParamsFromQuery(query);
        })
      );
    });
    this.subscription.add(
      this.route.queryParams.pipe(switchMap(qparams => this.updateQueryFromQueryParams$(qparams))).subscribe(() => {
        this.qpUpdate.next();
      })
    );
  }

  destroy() {
    this.qpUpdate.complete();
    this.subscription.unsubscribe();
  }

  @HostListener('window:popstate')
  onPopState() {
    // Route snapshot is not populated with the latest info when this event is triggered. So we need to delay the execution little.
    setTimeout(() => {
      this.updateQueryFromQueryParams$(this.route.snapshot.queryParams).subscribe();
    }, 1);
  }

  private updateUrlQueryParamsFromQuery(query: WarehouseQueryInterface) {
    this.searchQuery.updateUrl(query, this.skipUrlParams);
  }

  private updateQueryFromQueryParams$(queryParams): Observable<any> {
    const query = this.searchQuery.getQueryFromUrlQueryParams(queryParams);
    if (queryParams['target']) {
      query.target = [queryParams['target']];
    }
    return this.observationFacade.updateQuery$(query);
  }

  protected onQueryChange(query: WarehouseQueryInterface) { }
}
