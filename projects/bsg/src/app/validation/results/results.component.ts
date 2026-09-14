import { Component } from '@angular/core';
import { SpeciesFilters, SpeciesQuery, ValidationUserStatistics, ValidationCountStatistics } from '../../bsg-shared/models';
import { BsgApi } from '../../bsg-shared/service/bsg-api';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs';

@Component({
    selector: 'bsg-results',
    template: `
    <h1>{{ 'results.title' | translate }}</h1>
    <bsg-species-list-filters
      [query]="(speciesQuery$ | async) ?? {}"
      [filters]="(speciesFilters$ | async) ?? undefined"
      [showOnlyUnvalidated]="false"
      [showSearch]="false"
      (queryChange)="onSpeciesQueryChange($event)"
    ></bsg-species-list-filters>
    <h2>{{ 'results.pie.title' | translate }}</h2>
    <bsg-validation-pie-chart
      [data]="(validationStats$ | async) ?? undefined"
    ></bsg-validation-pie-chart>
    <h2>{{ 'results.userTable.title' | translate }}</h2>
    <bsg-user-table
      [data]="(userStats$ | async) ?? undefined"
    ></bsg-user-table>
  `,
    standalone: false
})
export class ResultsComponent {
  speciesFilters$: Observable<SpeciesFilters>;
  validationStats$: Observable<ValidationCountStatistics[]|null>;
  userStats$: Observable<ValidationUserStatistics[]|null>;

  private speciesQuerySubject = new BehaviorSubject<SpeciesQuery>({});
  speciesQuery$ = this.speciesQuerySubject.asObservable();

  constructor(
    private bsgApi: BsgApi
  ) {
    this.speciesFilters$ = this.bsgApi.getSpeciesFilters();
    this.validationStats$ = this.speciesQuery$.pipe(
      switchMap(speciesQuery => this.bsgApi.getValidationCountStatistics(speciesQuery).pipe(
          map(result => result.results),
          startWith(null)
        ))
    );
    this.userStats$ = this.speciesQuery$.pipe(
      switchMap(speciesQuery => this.bsgApi.getValidationUserStatistics(speciesQuery).pipe(
          map(result => result.results),
          startWith(null)
        ))
    );
  }

  onSpeciesQueryChange(query: SpeciesQuery) {
    this.speciesQuerySubject.next(query);
  }
}
