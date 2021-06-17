import { Component } from '@angular/core';
import { IKerttuSpeciesFilters, IKerttuSpeciesQuery } from '../kerttu-global-shared/models';
import { Observable } from 'rxjs';
import { KerttuGlobalApi } from '../kerttu-global-shared/service/kerttu-global-api';

@Component({
  selector: 'laji-about',
  template: `
    <div class="container">
      <h1>{{ 'results.title' | translate }}</h1>
      <laji-species-list-filters
        [query]="speciesQuery"
        [filters]="speciesFilters$ | async"
        [showOnlyUnvalidated]="false"
        (queryChange)="onSpeciesQueryChange($event)"
      ></laji-species-list-filters>
    </div>
  `
})
export class ResultsComponent {
  speciesQuery: IKerttuSpeciesQuery = { page: 1, onlyUnvalidated: false };
  speciesFilters$: Observable<IKerttuSpeciesFilters>;

  constructor(
    private kerttuApi: KerttuGlobalApi
  ) {
    this.speciesFilters$ = this.kerttuApi.getSpeciesFilters();
  }

  onSpeciesQueryChange(query: IKerttuSpeciesQuery) {

  }
}
