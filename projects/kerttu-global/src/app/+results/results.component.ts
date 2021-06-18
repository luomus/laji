import { Component } from '@angular/core';
import { IKerttuSpeciesFilters, IKerttuSpeciesQuery, IValidationStat } from '../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../kerttu-global-shared/service/kerttu-global-api';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'laji-about',
  template: `
    <div class="container">
      <h1>{{ 'results.title' | translate }}</h1>
      <laji-species-list-filters
        [query]="speciesQuery$ | async"
        [filters]="speciesFilters$ | async"
        [showOnlyUnvalidated]="false"
        (queryChange)="onSpeciesQueryChange($event)"
      ></laji-species-list-filters>
      <laji-validation-pie-chart
        [data]="validationStats$ | async"
      ></laji-validation-pie-chart>
    </div>
  `
})
export class ResultsComponent {
  speciesFilters$: Observable<IKerttuSpeciesFilters>;
  validationStats$: Observable<IValidationStat[]>;

  private speciesQuerySubject = new BehaviorSubject<IKerttuSpeciesQuery>({});
  speciesQuery$ = this.speciesQuerySubject.asObservable();

  constructor(
    private kerttuApi: KerttuGlobalApi
  ) {
    this.speciesFilters$ = this.kerttuApi.getSpeciesFilters();
    this.validationStats$ = this.speciesQuery$.pipe(
      switchMap(speciesQuery => {
        return this.kerttuApi.getValidationStats(speciesQuery).pipe(
          map(result => result.results),
          startWith(null)
        );
      })
    );
  }

  onSpeciesQueryChange(query: IKerttuSpeciesQuery) {
    this.speciesQuerySubject.next(query);
  }
}
