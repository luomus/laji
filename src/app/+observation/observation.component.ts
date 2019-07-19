import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SearchQueryService } from './search-query.service';
import { ObservationFacade } from './observation.facade';
import { tap } from 'rxjs/operators';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';

@Component({
  selector: 'laji-observation',
  templateUrl: './observation.component.html',
  styles: [`
    :host {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
      z-index: auto;
    }
  `],
  providers: [SearchQueryService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationComponent implements OnInit, OnDestroy {
  public activeTab$: Observable<string>;

  private subParam: Subscription;
  private subQuery: Subscription;

  constructor(
    private observationFacade: ObservationFacade,
    private route: ActivatedRoute,
    private searchQuery: SearchQueryService
  ) {
  }

  ngOnInit() {
    this.observationFacade.hideFooter();
    this.activeTab$ = this.observationFacade.activeTab$;
    this.subParam = this.route.params.subscribe(value => {
      this.observationFacade.activeTab(value['tab'] || 'map');
    });
    this.subQuery = this.observationFacade.query$.pipe(
      tap(query => this.updateUrlQueryParamsFromQuery(query))
    ).subscribe();
    this.updateQueryFromQueryParams(this.route.snapshot.queryParams);
  }

  ngOnDestroy() {
    this.observationFacade.showFooter();
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
    });
  }

  private updateUrlQueryParamsFromQuery(query: WarehouseQueryInterface) {
    this.searchQuery.updateUrl(query, [
      'selected',
      'pageSize',
      'page'
    ]);
  }

  private updateQueryFromQueryParams(queryParams) {
    const query = this.searchQuery.getQueryFromUrlQueryParams(queryParams);
    if (queryParams['target']) {
      query.target = [queryParams['target']];
    }
    this.observationFacade.updateQuery(query);
  }
}
