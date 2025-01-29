import { Component } from '@angular/core';
import { IGlobalSpeciesFilters, IGlobalSpeciesQuery, IUserStat, IValidationStat } from '../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';

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
  `
})
export class ResultsComponent {
  speciesFilters$: Observable<IGlobalSpeciesFilters>;
  validationStats$: Observable<IValidationStat[]|null>;
  userStats$: Observable<IUserStat[]|null>;

  private speciesQuerySubject = new BehaviorSubject<IGlobalSpeciesQuery>({});
  speciesQuery$ = this.speciesQuerySubject.asObservable();

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi
  ) {
    this.speciesFilters$ = this.kerttuGlobalApi.getSpeciesFilters();
    this.validationStats$ = this.speciesQuery$.pipe(
      switchMap(speciesQuery => this.kerttuGlobalApi.getValidationStats(speciesQuery).pipe(
          map(result => result.results),
          startWith(null)
        ))
    );
    this.userStats$ = this.speciesQuery$.pipe(
      switchMap(speciesQuery => this.kerttuGlobalApi.getUserStats(speciesQuery).pipe(
          map(result => result.results),
          startWith(null)
        ))
    );
  }

  onSpeciesQueryChange(query: IGlobalSpeciesQuery) {
    this.speciesQuerySubject.next(query);
  }
}
